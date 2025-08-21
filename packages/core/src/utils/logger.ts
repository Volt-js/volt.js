import { VoltLogLevel } from '../types';

/**
 * Resolves the log level from environment variables with proper validation and fallback.
 * 
 * This utility centralizes log level resolution across the Volt.js framework.
 * It provides a consistent fallback strategy with WARN as the silent default.
 * 
 * @returns {VoltLogLevel} The resolved log level
 * 
 * @example
 * ```typescript
 * // Environment-based log level resolution
 * const level = resolveLogLevel(); // Uses VOLT_LOG_LEVEL or falls back to WARN
 * 
 * // Create logger with resolved level
 * const logger = VoltConsoleLogger.create({ 
 *   level: resolveLogLevel(),
 *   context: { component: 'MyProcessor' }
 * });
 * ```
 */
export function resolveLogLevel(): VoltLogLevel {
  const envLevel = process.env.VOLT_LOG_LEVEL?.toUpperCase();

  // Valid log levels mapping
  const validLevels: Record<string, VoltLogLevel> = {
    'FATAL': VoltLogLevel.FATAL,
    'ERROR': VoltLogLevel.ERROR,
    'WARN': VoltLogLevel.WARN,
    'INFO': VoltLogLevel.INFO,
    'DEBUG': VoltLogLevel.DEBUG,
    'TRACE': VoltLogLevel.TRACE,

    // Aliases for better DX
    'WARNING': VoltLogLevel.WARN,
    'VERBOSE': VoltLogLevel.DEBUG,
  };

  // Return validated level or silent fallback to WARN
  return envLevel && validLevels[envLevel] ? validLevels[envLevel] : VoltLogLevel.WARN;
}

/**
 * Creates a standardized logger context for consistent logging across processors.
 * 
 * @param component - The component name (e.g., 'RequestProcessor', 'ErrorHandler')
 * @param additionalContext - Additional context properties
 * @returns {Record<string, unknown>} The standardized context object
 * 
 * @example
 * ```typescript
 * // Basic processor context
 * const context = createLoggerContext('RequestProcessor');
 * 
 * // With additional context (e.g., request-specific)
 * const context = createLoggerContext('RequestProcessor', {
 *   requestId: 'req-123',
 *   method: 'POST',
 *   route: '/api/users'
 * });
 * ```
 */
export function createLoggerContext(
  component: string,
  additionalContext?: Record<string, unknown>
): Record<string, unknown> {
  return {
    component,
    ...additionalContext,
  };
}