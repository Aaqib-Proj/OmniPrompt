import { Request, Response, NextFunction } from 'express';

/**
 * Timeout guard to sever hanging or stalled HTTP connections (anti-Slowloris)
 * @param timeoutMs Maximum milliseconds before timing out (default: 25,000ms)
 */
export const requestTimeoutGuard = (timeoutMs: number = 25000) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const timer = setTimeout(() => {
      if (!res.headersSent) {
        res.status(504).json({
          error: 'Gateway Timeout: The server took too long to respond to your request.',
          code: 'REQUEST_TIMEOUT',
        });
      }
    }, timeoutMs);

    // Clear timer when response finishes
    res.on('finish', () => clearTimeout(timer));
    res.on('close', () => clearTimeout(timer));

    next();
  };
};
