import { NextResponse } from 'next/server';
import { validateMFCode } from '@/lib/validators/input';
import {
  createErrorResponse,
  createSuccessResponse,
  fetchWithTimeout,
  withErrorHandling,
  applyRateLimit,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

/**
 * Mutual Fund quote API endpoint with security enhancements
 */
async function handleMFQuote(request: Request): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return createErrorResponse('Scheme code parameter is required', 400);
  }

  // Validate MF code
  const validation = validateMFCode(code);
  if (!validation.isValid) {
    return createErrorResponse(validation.error || 'Invalid scheme code', 400);
  }

  try {
    const sanitizedCode = code.trim();

    const response = await fetchWithTimeout(
      `https://api.mfapi.in/mf/${sanitizedCode}`,
      {},
      5000
    );

    if (!response.ok) {
      throw new Error('Failed to fetch mutual fund details');
    }

    const data = await response.json();

    if (data && data.meta && data.data && data.data.length > 0) {
      const latestNav = data.data[0];
      const previousNav = data.data.length > 1 ? data.data[1] : latestNav;
      return createSuccessResponse({
        schemeCode: data.meta.scheme_code,
        schemeName: data.meta.scheme_name,
        category: data.meta.scheme_category || 'N/A',
        currentNav: parseFloat(latestNav.nav) || 0,
        previousNav: parseFloat(previousNav.nav) || 0,
        date: latestNav.date,
      });
    }

    return createErrorResponse('Mutual fund not found', 404);
  } catch (error) {
    logError('MF quote fetch failed', error, { code });

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return createErrorResponse('Request timeout. Please try again.', 504);
      }
      return createErrorResponse('Failed to fetch mutual fund details. Please try again later.', 500);
    }

    return createErrorResponse('An unexpected error occurred', 500);
  }
}

export const GET = withErrorHandling(handleMFQuote);
