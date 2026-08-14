import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * True when a write failed because it would duplicate a unique column — a slug
 * that is already taken, most often. Worth telling apart from a real fault:
 * "that slug already exists" is something the admin can fix, a generic 500 is
 * not, and it is the single most likely reason a save is rejected.
 */
export function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    (error as { code?: unknown }).code === 'P2002'
  );
}
