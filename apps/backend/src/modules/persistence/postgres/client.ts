import { Pool } from 'pg';
import type { PostgresConfig } from '../../../core/config/index.js';

export function createPostgresPool(config: PostgresConfig): Pool {
  return new Pool({
    connectionString: config.url,
  });
}

export async function closePostgresPool(pool: Pool): Promise<void> {
  await pool.end();
}
