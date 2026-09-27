import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import helmet from 'helmet';
import compression from 'compression';

import { prisma } from './prisma.js';
import { safeError } from './utils/errors.js';
import { globalApiLimiter, authLimiter, createActionLimiter } from './middleware/rateLimiters.js';
import { memoryCacheMiddleware } from './middleware/cache.js';
import { requestTimeoutGuard } from './middleware/timeout.js';
import { flushViewBuffer } from './services/viewBuffer.js';

import authRoutes from './routes/auth.js';
import promptRoutes from './routes/prompts.js';
import modelRoutes from './routes/models.js';
import categoryRoutes from './routes/categories.js';
import userRoutes from './routes/users.js';
import collectionRoutes from './routes/collections.js';
import packRoutes from './routes/packs.js';
import challengeRoutes from './routes/challenges.js';
import statsRoutes from './routes/stats.js';
import publicRoutes from './routes/public.js';
import uploadRoutes from './routes/upload.js';
import higgsfieldRoutes from './routes/higgsfield.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Trust reverse proxy (Nginx, Cloudflare, Hostinger) for accurate client IP rate limiting
app.set('trust proxy', 1);

// 1. HTTP Security Headers (Anti-XSS, clickjacking, MIME sniffing)
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  crossOriginEmbedderPolicy: false,
}));

// 2. HTTP Bandwidth Compression (Gzip / Brotli)
app.use(compression());

// 3. Slowloris & Request Timeout Guard (25s max)
app.use(requestTimeoutGuard(25000));

// 4. CORS — fail closed. If CORS_ORIGIN is unset (e.g. env wiped), fall back to the
// known production frontend, never to "*" (which with credentials is both unsafe
// and browser-rejected). Supports a comma-separated allowlist.
const allowedOrigins = (process.env.CORS_ORIGIN || 'https://lavender-jay-758355.hostingersite.com')
  .split(',')
  .map((o) => o.trim())
  .filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    // Non-browser clients (no Origin header) are allowed; browser origins must match.
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

// 5. Body Parsers — small global limit. Only the authenticated, rate-limited upload
// route (mounted below) accepts large base64 payloads, so an anonymous caller can no
// longer exhaust memory with a giant JSON body.
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 6. Media downloaded by prisma/import-open-datasets.ts and user uploads
app.use('/media', express.static(path.resolve(process.cwd(), process.env.MEDIA_DIR || 'media'), { maxAge: '7d' }));

// 7. Global Anti-DoS Rate Limiter on all API routes
app.use('/api/', globalApiLimiter);

// Health Check (Bypasses caching and heavy processing)
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: 'OmniPrompt API', time: new Date().toISOString() });
});

// 8. Mount Routes with specialized protections & caching
app.use('/api/v1/auth', authLimiter, authRoutes);
// Upload accepts base64-in-JSON (a 25MB file ≈ 34MB encoded), so it gets its own
// larger parser. requireAuth is enforced inside the route.
app.use('/api/v1/upload', createActionLimiter, express.json({ limit: '35mb' }), uploadRoutes);
app.use('/api/v1/prompts', promptRoutes);
app.use('/api/v1/models', memoryCacheMiddleware(60), modelRoutes);
app.use('/api/v1/categories', memoryCacheMiddleware(60), categoryRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/packs', memoryCacheMiddleware(30), packRoutes);
app.use('/api/v1/challenges', memoryCacheMiddleware(30), challengeRoutes);
app.use('/api/v1/stats', memoryCacheMiddleware(30), statsRoutes);
app.use('/api/v1/public', memoryCacheMiddleware(15), publicRoutes);
app.use('/api/v1/higgsfield', higgsfieldRoutes);

// Global Error Handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(500).json({ error: safeError(err, 'Internal Server Error') });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 OmniPrompt Server running on http://localhost:${PORT} (PID: ${process.pid})`);
});

prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch((err) => console.error('❌ Database connection failed:', err.message || err));

// Graceful Shutdown on SIGTERM and SIGINT
const handleGracefulShutdown = async (signal: string) => {
  console.log(`\n🛑 Received ${signal}. Closing server gracefully...`);
  server.close(async () => {
    console.log('HTTP connections closed.');
    try {
      await flushViewBuffer();
      console.log('Buffered views flushed to database.');
      await prisma.$disconnect();
      console.log('Prisma database client disconnected.');
    } catch (e) {
      console.error('Error during database shutdown:', e);
    }
    process.exit(0);
  });

  // Force close after 10s if connections fail to close
  setTimeout(() => {
    console.error('Forcefully exiting after 10s timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => handleGracefulShutdown('SIGTERM'));
process.on('SIGINT', () => handleGracefulShutdown('SIGINT'));

export default app;
