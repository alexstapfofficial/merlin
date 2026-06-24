import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client';

// Reuse a single PrismaClient across requests / HMR reloads to avoid
// exhausting the database connection pool. The Prisma 7 client requires a
// driver adapter; the connection string comes from DATABASE_URL.
let prisma;

export function usePrisma() {
  if (!prisma) {
    prisma =
      globalThis.__prisma ??
      new PrismaClient({
        adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
      });
    if (process.env.NODE_ENV !== 'production') {
      globalThis.__prisma = prisma;
    }
  }
  return prisma;
}
