import { NextResponse } from 'next/server';
import { validateStockQuery } from '@/lib/validators/input';
import {
  createErrorResponse,
  createSuccessResponse,
  fetchWithTimeout,
  withErrorHandling,
  applyRateLimit,
  getCache,
  setCache,
} from '@/lib/services/api';
import { logError } from '@/lib/utils/logger';

/**
 * Stock quote API endpoint with security enhancements
 */
async function handleStockQuote(request: Request): Promise<NextResponse> {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return createErrorResponse('Symbol parameter is required', 400);
  }

  // Validate symbol
  const validation = validateStockQuery(symbol);
  if (!validation.isValid) {
    return createErrorResponse(validation.error || 'Invalid symbol', 400);
  }

  const cacheKey = `stock_quote_${symbol.trim().toUpperCase()}`;
  const cached = getCache<any>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const sanitizedSymbol = symbol.trim().toUpperCase();

    // Try NSE first
    let response = await fetchWithTimeout(
      `https://query1.finance.yahoo.com/v8/finance/chart/${sanitizedSymbol}.NS?interval=1d&range=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      },
      5000
    );

    let data = await response.json();

    // If not found in NSE, try BSE
    if (!data.chart?.result) {
      response = await fetchWithTimeout(
        `https://query1.finance.yahoo.com/v8/finance/chart/${sanitizedSymbol}.BO?interval=1d&range=1d`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        },
        5000
      );
      data = await response.json();
    }

    if (data.chart?.result) {
      const meta = data.chart.result[0].meta;
      const quoteData = {
        symbol: meta.symbol.split('.')[0],
        currentPrice: meta.regularMarketPrice || 0,
        previousClose: meta.previousClose || 0,
        currency: meta.currency || 'INR',
        exchange: meta.exchangeName || 'NSE',
      };
      setCache(cacheKey, quoteData, 60000);
      return createSuccessResponse(quoteData);
    }

    return createErrorResponse('Symbol not found', 404);
  } catch (error) {
    logError('Stock quote fetch failed', error, { symbol });

    if (error instanceof Error) {
      if (error.message.includes('timeout')) {
        return createErrorResponse('Request timeout. Please try again.', 504);
      }
      return createErrorResponse('Failed to fetch stock quote. Please try again later.', 500);
    }

    return createErrorResponse('An unexpected error occurred', 500);
  }
}

export const GET = withErrorHandling(handleStockQuote);
