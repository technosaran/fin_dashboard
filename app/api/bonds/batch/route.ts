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

    isins.forEach((isin) => {
      const individualCacheKey = `bond_quote_${isin}`;
      const individualCached = getCache<BondQuoteData>(individualCacheKey);
      if (individualCached) {
        results[isin] = individualCached;
        return;
      }

      const hash = deterministicHash(isin + today);
      const fluctuation = (hash % 100) / 20000;

      const bondData: BondQuoteData = {
        isin,
        currentPriceMultiplier: 1 + fluctuation,
        updatedAt: new Date().toISOString(),
      };

      results[isin] = bondData;
      setCache(individualCacheKey, bondData, 3600000);
    });

    setCache(cacheKey, results, 300000);
    return createSuccessResponse(results);
  } catch (error) {
    logError('Batch bond quote fetch failed', error, { isins: isins.join(',') });
    return createErrorResponse('Failed to fetch batch bond quotes', 500);
  }
}

export const GET = withErrorHandling(handleBondBatchQuote);
