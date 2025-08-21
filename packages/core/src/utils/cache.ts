import type { Redis } from "ioredis";

/**
 * Cache statistics interface
 */
export interface CacheStats {
  hits: number;
  misses: number;
  hitRate: number;
  sets: number;
  deletes: number;
  evictions: number;
  totalKeys: number;
}

/**
 * Cache options interface
 */
export interface CacheOptions {
  /**
   * Default TTL in seconds
   */
  defaultTtl?: number;
  
  /**
   * Maximum number of keys (for LRU eviction)
   */
  maxKeys?: number;
  
  /**
   * Enable compression for large objects
   */
  enableCompression?: boolean;
  
  /**
   * Compression threshold in bytes
   */
  compressionThreshold?: number;
}

/**
 * Distributed cache implementation with Redis backend
 */
export class DistributedCache {
  private redis: Redis;
  private options: Required<CacheOptions>;
  private stats: CacheStats;
  private keyPrefix: string;
  private lruKey: string;

  constructor(redis: Redis, options: CacheOptions = {}, keyPrefix = 'cache') {
    this.redis = redis;
    this.keyPrefix = keyPrefix;
    this.lruKey = `${keyPrefix}:lru`;
    
    this.options = {
      defaultTtl: options.defaultTtl || 3600, // 1 hour
      maxKeys: options.maxKeys || 10000,
      enableCompression: options.enableCompression || false,
      compressionThreshold: options.compressionThreshold || 1024, // 1KB
    };

    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalKeys: 0,
    };
  }

  /**
   * Get an item from cache
   */
  async get<T>(key: string): Promise<T | null> {
    const fullKey = this.getFullKey(key);
    
    try {
      const value = await this.redis.get(fullKey);
      
      if (value === null) {
        this.stats.misses++;
        this.updateHitRate();
        return null;
      }

      // Update LRU order
      await this.redis.zadd(this.lruKey, Date.now(), key);

      this.stats.hits++;
      this.updateHitRate();

      // Parse the value
      const parsedValue = this.parseValue(value);
      return parsedValue as T;
    } catch (error) {
      console.error(`[DistributedCache] Failed to get key "${key}":`, error);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
  }

  /**
   * Set an item in cache
   */
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const fullKey = this.getFullKey(key);
    const actualTtl = ttl || this.options.defaultTtl;
    
    try {
      // Check if we need to evict keys first
      await this.evictIfNeeded();

      // Serialize the value
      const serializedValue = this.serializeValue(value);

      // Store in Redis with TTL
      if (actualTtl > 0) {
        await this.redis.setex(fullKey, actualTtl, serializedValue);
      } else {
        await this.redis.set(fullKey, serializedValue);
      }

      // Update LRU order
      await this.redis.zadd(this.lruKey, Date.now(), key);

      this.stats.sets++;
    } catch (error) {
      console.error(`[DistributedCache] Failed to set key "${key}":`, error);
      throw error;
    }
  }

  /**
   * Delete an item from cache
   */
  async del(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    
    try {
      const result = await this.redis.del(fullKey);
      
      // Remove from LRU tracking
      await this.redis.zrem(this.lruKey, key);
      
      if (result > 0) {
        this.stats.deletes++;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error(`[DistributedCache] Failed to delete key "${key}":`, error);
      return false;
    }
  }

  /**
   * Clear all cache entries
   */
  async clear(): Promise<void> {
    try {
      const pattern = `${this.keyPrefix}:*`;
      const keys = await this.redis.keys(pattern);
      
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
      
      // Clear LRU tracking
      await this.redis.del(this.lruKey);
      
      this.stats.deletes += keys.length;
    } catch (error) {
      console.error('[DistributedCache] Failed to clear cache:', error);
      throw error;
    }
  }

  /**
   * Check if a key exists
   */
  async has(key: string): Promise<boolean> {
    const fullKey = this.getFullKey(key);
    
    try {
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      console.error(`[DistributedCache] Failed to check key "${key}":`, error);
      return false;
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get total number of keys in cache
   */
  async getTotalKeys(): Promise<number> {
    try {
      const pattern = `${this.keyPrefix}:data:*`;
      const keys = await this.redis.keys(pattern);
      this.stats.totalKeys = keys.length;
      return keys.length;
    } catch (error) {
      console.error('[DistributedCache] Failed to get total keys:', error);
      return 0;
    }
  }

  /**
   * Reset cache statistics
   */
  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      hitRate: 0,
      sets: 0,
      deletes: 0,
      evictions: 0,
      totalKeys: 0,
    };
  }

  /**
   * Private methods
   */
  private getFullKey(key: string): string {
    return `${this.keyPrefix}:data:${key}`;
  }

  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }

  private serializeValue(value: any): string {
    const serialized = JSON.stringify(value);
    
    // Apply compression if enabled and value is large enough
    if (this.options.enableCompression && serialized.length > this.options.compressionThreshold) {
      // TODO: Implement compression (e.g., using zlib)
      // For now, just return the JSON string
      return serialized;
    }
    
    return serialized;
  }

  private parseValue(value: string): any {
    try {
      return JSON.parse(value);
    } catch (error) {
      // If parsing fails, return the raw value
      console.warn('[DistributedCache] Failed to parse cached value, returning raw string');
      return value;
    }
  }

  private async evictIfNeeded(): Promise<void> {
    try {
      const currentCount = await this.redis.zcard(this.lruKey);
      
      if (currentCount >= this.options.maxKeys) {
        // Get the oldest keys (lowest scores)
        const keysToEvict = await this.redis.zrange(this.lruKey, 0, currentCount - this.options.maxKeys);
        
        if (keysToEvict.length > 0) {
          // Remove from cache
          const fullKeys = keysToEvict.map(key => this.getFullKey(key));
          await this.redis.del(...fullKeys);
          
          // Remove from LRU tracking
          await this.redis.zrem(this.lruKey, ...keysToEvict);
          
          this.stats.evictions += keysToEvict.length;
        }
      }
    } catch (error) {
      console.error('[DistributedCache] Failed to evict keys:', error);
    }
  }
}

/**
 * Simple cache implementation for client-side data (fallback)
 */
export class ClientCache {
  private static cache = new Map<string, {
    data: any;
    timestamp: number;
  }>();

  /**
   * Get an item from cache
   * @param key Cache key
   * @param staleTime Time in ms after which the cache is considered stale
   * @returns Cached data or undefined if not found or stale
   */
  static get(key: string, staleTime = 0): any | undefined {
    const item = this.cache.get(key);
    
    if (!item) return undefined;
    
    // If staleTime is provided and the cache is older than the stale time, consider it stale
    if (staleTime > 0 && Date.now() - item.timestamp > staleTime) {
      return undefined;
    }
    
    return item.data;
  }

  /**
   * Set an item in cache
   * @param key Cache key
   * @param data Data to cache
   */
  static set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Clear an item from cache
   * @param key Cache key
   */
  static clear(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Clear all items from cache
   */
  static clearAll(): void {
    this.cache.clear();
  }
} 