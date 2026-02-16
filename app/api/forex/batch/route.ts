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

interface ForexQuoteData {
  pair: string;
  rate: number;
  updatedAt: string;
}

const BASE_RATES: Record<string, number> = {
  USDINR: 83.45,
  EURINR: 90.12,
  GBPINR: 105.67,
  JPYINR: 0.55,
};

/**
 * Batch Forex quote API endpoint
 */
async function handleForexBatchQuote(request: Request): Promise<NextResponse> {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const parsed = parseCommaSeparatedParam(searchParams, 'pairs', {
    transform: (s) => s.trim().toUpperCase(),
  });
  if (parsed.error) return parsed.error;
  const pairs = parsed.items;

  for (const pair of pairs) {
    if (!/^[A-Z]{6,7}$/.test(pair)) {
      return createErrorResponse(`Invalid forex pair format: ${pair}`, 400);
    }
  }

  const cacheKey = `forex_batch_${pairs.sort().join(',')}`;
  const cached = getCache<Record<string, ForexQuoteData>>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const results: Record<string, ForexQuoteData> = {};
    const today = new Date().toISOString().split('T')[0];

    pairs.forEach((pair) => {
      const hash = deterministicHash(pair + today);
      const baseRate = BASE_RATES[pair] || 83.45;
      const fluctuation = (Math.abs(hash) % 101) / 1000 - 0.05;

      results[pair] = {
        pair,
        rate: Number((baseRate + fluctuation).toFixed(4)),
        updatedAt: new Date().toISOString(),
      };
    });

    setCache(cacheKey, results, 60000);
    return createSuccessResponse(results);
  } catch (error) {
    logError('Batch forex quote fetch failed', error, { pairs: pairs.join(',') });
    return createErrorResponse('Failed to fetch batch forex quotes', 500);
  }
}

export const GET = withErrorHandling(handleForexBatchQuote);
