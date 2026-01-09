import dotenv from 'dotenv';

dotenv.config();

// Map SUPABASE_DATABASE_URL to DATABASE_URL for Prisma if not already set
if (process.env.SUPABASE_DATABASE_URL && !process.env.DATABASE_URL) {
  process.env.DATABASE_URL = process.env.SUPABASE_DATABASE_URL;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL || '',
} as const;

// Validate required environment variables
// SUPABASE_DATABASE_URL should be Supabase PostgreSQL connection string
// Format: postgresql://postgres:[PASSWORD]@[HOST]:[PORT]/postgres?pgbouncer=true&connection_limit=1
if (!config.databaseUrl) {
  throw new Error('SUPABASE_DATABASE_URL or DATABASE_URL is required in .env file. Use Supabase PostgreSQL connection string.');
}

