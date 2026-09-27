import { Router } from 'express';
import { safeError } from '../utils/errors.js';

const router = Router();

const DEFAULT_BASE_URL = 'https://api.higgsfield.ai';

function resolveBaseUrl(): string {
  return (process.env.HF_API_BASE_URL || DEFAULT_BASE_URL).replace(/\/$/, '');
}

function resolveApiKey(req: any): string | null {
  const customHeader = req.headers['x-higgsfield-key'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  const envKey = process.env.HIGGSFIELD_API_KEY || process.env.HF_API_KEY;
  if (typeof envKey === 'string' && envKey.trim()) {
    return envKey.trim();
  }
  return null;
}

function formatAuthHeader(apiKey: string): string {
  const clean = apiKey.trim();
  if (clean.toLowerCase().startsWith('key ')) return clean;
  return `Key ${clean}`;
}

// GET /api/v1/higgsfield/config — report if server has default key configured
router.get('/config', (_req, res) => {
  const serverKey = process.env.HIGGSFIELD_API_KEY || process.env.HF_API_KEY;
  res.json({
    hasServerKey: !!(serverKey && serverKey.trim()),
    baseUrl: resolveBaseUrl(),
  });
});

// POST /api/v1/higgsfield/generate — submit generation request to Higgsfield
router.post('/generate', async (req, res): Promise<void> => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      res.status(401).json({
        error: 'Missing platform key. Please configure your Higgsfield API key (id:secret) in settings or the server environment.',
      });
      return;
    }

    const { path: modelPath, body } = req.body;
    if (!modelPath || typeof modelPath !== 'string') {
      res.status(400).json({ error: 'Missing or invalid model path' });
      return;
    }

    const cleanPath = modelPath.startsWith('/') ? modelPath : `/${modelPath}`;
    const targetUrl = `${resolveBaseUrl()}${cleanPath}`;

    console.info(`[higgsfield] Forwarding generation submit -> ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Authorization': formatAuthHeader(apiKey),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body || {}),
    });

    const text = await response.text();
    let data: any;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = { raw: text };
    }

    if (!response.ok) {
      console.warn(`[higgsfield] Submit failed (${response.status}):`, data);
      res.status(response.status).json(data || { error: `Higgsfield API error (${response.status})` });
      return;
    }

    // Map queued response format expected by client
    const requestId = data?.request_id || data?.requestId;
    if (!requestId) {
      res.status(502).json({ error: 'Platform response missing request_id', raw: data });
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
    res.status(500).json({ error: safeError(err, 'Failed to submit generation request') });
  }
});

// POST /api/v1/higgsfield/status — poll statuses for request IDs in parallel
router.post('/status', async (req, res): Promise<void> => {
  try {
    const apiKey = resolveApiKey(req);
    if (!apiKey) {
      res.status(401).json({ error: 'Missing platform key' });
      return;
    }

    const { requestIds } = req.body;
    if (!Array.isArray(requestIds) || requestIds.length === 0) {
      res.status(400).json({ error: 'Invalid or empty requestIds list' });
      return;
    }

    const baseUrl = resolveBaseUrl();
    const auth = formatAuthHeader(apiKey);

    const results = await Promise.all(
      requestIds.map(async (requestId: string) => {
        try {
          const url = `${baseUrl}/requests/${encodeURIComponent(requestId)}/status`;
          const resp = await fetch(url, {
            headers: { Authorization: auth },
          });

          const text = await resp.text();
          let data: any;
          try {
            data = text ? JSON.parse(text) : {};
          } catch {
            data = { raw: text };
          }

          if (!resp.ok) {
            return {
              requestId,
              error: data?.detail || data?.message || data?.error || `HTTP ${resp.status}`,
            };
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
          return {
            requestId,
            error: subErr?.message || 'Network error polling status',
          };
        }
      })
    );

    res.json(results);
  } catch (err: any) {
    console.error('[higgsfield] Status polling error:', err);
    res.status(500).json({ error: safeError(err, 'Failed to poll generation status') });
  }
});

export default router;
