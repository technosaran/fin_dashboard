/**
 * Secure API handler utilities
 * Provides consistent error handling, timeout management, and response formatting
 */

import { NextResponse } from 'next/server';
import { logError, logWarn } from '../utils/logger';

export interface ApiError {
  error: string;
  message?: string;
  status: number;
}

/**
 * Create a standardized error response
 */
export function createErrorResponse(message: string, status: number = 500): NextResponse {
  logWarn(`API Error: ${message}`, { status });
  return NextResponse.json({ error: message }, { status });
}

/**
 * Create a standardized success response
 */
export function createSuccessResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status });
}

/**
 * Fetch with timeout wrapper
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Safe JSON parse with error handling
 */
export async function safeJsonParse<T>(response: Response): Promise<T> {
  try {
    return await response.json();
  } catch (error) {
    logError('Failed to parse JSON response', error);
    throw new Error('Invalid JSON response from server');
  }
}

/**
 * Wrapper for API handlers with consistent error handling
 */
export function withErrorHandling(
  handler: (request: Request) => Promise<NextResponse>
) {
  return async (request: Request): Promise<NextResponse> => {
    try {
      return await handler(request);
    } catch (error) {
      logError('API handler error', error);

      if (error instanceof Error) {
        return createErrorResponse(error.message, 500);
      }

      return createErrorResponse('An unexpected error occurred', 500);
    }
  };
}

/**
 * Rate limiting storage (in-memory - for production use Redis)
 */
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

/**
 * Simple in-memory rate limiter
 * For production, use a proper rate limiting service like Upstash
 */
export function rateLimit(
  identifier: string,
  limit: number = 10,
  windowMs: number = 60000
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new record or reset expired one
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: limit - record.count };
}

/**
 * Get client IP address from request
 */
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');

  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return '127.0.0.1';
}

/**
 * Apply rate limiting to a request
 */
export function applyRateLimit(request: Request): NextResponse | null {
  const ip = getClientIP(request);
  const { success } = rateLimit(ip, 30, 60000); // 30 requests per minute

  if (!success) {
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': '0',
          'Retry-After': '60',
        },
      }
    );
  }

  return null;
}
/**
 * Simple in-memory cache for API responses
 */
const apiCache = new Map<string, { data: any; expire: number }>();

export function getCache<T>(key: string): T | null {
  const record = apiCache.get(key);
  if (record && Date.now() < record.expire) {
    return record.data as T;
  }
  if (record) {
    apiCache.delete(key);
  }
  return null;
}

export function setCache<T>(key: string, data: T, ttlMs: number = 300000): void {
  apiCache.set(key, { data, expire: Date.now() + ttlMs });
}
