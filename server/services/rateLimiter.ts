import { cache } from './cache';

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;
  retryAfter: number; // in seconds
}

export interface RateLimitConfig {
  maxIpAttempts?: number;
  maxAccountAttempts?: number;
  windowSeconds?: number;
}

interface RateLimitRecord {
  count: number;
  resetAt: number; // Unix timestamp in ms
}

export class RateLimiter {
  private maxIpAttempts: number;
  private maxAccountAttempts: number;
  private windowSeconds: number;
  // Local in-memory emergency backup if cache service completely fails
  private emergencyFallback = new Map<string, RateLimitRecord>();

  constructor(config: RateLimitConfig = {}) {
    this.maxIpAttempts = config.maxIpAttempts || 10;
    this.maxAccountAttempts = config.maxAccountAttempts || 5;
    this.windowSeconds = config.windowSeconds || 60; // 60-second window
  }

  /**
   * Check if an IP or identifier has exceeded allowed attempts
   */
  public async checkLimit(key: string, maxAttempts: number): Promise<RateLimitStatus> {
    try {
      const now = Date.now();
      let record = await cache.get<RateLimitRecord>(key);

      if (!record) {
        record = this.emergencyFallback.get(key) || null;
      }

      if (record) {
        if (now < record.resetAt) {
          if (record.count >= maxAttempts) {
            const retryAfter = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
            return {
              allowed: false,
              remaining: 0,
              retryAfter
            };
          }
          return {
            allowed: true,
            remaining: Math.max(0, maxAttempts - record.count),
            retryAfter: 0
          };
        } else {
          // Expired record
          this.emergencyFallback.delete(key);
        }
      }

      return {
        allowed: true,
        remaining: maxAttempts,
        retryAfter: 0
      };
    } catch (err: any) {
      console.warn('[RateLimiter Warning]: Limit check failed, failing safely:', err.message);
      // Fail safely without blocking legitimate traffic
      return { allowed: true, remaining: 1, retryAfter: 0 };
    }
  }

  /**
   * Record a failed login attempt
   */
  public async recordFailure(key: string): Promise<void> {
    const now = Date.now();
    try {
      let record = await cache.get<RateLimitRecord>(key);
      if (!record) {
        record = this.emergencyFallback.get(key) || null;
      }

      if (record && now < record.resetAt) {
        const updated: RateLimitRecord = {
          count: record.count + 1,
          resetAt: record.resetAt
        };
        const ttlSeconds = Math.max(1, Math.ceil((record.resetAt - now) / 1000));
        await cache.set(key, updated, ttlSeconds);
        this.emergencyFallback.set(key, updated);
      } else {
        const newRecord: RateLimitRecord = {
          count: 1,
          resetAt: now + this.windowSeconds * 1000
        };
        await cache.set(key, newRecord, this.windowSeconds);
        this.emergencyFallback.set(key, newRecord);
      }
    } catch (err: any) {
      console.warn('[RateLimiter Warning]: Record failure failed:', err.message);
      // Fallback locally
      const existing = this.emergencyFallback.get(key);
      if (existing && now < existing.resetAt) {
        this.emergencyFallback.set(key, { count: existing.count + 1, resetAt: existing.resetAt });
      } else {
        this.emergencyFallback.set(key, { count: 1, resetAt: now + this.windowSeconds * 1000 });
      }
    }
  }

  /**
   * Reset the rate limit counter for a key upon successful authentication
   */
  public async reset(key: string): Promise<void> {
    try {
      await cache.del(key);
    } catch (err: any) {
      console.warn('[RateLimiter Warning]: Reset failed:', err.message);
    }
    this.emergencyFallback.delete(key);
  }

  /**
   * Helper to evaluate both IP and account dimensions for a login request
   */
  public async evaluateLogin(clientIp: string, identifier: string): Promise<RateLimitStatus> {
    const ipKey = `ratelimit:login:ip:${clientIp}`;
    const ipStatus = await this.checkLimit(ipKey, this.maxIpAttempts);
    if (!ipStatus.allowed) {
      return ipStatus;
    }

    if (identifier) {
      const idKey = `ratelimit:login:id:${identifier.toLowerCase().trim()}`;
      const idStatus = await this.checkLimit(idKey, this.maxAccountAttempts);
      if (!idStatus.allowed) {
        return idStatus;
      }
    }

    return { allowed: true, remaining: this.maxAccountAttempts, retryAfter: 0 };
  }

  /**
   * Helper to record failure on both IP and account dimensions
   */
  public async recordLoginFailure(clientIp: string, identifier: string): Promise<void> {
    const ipKey = `ratelimit:login:ip:${clientIp}`;
    await this.recordFailure(ipKey);

    if (identifier) {
      const idKey = `ratelimit:login:id:${identifier.toLowerCase().trim()}`;
      await this.recordFailure(idKey);
    }
  }

  /**
   * Helper to reset limit on successful login
   */
  public async resetLoginSuccess(clientIp: string, identifier: string): Promise<void> {
    if (identifier) {
      const idKey = `ratelimit:login:id:${identifier.toLowerCase().trim()}`;
      await this.reset(idKey);
    }
    // Note: IP counter can either reset or remain to prevent distributed brute-force
  }
}

export const loginRateLimiter = new RateLimiter({
  maxIpAttempts: 10,
  maxAccountAttempts: 5,
  windowSeconds: 60
});
