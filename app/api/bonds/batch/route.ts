import { NextResponse } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  applyRateLimit,
  getCache,
  setCache,
  parseCommaSeparatedParam,
  deterministicHash,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

interface BondQuoteData {
  isin: string;
  currentPriceMultiplier: number;
  updatedAt: string;
}

/**
 * Batch Bond quote API endpoint
 */
async function handleBondBatchQuote(request: Request): Promise<NextResponse> {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const parsed = parseCommaSeparatedParam(searchParams, 'isins', {
    transform: (s) => s.trim().toUpperCase(),
  });
  if (parsed.error) return parsed.error;
  const isins = parsed.items;

  for (const isin of isins) {
    if (!/^[A-Z]{2}[A-Z0-9]{10}$/.test(isin)) {
      return createErrorResponse(`Invalid ISIN format: ${isin}`, 400);
    }
  }

  const cacheKey = `bonds_batch_${isins.sort().join(',')}`;
  const cached = getCache<Record<string, BondQuoteData>>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const results: Record<string, BondQuoteData> = {};
    const today = new Date().toISOString().split('T')[0];

    // We currently do not have a reliable source for live bond prices.
    // To ensure "exact data" as requested by the user, we will NOT simulate prices with random fluctuations.
    // This preserves the price entered by the user manually or during addition.
    // In the future, this can be connected to a real bond market API.

    // results[isin] = ... (Disabled to prevent data corruption)

    setCache(cacheKey, results, 300000);
    return createSuccessResponse(results);
  } catch (error) {
    logError('Batch bond quote fetch failed', error, { isins: isins.join(',') });
    return createErrorResponse('Failed to fetch batch bond quotes', 500);
  }
}

export const GET = withErrorHandling(handleBondBatchQuote);
