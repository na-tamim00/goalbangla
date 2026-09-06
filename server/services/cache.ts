import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

class CacheService {
  private client: Redis | null = null;
  private isConnected = false;
  private memoryFallback = new Map<string, { value: string; expires: number }>();

  constructor() {
    this.init();
  }

  private init() {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.warn('[CacheService] REDIS_URL not provided. Using in-memory fallback.');
      return;
    }

    try {
      this.client = new Redis(redisUrl, {
        tls: { rejectUnauthorized: false },
        maxRetriesPerRequest: 2,
        connectTimeout: 5000,
        lazyConnect: false,
        retryStrategy: (times) => {
          if (times > 3) {
            console.warn('[CacheService] Redis reconnection attempts exceeded. Falling back to memory.');
            return null;
          }
          return Math.min(times * 500, 2000);
        }
      });

      this.client.on('connect', () => {
        this.isConnected = true;
        console.log('[CacheService] Upstash Redis connected successfully.');
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        console.warn('[CacheService Warning]: Redis connection error:', err.message);
      });
    } catch (err: any) {
      console.warn('[CacheService] Failed to initialize Redis client:', err.message);
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      if (this.client && this.isConnected) {
        const data = await this.client.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      }
    } catch (err: any) {
      console.warn(`[CacheService] Redis get failed for key "${key}":`, err.message);
    }

    // Fallback
    const item = this.memoryFallback.get(key);
    if (!item) return null;
    if (Date.now() > item.expires) {
      this.memoryFallback.delete(key);
      return null;
    }
    try {
      return JSON.parse(item.value) as T;
    } catch {
      return null;
    }
  }

  public async set(key: string, value: any, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    try {
      if (this.client && this.isConnected) {
        await this.client.setex(key, ttlSeconds, serialized);
        return;
      }
    } catch (err: any) {
      console.warn(`[CacheService] Redis set failed for key "${key}":`, err.message);
    }

    // Fallback
    this.memoryFallback.set(key, {
      value: serialized,
      expires: Date.now() + ttlSeconds * 1000
    });
  }

  public async del(key: string): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        await this.client.del(key);
      }
    } catch (err: any) {
      console.warn(`[CacheService] Redis del failed for key "${key}":`, err.message);
    }
    this.memoryFallback.delete(key);
  }

  public async deletePattern(pattern: string): Promise<void> {
    try {
      if (this.client && this.isConnected) {
        const keys = await this.client.keys(pattern);
        if (keys.length > 0) {
          await this.client.del(...keys);
        }
      }
    } catch (err: any) {
      console.warn(`[CacheService] Redis deletePattern failed for "${pattern}":`, err.message);
    }

    // Clean up memory fallback keys matching pattern
    const regex = new RegExp('^' + pattern.replace(/\*/g, '.*') + '$');
    for (const k of this.memoryFallback.keys()) {
      if (regex.test(k)) {
        this.memoryFallback.delete(k);
      }
    }
  }
}

export const cache = new CacheService();
