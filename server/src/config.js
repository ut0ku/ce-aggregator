import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const serverRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

try {
  const envFile = readFileSync(path.join(serverRoot, '.env'), 'utf8');
  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim();
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
} catch {
  // .env is optional when variables are provided by the environment.
}

const number = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const config = {
  port: number(process.env.PORT, 3001),
  databaseUrl: process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/volna',
  redisUrl: process.env.REDIS_URL || 'redis://127.0.0.1:6379',
  cacheTtlSeconds: number(process.env.CACHE_TTL_SECONDS, 1800),
  parseTimeoutMs: number(process.env.PARSE_TIMEOUT_MS, 12000),
  maxArticlesPerSource: 12,
  minFreshArticles: 5,
  jwtSecret: process.env.JWT_SECRET || 'volna-dev-secret-change-me',
};
