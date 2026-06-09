import { config } from '../config/env';

class NullRedis {
  private store = new Map<string, { value: string; expiry: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiry && Date.now() > entry.expiry) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, mode?: string, ttl?: number): Promise<'OK'> {
    const expiry = mode && ttl ? Date.now() + ttl * 1000 : 0;
    this.store.set(key, { value, expiry });
    return 'OK';
  }

  async del(key: string): Promise<number> {
    return this.store.delete(key) ? 1 : 0;
  }

  on(_event: string, _cb: Function): void {}
}

let redis: any;

try {
  const Redis = require('ioredis');
  redis = new Redis(config.redisUrl, {
    maxRetriesPerRequest: 1,
    retryStrategy() { return null; },
    lazyConnect: true,
  });
  redis.on('error', () => {
    console.warn('Redis unavailable — using in-memory fallback');
    redis = new NullRedis();
  });
} catch {
  console.warn('Redis not configured — using in-memory fallback');
  redis = new NullRedis();
}

export default redis as any;
