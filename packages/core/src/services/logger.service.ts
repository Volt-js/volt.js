import { VoltLogLevel, type VoltLogEntry, type VoltLogger, type VoltLoggerOptions } from '../types';
import chalk from 'chalk'

/**
 * VoltLogger with Volt.js exact design
 * 
 * Features identical Volt.js visual design:
 * - Timeline connectors (│)
 * - Precise symbols (◇ ◆ ○)
 * - Exact color scheme
 * - Browser-safe fallback
 * - Clean visual hierarchy
 * 
 */
export class VoltConsoleLogger implements VoltLogger {
  private readonly context: Record<string, unknown>;
  private logLevel: VoltLogLevel;
  private readonly colorize: boolean;
  private readonly formatter?: (entry: VoltLogEntry) => string;
  private readonly showTimestamp: boolean;
  private indentLevel: number = 0;

  constructor(options: VoltLoggerOptions & {
    context?: Record<string, unknown>;
    showTimestamp?: boolean;
  } = {}) {
    this.context = options.context ?? {};
    this.logLevel = options.level ?? VoltLogLevel.INFO;
    this.colorize = options.colorize ?? true;
    this.formatter = options.formatter;
    this.showTimestamp = options.showTimestamp ?? false;
  }

  static create(options: VoltLoggerOptions & {
    context?: Record<string, unknown>;
    showTimestamp?: boolean;
  } = {}): VoltLogger {
    return new VoltConsoleLogger(options);
  }

  /**
   * Log a message at the specified level.
   */
  log(
    level: VoltLogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error | unknown
  ): void {
    if (!this.shouldLog(level)) return;

    const entry: VoltLogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context: { ...this.context, ...(context ?? {}) },
      error,
    };

    const output = this.formatter
      ? this.formatter(entry)
      : this.formatLogEntry(entry);

    this.writeToConsole(level, output, error);
  }

  /**
   * Log a fatal error (system crash, unrecoverable).
   */
  fatal(message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    this.log(VoltLogLevel.FATAL, message, context, error);
  }

  /**
   * Log an error message.
   */
  error(message: string, context?: Record<string, unknown>, error?: Error | unknown): void {
    this.log(VoltLogLevel.ERROR, message, context, error);
  }

  /**
   * Log a warning message.
   */
  warn(message: string, context?: Record<string, unknown>): void {
    this.log(VoltLogLevel.WARN, message, context);
  }

  /**
   * Log an informational message.
   */
  info(message: string, context?: Record<string, unknown>): void {
    this.log(VoltLogLevel.INFO, message, context);
  }

  /**
   * Log a debug message (for development).
   */
  debug(message: string, context?: Record<string, unknown>): void {
    this.log(VoltLogLevel.DEBUG, message, context);
  }

  /**
   * Log a trace message (very verbose, for tracing execution).
   */
  trace(message: string, context?: Record<string, unknown>): void {
    this.log(VoltLogLevel.TRACE, message, context);
  }

  /**
   * Log a success message (Volt.js style)
   */
  success(message: string, context?: Record<string, unknown>): void {
    this.log(VoltLogLevel.INFO, message, { ...context, _type: 'success' });
  }

  /**
   * Start a new logging group (increases indent and adds timeline)
   */
  group(name?: string): void {
    if (name) {
      const connector = this.indentLevel > 0 ? '│ ' : '';
      const line = this.colorize
        ? `${connector}${chalk.cyan('┌')} ${chalk.white(name)}`
        : `${connector}┌ ${name}`;
      console.log(line);
    }
    this.indentLevel++;
  }

  /**
   * End the current logging group (decreases indent)
   */
  groupEnd(): void {
    if (this.indentLevel > 0) {
      this.indentLevel--;
      // Add closing connector if needed
      if (this.indentLevel > 0) {
        const connector = '│ '.repeat(this.indentLevel);
        const line = this.colorize ? `${connector}${chalk.cyan('└')}` : `${connector}└`;
        console.log(line);
      }
    }
  }

  /**
   * Add a visual separator (Volt.js style)
   */
  separator(): void {
    const connector = this.indentLevel > 0 ? '│ ' : '';
    console.log(this.colorize ? chalk.gray(`${connector}│`) : `${connector}│`);
  }

  /**
   * Create a child logger with additional context.
   */
  child(context: Record<string, unknown>): VoltLogger {
    return new VoltConsoleLogger({
      level: this.logLevel,
      colorize: this.colorize,
      formatter: this.formatter,
      showTimestamp: this.showTimestamp,
      context: { ...this.context, ...context },
    });
  }

  /**
   * Set the minimum log level at runtime.
   */
  setLevel(level: VoltLogLevel): void {
    this.logLevel = level;
  }

  /**
   * Flush any buffered logs (no-op for console logger).
   */
  async flush(): Promise<void> {
    // No buffering in console logger
  }

  /**
   * Determines if a message at the given level should be logged.
   */
  private shouldLog(level: VoltLogLevel): boolean {
    const levels: VoltLogLevel[] = [
      VoltLogLevel.FATAL,
      VoltLogLevel.ERROR,
      VoltLogLevel.WARN,
      VoltLogLevel.INFO,
      VoltLogLevel.DEBUG,
      VoltLogLevel.TRACE,
    ];
    const minIndex = levels.indexOf(this.logLevel);
    const levelIndex = levels.indexOf(level);
    return levelIndex <= minIndex;
  }

  /**
   * Formats a log entry with Volt.js exact styling.
   */
  private formatLogEntry(entry: VoltLogEntry): string {
    const { level, message, context, timestamp } = entry;

    // Volt.js timeline connector
    const connector = this.indentLevel > 0 ? '│ ' : '';

    // Get symbol and format exactly like Volt.js
    const symbol = this.getStatusSymbol(level, context);

    const timestampStr = this.showTimestamp && timestamp ? chalk.gray(`[${new Date(timestamp as string | Date).toLocaleTimeString()}]`) : '';
    const contextInfo = this.formatContext(context || {});

    let line = '';

    if (this.colorize) {
      if (context?._type === 'success') {
        line = `${connector}${timestampStr} ${chalk.green('◆')} ${chalk.green(message)}`;
      } else if (level === VoltLogLevel.ERROR || level === VoltLogLevel.FATAL) {
        line = `${connector}${timestampStr} ${chalk.red('◇')} ${chalk.white(message)}`;
      } else if (level === VoltLogLevel.WARN) {
        line = `${connector}${timestampStr} ${chalk.yellow('◇')} ${chalk.white(message)}`;
      } else if (level === VoltLogLevel.DEBUG) {
        line = `${connector}${timestampStr} ${chalk.gray('○')} ${chalk.gray(message)}`;
      } else {
        line = `${connector}${timestampStr} ${chalk.cyan('◇')} ${chalk.white(message)}`;
      }
    } else {
      line = `${connector}${timestampStr} ${symbol} ${message}`;
    }

    if (contextInfo) {
      line += (this.colorize ? chalk.gray(` ${contextInfo}`) : ` ${contextInfo}`);
    }
    return line;
  }

  private formatContext(context: Record<string, unknown>): string {
    const displayContext = { ...context };
    delete (displayContext as any)._type;

    if (Object.keys(displayContext).length === 0) {
      return '';
    }

    const entries: string[] = [];

    for (const [key, value] of Object.entries(displayContext)) {
      let formattedValue: string;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        formattedValue = String(value);
      } else if (Array.isArray(value)) {
        formattedValue = `[${value.length} items]`;
      } else if (typeof value === 'object' && value !== null) {
        try {
          formattedValue = JSON.stringify(value); // Attempt to stringify objects for better detail
        } catch (e) {
          formattedValue = '{object}'; // Fallback for circular or complex objects
        }
      } else {
        formattedValue = String(value);
      }
      entries.push(`${key}=${formattedValue}`);
    }

    return entries.join(', ');
  }

  private writeToConsole(level: VoltLogLevel, output: string, error?: Error | unknown): void {
    switch (level) {
      case VoltLogLevel.FATAL:
      case VoltLogLevel.ERROR:
        console.error(output);
        // Volt.js style error details with timeline
        if (error && error instanceof Error) {
          const connector = this.indentLevel > 0 ? '│ ' : '';
          const errorLine = this.colorize
            ? `${connector}  ${chalk.red(error.message)}`
            : `${connector}  ${error.message}`;
          console.error(errorLine);
        }
        break;
      case VoltLogLevel.WARN:
        console.warn(output);
        break;
      case VoltLogLevel.DEBUG:
      case VoltLogLevel.TRACE:
        console.debug(output);
        break;
      default:
        console.log(output);
    }
  }

  private getStatusSymbol(level: VoltLogLevel, context?: Record<string, unknown>): string {
    // Volt.js exact symbols
    if (context?._type === 'success') {
      return '◆'; // Filled diamond for success
    }

    switch (level) {
      case VoltLogLevel.FATAL:
      case VoltLogLevel.ERROR:
        return '◇'; // Outline diamond for errors
      case VoltLogLevel.WARN:
        return '◇'; // Outline diamond for warnings
      case VoltLogLevel.INFO:
        return '◇'; // Outline diamond for info (Volt.js default)
      case VoltLogLevel.DEBUG:
        return '○'; // Circle for debug
      case VoltLogLevel.TRACE:
        return '·'; // Dot for trace
      default:
        return '◇'; // Default to Volt.js style outline diamond
    }
  }
}

/**
 * Factory function to create a ConsoleLogger instance.
 */
export function createConsoleLogger(
  options: VoltLoggerOptions & {
    context?: Record<string, unknown>;
  } = {}
): VoltLogger {
  return new VoltConsoleLogger(options);
}
