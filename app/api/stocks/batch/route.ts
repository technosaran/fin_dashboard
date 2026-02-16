import { NextResponse } from 'next/server';
import {
  createErrorResponse,
  createSuccessResponse,
  fetchWithTimeout,
  withErrorHandling,
  applyRateLimit,
  getCache,
  setCache,
  parseCommaSeparatedParam,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

interface YahooBatchQuote {
  symbol?: string;
  regularMarketPrice?: number;
  regularMarketPreviousClose?: number;
  currency?: string;
  fullExchangeName?: string;
  shortName?: string;
  longName?: string;
}

interface YahooBatchResponse {
  quoteResponse?: {
    result?: YahooBatchQuote[];
  };
}

interface StockBatchQuote {
  symbol: string;
  currentPrice: number;
  previousClose: number;
  currency: string;
  exchange: string;
  displayName: string;
}

/**
 * Batch stock quote API endpoint
 */
async function handleBatchQuote(request: Request): Promise<NextResponse> {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const parsed = parseCommaSeparatedParam(searchParams, 'symbols', {
    transform: (s) => s.trim().toUpperCase(),
  });
  if (parsed.error) return parsed.error;
  const symbols = parsed.items;

  const cacheKey = `batch_stocks_${symbols.sort().join(',')}`;
  const cached = getCache<Record<string, StockBatchQuote>>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const nseSymbols = symbols.map((s) => `${s}.NS`).join(',');
    const bseSymbols = symbols.map((s) => `${s}.BO`).join(',');

    const response = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${nseSymbols},${bseSymbols}`,
      { headers: { 'User-Agent': 'Mozilla/5.0' } },
      8000
    );

    const data = (await response.json()) as YahooBatchResponse;
    const result: Record<string, StockBatchQuote> = {};

    if (data.quoteResponse?.result) {
      for (const quote of data.quoteResponse.result) {
        if (!quote.symbol) continue;
        const baseSymbol = quote.symbol.split('.')[0];
        if (
          quote.regularMarketPrice &&
          (!result[baseSymbol] || result[baseSymbol].currentPrice === 0)
        ) {
          result[baseSymbol] = {
            symbol: baseSymbol,
            currentPrice: quote.regularMarketPrice || 0,
            previousClose: quote.regularMarketPreviousClose || 0,
            currency: quote.currency || 'INR',
            exchange: quote.fullExchangeName || 'NSE',
            displayName: quote.shortName || quote.longName || baseSymbol,
          };
        }
      }
    }

    // Fallback: Google Finance for symbols with no Yahoo data
    const failedSymbols = symbols.filter((s) => !result[s] || result[s].currentPrice === 0);
    if (failedSymbols.length > 0) {
      const { batchFetchGoogleFinance } = await import('@/lib/services/google-finance');
      const googleData = await batchFetchGoogleFinance(failedSymbols);

      for (const [sym, gData] of Object.entries(googleData)) {
        if (gData.price > 0) {
          result[sym] = {
            symbol: sym,
            currentPrice: gData.price,
            previousClose: gData.previousClose,
            currency: 'INR',
            exchange: 'NSE/BSE (Google)',
            displayName: sym,
          };
        }
      }
    }

    setCache(cacheKey, result, 60000);
    return createSuccessResponse(result);
  } catch (error) {
    logError('Batch stock quote fetch failed', error, { symbols: symbols.join(',') });
    return createErrorResponse('Failed to fetch batch quotes', 500);
  }
}

export const GET = withErrorHandling(handleBatchQuote);
