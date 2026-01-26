/**
 * PCF Logger
 * 
 * Environment-aware logging utility for PCF controls.
 * Automatically detects development vs production and adjusts log levels.
 * 
 * Features:
 * - Level-based filtering (debug, info, warn, error)
 * - Structured output with timestamps and context
 * - Child loggers with inherited configuration
 * - Zero overhead in production for debug/info logs
 */

// ============================================================================
// Types
// ============================================================================

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LoggerConfig {
  /** Minimum level to output */
  minLevel: LogLevel;
  /** Enable/disable all logging */
  enabled: boolean;
  /** Prefix for all log messages */
  prefix: string;
  /** Include timestamps in output */
  includeTimestamp: boolean;
}

export interface ILogger {
  debug(message: string, data?: Record<string, unknown>): void;
  info(message: string, data?: Record<string, unknown>): void;
  warn(message: string, data?: Record<string, unknown>): void;
  error(message: string, data?: Record<string, unknown>): void;
  child(context: string): ILogger;
  configure(config: Partial<LoggerConfig>): void;
  isProduction(): boolean;
}

// ============================================================================
// Constants
// ============================================================================

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LOG_LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '#6B7280', // gray
  info: '#3B82F6',  // blue
  warn: '#F59E0B',  // amber
  error: '#EF4444', // red
};

// ============================================================================
// Environment Detection
// ============================================================================

/**
 * Detect if running in development environment
 * Works in PCF sandbox without accessing forbidden globals
 */
function detectEnvironment(): boolean {
  try {
    // Check URL for development indicators
    if (typeof window !== 'undefined' && window.location) {
      const hostname = window.location.hostname;
      const search = window.location.search;
      
      // Local development
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return true;
      }
      
      // Debug flag in URL
      if (search.includes('debug=true') || search.includes('isDev=true')) {
        return true;
      }
      
      // PowerApps maker portal
      if (hostname.includes('make.powerapps.com')) {
        return true;
      }
    }
    
    return false;
  } catch {
    // If we can't detect, assume production (safer)
    return false;
  }
}

// ============================================================================
// Logger Implementation
// ============================================================================

class PCFLogger implements ILogger {
  private _config: LoggerConfig;
  private _context: string;
  private _isDev: boolean;

  constructor(context = 'PCF', config?: Partial<LoggerConfig>) {
    this._context = context;
    this._isDev = detectEnvironment();
    
    this._config = {
      minLevel: this._isDev ? 'debug' : 'warn',
      enabled: true,
      prefix: '[Dataverse]',
      includeTimestamp: true,
      ...config,
    };
  }

  /**
   * Check if a log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this._config.enabled) return false;
    return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[this._config.minLevel];
  }

  /**
   * Format the log message
   */
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];
    
    if (this._config.includeTimestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }
    
    parts.push(this._config.prefix);
    parts.push(`[${level.toUpperCase()}]`);
    parts.push(`[${this._context}]`);
    parts.push(message);
    
    return parts.join(' ');
  }

  /**
   * Output log to console with styling
   */
  private output(level: LogLevel, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog(level)) return;

    const formatted = this.formatMessage(level, message);
    const color = LOG_LEVEL_COLORS[level];
    
    // Use styled console output in development
    const style = this._isDev ? `color: ${color}; font-weight: bold;` : '';
    
    switch (level) {
      case 'debug':
        if (data !== undefined) {
          console.debug(`%c${formatted}`, style, data);
        } else {
          console.debug(`%c${formatted}`, style);
        }
        break;
      case 'info':
        if (data !== undefined) {
          console.info(`%c${formatted}`, style, data);
        } else {
          console.info(`%c${formatted}`, style);
        }
        break;
      case 'warn':
        if (data !== undefined) {
          console.warn(formatted, data);
        } else {
          console.warn(formatted);
        }
        break;
      case 'error':
        if (data !== undefined) {
          console.error(formatted, data);
        } else {
          console.error(formatted);
        }
        break;
    }
  }

  // ============================================================================
  // Public API
  // ============================================================================

  debug(message: string, data?: Record<string, unknown>): void {
    this.output('debug', message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.output('info', message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.output('warn', message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.output('error', message, data);
  }

  /**
   * Create a child logger with additional context
   */
  child(context: string): ILogger {
    return new PCFLogger(`${this._context}:${context}`, this._config);
  }

  /**
   * Update logger configuration
   */
  configure(config: Partial<LoggerConfig>): void {
    this._config = { ...this._config, ...config };
  }

  /**
   * Check if running in production
   */
  isProduction(): boolean {
    return !this._isDev;
  }
}

// ============================================================================
// Factory & Singleton
// ============================================================================

let defaultLogger: ILogger | null = null;

/**
 * Create a new logger instance
 */
export function createLogger(context: string, config?: Partial<LoggerConfig>): ILogger {
  return new PCFLogger(context, config);
}

/**
 * Get or create the default logger instance
 */
export function getLogger(): ILogger {
  if (!defaultLogger) {
    defaultLogger = new PCFLogger('App');
  }
  return defaultLogger;
}

/**
 * Configure the default logger
 */
export function configureDefaultLogger(config: Partial<LoggerConfig>): void {
  getLogger().configure(config);
}

// Export default instance for convenience
export const logger = getLogger();
