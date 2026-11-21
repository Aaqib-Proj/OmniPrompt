import { Router } from 'express';
import { z } from 'zod';
import { safeError } from '../utils/errors.js';
import { optionalAuth, AuthenticatedRequest } from '../middleware/auth.js';
import { generationLimiter } from '../middleware/rateLimiters.js';

const router = Router();

const DEFAULT_BASE_URL = 'https://api.higgsfield.ai';

// Upstream calls get a hard ceiling so a hung vendor request can't pin one of our
// few worker slots for the whole 25s request-timeout window.
const UPSTREAM_TIMEOUT_MS = 20000;

// Model paths are vendor-namespaced (e.g. "kling-video/v3.0/pro"). Only these
// namespaces may be reached, so a caller can't point the proxy — carrying our key —
// at account, billing or key-management endpoints on the same host.
const ALLOWED_VENDORS = new Set([
  'alibaba',
  'blackforestlabs',
  'bytedance',
  'higgsfield-ai',
  'ideogram',
  'kling-video',
  'lightricks',
  'minimax',
  'pixverse',
  'recraft',
  'wan',
  'xai',
  'z-image',
]);

const PATH_SEGMENT = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Returns the normalised vendor path, or null if it isn't one we're willing to proxy. */
function safeModelPath(raw: string): string | null {
  const trimmed = raw.trim().replace(/^\/+/, '').replace(/\/+$/, '');
  if (!trimmed || trimmed.length > 160) return null;

  const segments = trimmed.split('/');
  if (segments.length < 2 || segments.length > 6) return null;
  // Rejects "", ".", ".." and anything with a slash-escape or query/fragment smuggled in.
  if (!segments.every((s) => PATH_SEGMENT.test(s))) return null;
  if (!ALLOWED_VENDORS.has(segments[0])) return null;

  return `/${segments.join('/')}`;
}

const GenerateSchema = z.object({
  path: z.string().min(1).max(200),
  body: z.record(z.unknown()).optional(),
});

const StatusSchema = z.object({
  // Each poll fans out to one upstream call per id, so the list is capped to keep
  // this endpoint from being used to amplify traffic through our server.
  requestIds: z.array(z.string().regex(/^[A-Za-z0-9_-]{8,64}$/)).min(1).max(25),
});

function resolveBaseUrl(): string {
  return (process.env.HF_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

type KeySource = 'caller' | 'server';

/**
 * A caller may bring their own key, which they pay for. Falling back to the key on
 * the server spends *our* credits, so that path is reserved for signed-in accounts.
 */
function resolveApiKey(req: AuthenticatedRequest): { key: string; source: KeySource } | null {
  const customHeader = req.headers['x-higgsfield-key'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return { key: customHeader.trim(), source: 'caller' };
  }
  const envKey = process.env.HIGGSFIELD_API_KEY || process.env.HF_API_KEY;
  if (typeof envKey === 'string' && envKey.trim()) {
    return { key: envKey.trim(), source: 'server' };
  }
  return null;
}

/** 401 responses, written once so the two handlers can't drift apart. */
const KEY_REQUIRED = {
  error: 'Add your Higgsfield API key (id:secret) in Studio settings to generate.',
};
const SIGN_IN_REQUIRED = {
  error: 'Sign in to generate with the built-in platform key, or add your own key in Studio settings.',
};

function authorizeKey(req: AuthenticatedRequest) {
  const resolved = resolveApiKey(req);
  if (!resolved) return { ok: false as const, status: 401, payload: KEY_REQUIRED };
  if (resolved.source === 'server' && !req.user) {
    return { ok: false as const, status: 401, payload: SIGN_IN_REQUIRED };
  }
  return { ok: true as const, key: resolved.key, source: resolved.source };
}

function formatAuthHeader(apiKey: string): string {
  const clean = apiKey.trim();
  if (clean.toLowerCase().startsWith('key ')) return clean;
  return `Key ${clean}`;
}

/**
 * Upstream error bodies can echo back request detail we'd rather not hand to an
 * arbitrary caller, so only a short human message is forwarded.
 */
function upstreamMessage(data: any, status: number): string {
  const candidate = data?.detail || data?.message || data?.error;
  if (typeof candidate === 'string' && candidate.length <= 300) return candidate;
  return `Platform rejected the request (${status}).`;
}

async function callUpstream(url: string, init: RequestInit) {
  const response = await fetch(url, { ...init, signal: AbortSignal.timeout(UPSTREAM_TIMEOUT_MS) });
  const text = await response.text();
  let data: any;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = { raw: text };
  }
  return { response, data };
}

// GET /api/v1/higgsfield/config — whether this caller can generate without supplying
// their own key. Never reveals the key itself. `canUseServerKey` answers the question
// the client actually has, since the server key is only available to signed-in users.
router.get('/config', optionalAuth, (req: AuthenticatedRequest, res) => {
  const serverKey = process.env.HIGGSFIELD_API_KEY || process.env.HF_API_KEY;
  const hasServerKey = !!(serverKey && serverKey.trim());
  res.json({
    hasServerKey,
    canUseServerKey: hasServerKey && !!req.user,
    baseUrl: resolveBaseUrl(),
  });
});

// POST /api/v1/higgsfield/generate — submit a generation request to Higgsfield
router.post('/generate', generationLimiter, optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const auth = authorizeKey(req);
    if (!auth.ok) {
      res.status(auth.status).json(auth.payload);
      return;
    }

    const parsed = GenerateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Missing or invalid model path' });
      return;
    }

    const cleanPath = safeModelPath(parsed.data.path);
    if (!cleanPath) {
      res.status(400).json({ error: 'Unsupported model path' });
      return;
    }

    const targetUrl = `${resolveBaseUrl()}${cleanPath}`;
    console.info(`[higgsfield] Forwarding generation submit -> ${targetUrl} (key: ${auth.source})`);

    const { response, data } = await callUpstream(targetUrl, {
      method: 'POST',
      headers: {
        Authorization: formatAuthHeader(auth.key),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(parsed.data.body || {}),
    });

    if (!response.ok) {
      console.warn(`[higgsfield] Submit failed (${response.status}):`, data);
      res.status(response.status).json({ error: upstreamMessage(data, response.status) });
      return;
    }

    const requestId = data?.request_id || data?.requestId;
    if (!requestId) {
      res.status(502).json({ error: 'Platform response missing request_id' });
      return;
    }

    res.json({
      status: data.status || 'queued',
      requestId,
      statusUrl: data.status_url || data.statusUrl || '',
      cancelUrl: data.cancel_url || data.cancelUrl || '',
    });
  } catch (err: any) {
    console.error('[higgsfield] Submit error:', err);
    res.status(502).json({ error: safeError(err, 'Failed to submit generation request') });
  }
});

// POST /api/v1/higgsfield/status — poll statuses for request IDs in parallel
router.post('/status', optionalAuth, async (req: AuthenticatedRequest, res): Promise<void> => {
  try {
    const auth = authorizeKey(req);
    if (!auth.ok) {
      res.status(auth.status).json(auth.payload);
      return;
    }

    const parsed = StatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid or empty requestIds list' });
      return;
    }

    const baseUrl = resolveBaseUrl();
    const authHeader = formatAuthHeader(auth.key);

    const results = await Promise.all(
      parsed.data.requestIds.map(async (requestId: string) => {
        try {
          const url = `${baseUrl}/requests/${encodeURIComponent(requestId)}/status`;
          const { response, data } = await callUpstream(url, {
            headers: { Authorization: authHeader },
          });

          if (!response.ok) {
            return { requestId, error: upstreamMessage(data, response.status) };
          }

          const images = Array.isArray(data.images)
            ? data.images.flatMap((item: any) => (typeof item?.url === 'string' ? [{ url: item.url }] : []))
            : undefined;
          const videoUrl = typeof data.video?.url === 'string' ? data.video.url : undefined;

          return {
            requestId,
            status: {
              status: data.status || 'unknown',
              requestId,
              ...(images?.length ? { images } : {}),
              ...(videoUrl ? { video: { url: videoUrl } } : {}),
              ...(data.error !== undefined ? { error: data.error } : {}),
            },
          };
        } catch (subErr: any) {
          return { requestId, error: 'Network error polling status' };
        }
      })
    );

    res.json(results);
  } catch (err: any) {
    console.error('[higgsfield] Status polling error:', err);
    res.status(502).json({ error: safeError(err, 'Failed to poll generation status') });
  }
});

export default router;
