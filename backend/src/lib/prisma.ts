import { PrismaClient } from '@prisma/client';

const globalAny = global as any;
export const prisma: PrismaClient =
  globalAny.__PRISMA__ || new PrismaClient({ log: ['error', 'warn'] });

if (!globalAny.__PRISMA__) globalAny.__PRISMA__ = prisma;
