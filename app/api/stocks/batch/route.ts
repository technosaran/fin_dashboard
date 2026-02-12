import { NextResponse } from 'next/server';
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
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const symbolsParam = searchParams.get('symbols');

    if (!symbolsParam) {
        return createErrorResponse('Symbols parameter is required', 400);
    }

    const symbols = symbolsParam.split(',').map(s => s.trim().toUpperCase());

    if (symbols.length === 0) {
        return createErrorResponse('No valid symbols provided', 400);
    }

    if (symbols.length > 50) {
        return createErrorResponse('Maximum 50 symbols allowed per batch', 400);
    }

    const cacheKey = `batch_stocks_${symbols.sort().join(',')}`;
    const cached = getCache<Record<string, StockBatchQuote>>(cacheKey);
    if (cached) return createSuccessResponse(cached);

    try {
        // We'll query both .NS and .BO for each symbol to be safe, 
        // but typically users will have one or the other.
        // For batch efficiency, we'll construct a single query with .NS first
        const nseSymbols = symbols.map(s => `${s}.NS`).join(',');
        const bseSymbols = symbols.map(s => `${s}.BO`).join(',');
        const allSymbols = `${nseSymbols},${bseSymbols}`;

        const response = await fetchWithTimeout(
            `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${allSymbols}`,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                },
            },
            8000
        );

        const data = (await response.json()) as YahooBatchResponse;
        const result: Record<string, StockBatchQuote> = {};

        if (data.quoteResponse?.result) {
            data.quoteResponse.result.forEach((quote) => {
                if (!quote.symbol) return;
                const baseSymbol = quote.symbol.split('.')[0];
                // If we already have a price (maybe from NSE), don't overwrite with BSE unless NSE was null
                if (quote.regularMarketPrice && (!result[baseSymbol] || result[baseSymbol].currentPrice === 0)) {
                    result[baseSymbol] = {
                        symbol: baseSymbol,
                        currentPrice: quote.regularMarketPrice || 0,
                        previousClose: quote.regularMarketPreviousClose || 0,
                        currency: quote.currency || 'INR',
                        exchange: quote.fullExchangeName || 'NSE',
                        displayName: quote.shortName || quote.longName || baseSymbol
                    };
                }
            });
        }

        // --- SECONDARY FALLBACK: Google Finance ---
        // Identify symbols that still have 0 price or are completely missing
        const failedSymbols = symbols.filter(s => !result[s] || result[s].currentPrice === 0);

        if (failedSymbols.length > 0) {
            const { batchFetchGoogleFinance } = await import('@/lib/services/google-finance');
            const googleData = await batchFetchGoogleFinance(failedSymbols);

            Object.entries(googleData).forEach(([sym, data]) => {
                if (data.price > 0) {
                    result[sym] = {
                        symbol: sym,
                        currentPrice: data.price,
                        previousClose: data.previousClose,
                        currency: 'INR',
                        exchange: 'NSE/BSE (Google)',
                        displayName: sym
                    };
                }
            });
        }

        setCache(cacheKey, result, 60000); // Cache for 60 seconds (active markets)
        return createSuccessResponse(result);
    } catch (error) {
        logError('Batch stock quote fetch failed', error, { symbolsParam });
        return createErrorResponse('Failed to fetch batch quotes', 500);
    }
}

export const GET = withErrorHandling(handleBatchQuote);
