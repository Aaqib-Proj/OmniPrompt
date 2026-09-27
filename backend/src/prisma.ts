import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// MySQL in production uses the driver adapter (pure JS, via mariadb) instead of
// the native query-engine binary, which panics ("timer has gone away") in
// hosting sandboxes that freeze/thaw idle processes.
const createClient = () => {
  const logLevels: ('warn' | 'error')[] = process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'];

  if (process.env.DATABASE_URL?.startsWith('mysql://')) {
    const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
    const url = new URL(process.env.DATABASE_URL);
    const adapter = new PrismaMariaDb({
      host: url.hostname,
      port: Number(url.port || 3306),
      user: decodeURIComponent(url.username),
      password: decodeURIComponent(url.password),
      database: url.pathname.replace(/^\//, ''),
      connectTimeout: 8000,
      socketTimeout: 8000,
      acquireTimeout: 8000,
      ssl: { rejectUnauthorized: false },
      connectionLimit: 5,
    });
    return new PrismaClient({ adapter, log: logLevels });
  }

  return new PrismaClient({ log: logLevels });
};

export const prisma = globalForPrisma.prisma || createClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
