import { Redis } from 'ioredis';
import { config } from './config.js';

const memory = new Map();
let redis = null;
let redisReady = false;

try {
  redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 3) return null;
      return 200;
    },
  });
  redis.on('error', () => {
    redisReady = false;
  });
  redis.connect()
    .then(() => {
      redisReady = true;
    })
    .catch(() => {
      redisReady = false;
      console.warn('Redis is unavailable, using in-memory cache.');
    });
} catch {
  redis = null;
}

function memoryGet(key) {
  const item = memory.get(key);
  if (!item) return null;
  if (item.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return item.value;
}

export async function cacheGet(key) {
  if (redisReady) {
    try {
      const raw = await redis.get(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      redisReady = false;
    }
  }
  return memoryGet(key);
}

export async function cacheSet(key, value, ttlSeconds = config.cacheTtlSeconds) {
  if (redisReady) {
    try {
      await redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
      return;
    } catch {
      redisReady = false;
    }
  }
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export function getRedis() {
  return redisReady ? redis : null;
}

export { redis };
