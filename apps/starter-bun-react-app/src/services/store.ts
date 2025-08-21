import { createRedisStoreAdapter } from '@volt.js/adapter-redis'
import { redis } from '@/services/redis'

/**
 * Store adapter for data persistence.
 *
 * @remarks
 * Provides a unified interface for data storage operations using Redis.
 *
 * @see https://github.com/Volt-js/volt.js/tree/main/packages/adapter-redis
 */
export const store = createRedisStoreAdapter(redis)
