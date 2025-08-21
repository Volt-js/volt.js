import type { Redis } from "ioredis";
import { type EventCallback, type KeyValueOptions, type VoltStoreAdapter, isServer } from "@volt.js/core";

/**
 * Redis connection health status
 */
export interface RedisHealthStatus {
  isHealthy: boolean;
  lastCheck: number;
  latency: number;
  errorCount: number;
  totalCommands: number;
  details?: string;
}

/**
 * Retry configuration options
 */
export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

/**
 * Enhanced Redis adapter with connection pooling, health checking, and retry logic
 */
class EnhancedRedisAdapter {
  private redis: Redis;
  private subscriberClient: Redis;
  private subscribers = new Map<string, Set<EventCallback>>();
  private healthStatus: RedisHealthStatus;
  private retryOptions: RetryOptions;
  private healthCheckInterval!: NodeJS.Timeout;

  constructor(redisClient: Redis, retryOptions: Partial<RetryOptions> = {}) {
    this.redis = redisClient;
    this.subscriberClient = redisClient.duplicate();

    this.retryOptions = {
      maxRetries: retryOptions.maxRetries || 3,
      initialDelay: retryOptions.initialDelay || 1000,
      maxDelay: retryOptions.maxDelay || 10000,
      backoffFactor: retryOptions.backoffFactor || 2,
    };

    this.healthStatus = {
      isHealthy: true,
      lastCheck: Date.now(),
      latency: 0,
      errorCount: 0,
      totalCommands: 0,
    };

    this.setupHealthChecking();
    this.setupSubscriber();
    this.setupConnectionHandlers();
  }

  private setupHealthChecking(): void {
    // Run health check every 30 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.performHealthCheck();
    }, 30000);
  }

  private setupSubscriber(): void {
    this.subscriberClient.on('message', (channel, message) => {
      const callbacks = this.subscribers.get(channel);
      if (callbacks) {
        try {
          const parsedMessage = JSON.parse(message);
          callbacks.forEach(cb => cb(parsedMessage));
        } catch (error) {
          console.error(`[EnhancedRedisAdapter] Failed to parse message from channel "${channel}":`, error);
          this.healthStatus.errorCount++;
        }
      }
    });
  }

  private setupConnectionHandlers(): void {
    this.redis.on('error', (error) => {
      console.error('[EnhancedRedisAdapter] Redis connection error:', error);
      this.healthStatus.isHealthy = false;
      this.healthStatus.errorCount++;
      this.healthStatus.details = error.message;
    });

    this.redis.on('connect', () => {
      console.log('[EnhancedRedisAdapter] Redis connected');
      this.healthStatus.isHealthy = true;
      this.healthStatus.details = 'Connected';
    });

    this.redis.on('ready', () => {
      console.log('[EnhancedRedisAdapter] Redis ready');
      this.healthStatus.isHealthy = true;
    });

    this.redis.on('close', () => {
      console.warn('[EnhancedRedisAdapter] Redis connection closed');
      this.healthStatus.isHealthy = false;
      this.healthStatus.details = 'Connection closed';
    });

    this.redis.on('reconnecting', () => {
      console.log('[EnhancedRedisAdapter] Redis reconnecting...');
      this.healthStatus.details = 'Reconnecting';
    });
  }

  private async performHealthCheck(): Promise<void> {
    const startTime = Date.now();

    try {
      await this.redis.ping();

      const latency = Date.now() - startTime;
      this.healthStatus = {
        ...this.healthStatus,
        isHealthy: true,
        lastCheck: Date.now(),
        latency,
        details: 'Healthy',
      };
    } catch (error) {
      this.healthStatus = {
        ...this.healthStatus,
        isHealthy: false,
        lastCheck: Date.now(),
        latency: Date.now() - startTime,
        errorCount: this.healthStatus.errorCount + 1,
        details: error instanceof Error ? error.message : 'Health check failed',
      };
    }
  }

  private async executeWithRetry<T>(
    operation: () => Promise<T>,
    operationName: string
  ): Promise<T> {
    let lastError: Error;
    let delay = this.retryOptions.initialDelay;

    for (let attempt = 0; attempt <= this.retryOptions.maxRetries; attempt++) {
      try {
        this.healthStatus.totalCommands++;
        const result = await operation();

        // Reset error count on successful operation
        if (attempt > 0) {
          console.log(`[EnhancedRedisAdapter] ${operationName} succeeded after ${attempt} retries`);
        }

        return result;
      } catch (error) {
        lastError = error as Error;
        this.healthStatus.errorCount++;

        if (attempt === this.retryOptions.maxRetries) {
          console.error(`[EnhancedRedisAdapter] ${operationName} failed after ${attempt} attempts:`, error);
          throw error;
        }

        console.warn(`[EnhancedRedisAdapter] ${operationName} attempt ${attempt + 1} failed, retrying in ${delay}ms:`, error);

        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * this.retryOptions.backoffFactor, this.retryOptions.maxDelay);
      }
    }

    throw lastError!;
  }

  getHealthStatus(): RedisHealthStatus {
    return { ...this.healthStatus };
  }

  async get<T>(key: string): Promise<T | null> {
    return this.executeWithRetry(async () => {
      const value = await this.redis.get(key);
      if (value === null) {
        return null;
      }
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as unknown as T;
      }
    }, `get(${key})`);
  }

  async set(key: string, value: any, options?: KeyValueOptions): Promise<void> {
    return this.executeWithRetry(async () => {
      const serializedValue = JSON.stringify(value);
      if (options?.ttl) {
        await this.redis.set(key, serializedValue, 'EX', options.ttl);
      } else {
        await this.redis.set(key, serializedValue);
      }
    }, `set(${key})`);
  }

  async delete(key: string): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.redis.del(key);
    }, `delete(${key})`);
  }

  async has(key: string): Promise<boolean> {
    return this.executeWithRetry(async () => {
      const result = await this.redis.exists(key);
      return result === 1;
    }, `has(${key})`);
  }

  async increment(key: string): Promise<number> {
    return this.executeWithRetry(async () => {
      return this.redis.incr(key);
    }, `increment(${key})`);
  }

  async expire(key: string, ttl: number): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.redis.expire(key, ttl);
    }, `expire(${key})`);
  }

  async publish(channel: string, message: any): Promise<void> {
    return this.executeWithRetry(async () => {
      await this.redis.publish(channel, JSON.stringify(message));
    }, `publish(${channel})`);
  }

  async subscribe(channel: string, callback: EventCallback): Promise<void> {
    return this.executeWithRetry(async () => {
      let callbackSet = this.subscribers.get(channel);
      if (!callbackSet) {
        callbackSet = new Set();
        this.subscribers.set(channel, callbackSet);
        await this.subscriberClient.subscribe(channel);
      }
      callbackSet.add(callback);
    }, `subscribe(${channel})`);
  }

  async unsubscribe(channel: string, callback?: EventCallback): Promise<void> {
    return this.executeWithRetry(async () => {
      const callbackSet = this.subscribers.get(channel);
      if (!callbackSet) {
        return;
      }

      if (callback) {
        callbackSet.delete(callback);
      } else {
        this.subscribers.delete(channel);
      }

      if (callbackSet.size === 0) {
        this.subscribers.delete(channel);
        await this.subscriberClient.unsubscribe(channel);
      }
    }, `unsubscribe(${channel})`);
  }

  async disconnect(): Promise<void> {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }

    await this.subscriberClient.disconnect();
    await this.redis.disconnect();
  }
}

/**
 * Creates a Store Adapter for Redis.
 * This adapter provides a unified interface for Volt to interact with a Redis instance,
 * handling key-value storage, atomic operations, and Pub/Sub messaging.
 *
 * It uses separate clients for commands and subscriptions as required by Redis.
 *
 * @param redisClient - An initialized `ioredis` client instance.
 * @param retryOptions - Optional retry configuration for enhanced reliability.
 * @returns A `StoreAdapter` object for Redis.
 */
export function createRedisStoreAdapter(
  redisClient: Redis,
  retryOptions?: Partial<RetryOptions>
): VoltStoreAdapter<Redis> {
  if (!isServer) {
    return {} as VoltStoreAdapter<Redis>;
  }

  const enhancedAdapter = new EnhancedRedisAdapter(redisClient, retryOptions);

  return {
    client: redisClient,

    async get<T>(key: string): Promise<T | null> {
      return enhancedAdapter.get<T>(key);
    },

    async set(key: string, value: any, options?: KeyValueOptions): Promise<void> {
      return enhancedAdapter.set(key, value, options);
    },

    async delete(key: string): Promise<void> {
      return enhancedAdapter.delete(key);
    },

    async has(key: string): Promise<boolean> {
      return enhancedAdapter.has(key);
    },

    async increment(key: string): Promise<number> {
      return enhancedAdapter.increment(key);
    },

    async expire(key: string, ttl: number): Promise<void> {
      return enhancedAdapter.expire(key, ttl);
    },

    async publish(channel: string, message: any): Promise<void> {
      return enhancedAdapter.publish(channel, message);
    },

    async subscribe(channel: string, callback: EventCallback): Promise<void> {
      return enhancedAdapter.subscribe(channel, callback);
    },

    async unsubscribe(channel: string, callback?: EventCallback): Promise<void> {
      return enhancedAdapter.unsubscribe(channel, callback);
    },
  };
}

/**
 * Creates an enhanced Redis adapter with advanced features
 */
export function createEnhancedRedisAdapter(
  redisClient: Redis,
  retryOptions?: Partial<RetryOptions>
): EnhancedRedisAdapter {
  return new EnhancedRedisAdapter(redisClient, retryOptions);
}

// Export types and classes for external use
export { EnhancedRedisAdapter }; 