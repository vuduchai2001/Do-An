import pg from 'pg';

const { Client } = pg;

const DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://cliproxy:cliproxy@localhost:5432/cliproxy';

async function run() {
  const client = new Client({ connectionString: DATABASE_URL });
  await client.connect();

  try {
    await client.query('DROP TABLE IF EXISTS oauth_sessions CASCADE');
    await client.query('DROP TABLE IF EXISTS accounts CASCADE');
    await client.query('DROP TABLE IF EXISTS providers CASCADE');
    await client.query('DROP TABLE IF EXISTS schema_migrations CASCADE');
    console.warn('Database reset completed.');
  } finally {
    await client.end();
  }
}

run().catch((error) => {
  console.error('Database reset failed:', error);
  process.exitCode = 1;
});
