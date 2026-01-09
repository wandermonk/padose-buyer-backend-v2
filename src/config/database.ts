// Set DATABASE_URL from SUPABASE_DATABASE_URL before importing Prisma
if (process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
}

import { PrismaClient } from '@prisma/client';
import { config } from './env';

// Singleton pattern for Prisma Client
// Prisma connects to Supabase PostgreSQL database via DATABASE_URL
// DATABASE_URL is set from SUPABASE_DATABASE_URL if available
let prisma: PrismaClient;

export function getPrismaClient(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
  }
  return prisma;
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
  }
}

