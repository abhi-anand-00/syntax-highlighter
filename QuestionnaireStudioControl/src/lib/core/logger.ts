/**
 * Logger Abstraction
 * 
 * Provides a consistent logging interface with configurable log levels.
 * In production, this can be swapped for a real logging service.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: unknown;
  timestamp: string;
}

export interface LoggerConfig {
  minLevel: LogLevel;
  enabled: boolean;
  prefix?: string;
}

const LOG_LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

/**
 * Detect if we're in development mode
 * PCF-compatible: defaults to production behavior in PCF environments
 */
const isDevelopment = (): boolean => {
  // In PCF/Webpack environments, always use production settings
  // Development mode is only enabled in local Vite dev server
  if (typeof window !== 'undefined' && window.location) {
    const hostname = window.location.hostname;
    return hostname === 'localhost' || hostname === '127.0.0.1';
  }
  return false;
};

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: isDevelopment() ? 'debug' : 'warn',
  enabled: true,
  prefix: '[App]',
};

let globalConfig: LoggerConfig = { ...DEFAULT_CONFIG };

/**
 * Configure the global logger
 */
export const configureLogger = (config: Partial<LoggerConfig>): void => {
  globalConfig = { ...globalConfig, ...config };
};

/**
 * Check if a log level should be output based on current config
 */
const shouldLog = (level: LogLevel): boolean => {
  if (!globalConfig.enabled) return false;
  return LOG_LEVEL_PRIORITY[level] >= LOG_LEVEL_PRIORITY[globalConfig.minLevel];
};

/**
 * Format a log entry for output
 */
const formatEntry = (entry: LogEntry): string => {
  const parts = [
    globalConfig.prefix,
    `[${entry.level.toUpperCase()}]`,
    entry.context ? `[${entry.context}]` : '',
    entry.message,
  ].filter(Boolean);
  return parts.join(' ');
};

/**
 * Core log function
 */
const log = (level: LogLevel, message: string, context?: string, data?: unknown): void => {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    level,
    message,
    context,
    data,
    timestamp: new Date().toISOString(),
  };

  const formatted = formatEntry(entry);

  switch (level) {
    case 'debug':
      console.debug(formatted, data ?? '');
      break;
    case 'info':
      console.info(formatted, data ?? '');
      break;
    case 'warn':
      console.warn(formatted, data ?? '');
      break;
    case 'error':
      console.error(formatted, data ?? '');
      break;
  }
};

/**
 * Creates a contextualized logger
 */
export const createLogger = (context: string) => ({
  debug: (message: string, data?: unknown) => log('debug', message, context, data),
  info: (message: string, data?: unknown) => log('info', message, context, data),
  warn: (message: string, data?: unknown) => log('warn', message, context, data),
  error: (message: string, data?: unknown) => log('error', message, context, data),
});

/**
 * Default logger instance
 */
export const logger = {
  debug: (message: string, data?: unknown) => log('debug', message, undefined, data),
  info: (message: string, data?: unknown) => log('info', message, undefined, data),
  warn: (message: string, data?: unknown) => log('warn', message, undefined, data),
  error: (message: string, data?: unknown) => log('error', message, undefined, data),
  create: createLogger,
  configure: configureLogger,
};
