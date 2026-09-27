/**
 * Internal error details (Prisma messages in particular) name the database,
 * user and host, so they must never reach an HTTP client in production.
 * The full error is logged server-side instead.
 */
export const safeError = (err: unknown, fallback: string): string => {
  console.error(`API Error [${fallback}]:`, err);

  if (process.env.NODE_ENV !== 'production') {
    const message = (err as { message?: string })?.message;
    if (message) return message;
  }

  return fallback;
};
