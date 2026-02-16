import { NextResponse } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  withErrorHandling,
  applyRateLimit,
  getCache,
  setCache,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

interface BondQuoteData {
  isin: string;
  currentPriceMultiplier: number;
  updatedAt: string;
}

/**
 * Batch Bond quote API endpoint
 * Aggregates multiple bond price calculations into one response
 */
async function handleBondBatchQuote(request: Request): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const isinsParam = searchParams.get('isins');

  if (!isinsParam) {
    return createErrorResponse('ISINS parameter is required', 400);
  }

  const isins = isinsParam
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  if (isins.length === 0) {
    return createErrorResponse('No valid ISINs provided', 400);
  }

  if (isins.length > 50) {
    return createErrorResponse('Maximum 50 ISINs allowed per batch', 400);
  }

  const cacheKey = `bonds_batch_${isins.sort().join(',')}`;
  const cached = getCache<Record<string, BondQuoteData>>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const results: Record<string, BondQuoteData> = {};
    const today = new Date().toISOString().split('T')[0];

    // Process them
    isins.forEach((isin) => {
      // Check individual cache first
      const individualCacheKey = `bond_quote_${isin}`;
      const individualCached = getCache<BondQuoteData>(individualCacheKey);

      if (individualCached) {
        results[isin] = individualCached;
        return;
      }

      // Simulate deterministic price based on ISIN and current day
      // (Matching the logic in quote/route.ts)
      const seed = isin + today;
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
      }

      // Fluctuation within +/- 0.5%
      const fluctuation = (hash % 100) / 20000;
      const currentPriceMultiplier = 1 + fluctuation;

      const bondData = {
        isin,
        currentPriceMultiplier,
        updatedAt: new Date().toISOString(),
      };

      results[isin] = bondData;
      setCache(individualCacheKey, bondData, 3600000); // Cache for 1 hour
    });

    setCache(cacheKey, results, 300000); // Cache batch result for 5 mins
    return createSuccessResponse(results);
  } catch (error) {
    logError('Batch bond quote fetch failed', error, { isinsParam });
    return createErrorResponse('Failed to fetch batch bond quotes', 500);
  }
}

export const GET = withErrorHandling(handleBondBatchQuote);
