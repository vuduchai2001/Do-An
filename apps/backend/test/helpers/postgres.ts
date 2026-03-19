import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Pool as PgPool } from 'pg';
import pg from 'pg';

const { Client, Pool } = pg;

const CURRENT_DIR = fileURLToPath(new URL('.', import.meta.url));
const BACKEND_ROOT = resolve(CURRENT_DIR, '../..');
const MIGRATIONS_DIR = join(BACKEND_ROOT, 'migrations');
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://cliproxy:cliproxy@localhost:5432/cliproxy';

export function createTestPool(): PgPool {
  return new Pool({ connectionString: DATABASE_URL });
}

export async function applyTestMigrations(): Promise<void> {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    const migration = readFileSync(
      join(MIGRATIONS_DIR, '0001_init_providers_accounts_oauth_sessions.sql'),
      'utf8',
    );
    await client.query(migration);
  } finally {
    await client.end();
  }
}

export async function resetTestDatabase(): Promise<void> {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    await client.query(
      'TRUNCATE TABLE oauth_sessions, accounts, providers RESTART IDENTITY CASCADE',
    );
  } finally {
    await client.end();
  }
}
