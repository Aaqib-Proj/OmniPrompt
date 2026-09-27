import rateLimit from 'express-rate-limit';

// Global API rate limiter: 300 requests per 15 minutes per IP
export const globalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP. Please wait a few minutes before trying again.',
    code: 'RATE_LIMIT_EXCEEDED'
  }
});

// Strict limiter for authentication endpoints: 15 attempts per 15 minutes (Anti-Brute Force)
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many login or registration attempts. Please try again in 15 minutes.',
    code: 'AUTH_RATE_LIMIT_EXCEEDED'
  }
});

// Creation limiter for prompts and uploads: 30 creates/uploads per 15 minutes (Anti-Spam)
export const createActionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Content creation rate limit reached. Please wait a few minutes before creating or uploading more.',
    code: 'CREATION_LIMIT_EXCEEDED'
  }
});
