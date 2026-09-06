import { Pool, PoolConfig } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

function parseDatabaseUrl(url?: string): PoolConfig {
  if (!url) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  // Handle postgresql://user:password@host:port/database
  const match = url.match(/^postgres(?:ql)?:\/\/([^:]+):(.*)@([^:]+):(\d+)\/(.*)$/);
  if (match) {
    const [, user, rawPassword, host, portStr, database] = match;
    let password = rawPassword;
    // Strip surrounding brackets if placeholder style [password] was used
    if (password.startsWith('[') && password.endsWith(']')) {
      password = password.slice(1, -1);
    }
    return {
      user: decodeURIComponent(user),
      password: decodeURIComponent(password),
      host,
      port: parseInt(portStr, 10),
      database,
      ssl: { rejectUnauthorized: false },
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    };
  }

  return {
    connectionString: url,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
  };
}

let pool: Pool | null = null;

export function getDbPool(): Pool {
  if (!pool) {
    const config = parseDatabaseUrl(process.env.DATABASE_URL);
    pool = new Pool(config);

    pool.on('error', (err) => {
      console.error('[PostgreSQL Pool Error]:', err.message);
    });
  }
  return pool;
}

export async function query<T = any>(text: string, params?: any[]): Promise<{ rows: T[]; rowCount: number | null }> {
  const p = getDbPool();
  const start = Date.now();
  try {
    const res = await p.query(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== 'production' && duration > 500) {
      console.warn(`[Slow Query ${duration}ms]:`, text.slice(0, 100));
    }
    return { rows: res.rows as T[], rowCount: res.rowCount };
  } catch (err: any) {
    console.error(`[DB Query Error]: ${err.message} -- Query: ${text.slice(0, 100)}`);
    throw err;
  }
}
