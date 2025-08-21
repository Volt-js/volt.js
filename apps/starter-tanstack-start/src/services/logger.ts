import { createConsoleLogger, VoltLogLevel } from '@volt.js/core'

/**
  * Logger instance for application logging.
  *
  * @remarks
  * Provides structured logging with configurable log levels.
  * This is used by the Volt instance to log events.
  *
  * @see https://github.com/Volt-js/volt.js
  */
export const logger = createConsoleLogger({
  level: VoltLogLevel.INFO, // Change to DEBUG for more verbose logs
  showTimestamp: true,
})
