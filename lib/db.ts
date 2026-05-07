import { PrismaClient, Prisma } from '@prisma/client';

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaLogLevels: Prisma.LogLevel[] =
  process.env.NODE_ENV === 'development' &&
  process.env.PRISMA_LOG_QUERIES === 'true'
    ? ['query']
    : [];

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: prismaLogLevels,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

/**
 * Reintenta una operación de Prisma hasta 3 veces con backoff.
 * Absorbe el cold start de PgBouncer (P1001) en Supabase.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
  delayMs = 300,
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (err: unknown) {
      lastError = err;
      // Prisma 6: PrismaClientInitializationError usa errorCode, PrismaClientKnownRequestError usa code
      const e = err as { code?: string; errorCode?: string; message?: string };
      const code = e?.code ?? e?.errorCode ?? '';
      const isConnectionError =
        code === 'P1001' ||
        code === 'P1002' ||
        (typeof e?.message === 'string' && e.message.includes("Can't reach database server"));
      if (!isConnectionError || i === retries - 1) throw err;
      await new Promise(res => setTimeout(res, delayMs));
    }
  }
  throw lastError;
}
