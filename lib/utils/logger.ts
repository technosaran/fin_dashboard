/**
 * Centralized logging utility with sanitization for production
 * Prevents sensitive data from being logged in production
 */

import { isDevelopment } from '../config/env';

interface LogContext {
  [key: string]: unknown;
}

/**
 * Sanitize sensitive data from log context
 */
function sanitizeContext(context?: LogContext): LogContext | undefined {
  if (!context) return undefined;

  const sanitized = { ...context };
  const sensitiveKeys = ['password', 'token', 'secret', 'key', 'authorization', 'cookie'];

  Object.keys(sanitized).forEach((key) => {
    if (sensitiveKeys.some((sensitive) => key.toLowerCase().includes(sensitive))) {
      sanitized[key] = '[REDACTED]';
    }
  });

  return sanitized;
}

/**
 * Log info message
 */
export function logInfo(message: string, context?: LogContext): void {
  if (isDevelopment) {
    console.log(`[INFO] ${message}`, context || '');
  }
}

/**
 * Log warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  if (isDevelopment) {
    console.warn(`[WARN] ${message}`, context || '');
  } else {
    // In production, you would send this to a monitoring service
    console.warn(`[WARN] ${message}`);
  }
}

/**
 * Log error message
 */
export function logError(message: string, error?: Error | unknown, context?: LogContext): void {
  const sanitizedContext = sanitizeContext(context);

  if (isDevelopment) {
    console.error(`[ERROR] ${message}`, error || '', sanitizedContext || '');
  } else {
    // In production, send to error monitoring service (e.g., Sentry)
    console.error(`[ERROR] ${message}`);
    
    // TODO: Send to Sentry or other monitoring service
    // Sentry.captureException(error, { contexts: { custom: sanitizedContext } });
  }
}

/**
 * Log debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (isDevelopment) {
    console.debug(`[DEBUG] ${message}`, context || '');
  }
}

/**
 * Create a logger instance with a specific prefix
 */
export function createLogger(prefix: string) {
  return {
    info: (message: string, context?: LogContext) => logInfo(`[${prefix}] ${message}`, context),
    warn: (message: string, context?: LogContext) => logWarn(`[${prefix}] ${message}`, context),
    error: (message: string, error?: Error | unknown, context?: LogContext) => 
      logError(`[${prefix}] ${message}`, error, context),
    debug: (message: string, context?: LogContext) => logDebug(`[${prefix}] ${message}`, context),
  };
}
