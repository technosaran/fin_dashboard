import { NextResponse } from 'next/server';
import { validateStockQuery } from '@/lib/validators/input';
import {
  createErrorResponse,
  createSuccessResponse,
  fetchWithTimeout,
  withErrorHandling,
  applyRateLimit,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

/**
 * Mutual Fund search API endpoint with security enhancements
 */
async function handleMFSearch(request: Request): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return createErrorResponse('Query parameter "q" is required', 400);
  }

  // Validate input
  const validation = validateStockQuery(query);
  if (!validation.isValid) {
    return createErrorResponse(validation.error || 'Invalid query', 400);
  }

  try {
    const sanitizedQuery = query.trim();
    const encodedQuery = encodeURIComponent(sanitizedQuery);

    const response = await fetchWithTimeout(
      `https://api.mfapi.in/mf/search?q=${encodedQuery}`,
      {},
      5000
    );

    if (!response.ok) {
      throw new Error('Failed to search mutual funds');
    }

    const data = await response.json();

    interface MFSearchResult {
      schemeCode: string;
      schemeName: string;
    }

    const results = (Array.isArray(data) ? data : [])
      .map((item: MFSearchResult) => ({
        schemeCode: item.schemeCode,
        schemeName: item.schemeName,
      }))
      .slice(0, 20); // Limit to 20 results

    return createSuccessResponse(results);
  } catch (error) {
    logError('MF search failed', error, { query });

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return createErrorResponse('Request timeout. Please try again.', 504);
      }
      return createErrorResponse('Failed to search mutual funds. Please try again later.', 500);
    }

    return createErrorResponse('An unexpected error occurred', 500);
  }
}

export const GET = withErrorHandling(handleMFSearch);
