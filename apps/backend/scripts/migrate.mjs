import { readdir, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';

const { Client } = pg;

const CURRENT_DIR = dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = resolve(CURRENT_DIR, '..');
const MIGRATIONS_DIR = join(BACKEND_ROOT, 'migrations');
const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://cliproxy:cliproxy@localhost:5432/cliproxy';

async function ensureMigrationTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedVersions(client) {
  const result = await client.query('SELECT version FROM schema_migrations');
  return new Set(result.rows.map((row) => row.version));
}

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    await ensureMigrationTable(client);
    const appliedVersions = await getAppliedVersions(client);
    const files = (await readdir(MIGRATIONS_DIR)).filter((file) => file.endsWith('.sql')).sort();

    for (const file of files) {
      if (appliedVersions.has(file)) {
        continue;
      }

      const sql = await readFile(join(MIGRATIONS_DIR, file), 'utf8');

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query('INSERT INTO schema_migrations(version) VALUES ($1)', [file]);
        await client.query('COMMIT');
        console.warn(`Applied migration: ${file}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('Migration failed:', error);
  process.exitCode = 1;
});
