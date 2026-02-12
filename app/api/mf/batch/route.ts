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

interface MFNavPoint {
    nav: string;
    date: string;
}

interface MFAPIResponse {
    meta?: {
        scheme_code?: string;
        scheme_name?: string;
    };
    data?: MFNavPoint[];
}

interface MFQuoteData {
    schemeCode: string;
    schemeName: string;
    currentNav: number;
    previousNav: number;
    date: string;
}

/**
 * Batch Mutual Fund quote API endpoint
 * Aggregates multiple MFAPI calls into one response for the UI
 */
async function handleMFBatchQuote(request: Request): Promise<NextResponse> {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const codesParam = searchParams.get('codes');

    if (!codesParam) {
        return createErrorResponse('Codes parameter is required', 400);
    }

    const codes = codesParam.split(',').map(s => s.trim());

    if (codes.length === 0) {
        return createErrorResponse('No valid codes provided', 400);
    }

    const cacheKey = `mf_batch_${codes.sort().join(',')}`;
    const cached = getCache<Record<string, MFQuoteData>>(cacheKey);
    if (cached) return createSuccessResponse(cached);

    try {
        const results: Record<string, MFQuoteData> = {};

        // We'll process them in parallel but on the server side
        await Promise.all(codes.map(async (code) => {
            // Check individual cache first
            const individualCacheKey = `mf_quote_${code}`;
            const individualCached = getCache<MFQuoteData>(individualCacheKey);

            if (individualCached) {
                results[code] = individualCached;
                return;
            }

            try {
                const response = await fetchWithTimeout(`https://api.mfapi.in/mf/${code}`, {}, 5000);
                if (response.ok) {
                    const data = (await response.json()) as MFAPIResponse;
                    if (data && data.meta && data.data && data.data.length > 0) {
                        const latestNav = data.data[0];
                        const previousNav = data.data.length > 1 ? data.data[1] : latestNav;
                        const mfData = {
                            schemeCode: data.meta.scheme_code || code,
                            schemeName: data.meta.scheme_name || code,
                            currentNav: parseFloat(latestNav.nav) || 0,
                            previousNav: parseFloat(previousNav.nav) || 0,
                            date: latestNav.date,
                        };
                        results[code] = mfData;
                        setCache(individualCacheKey, mfData, 3600000); // Cache MF for 1 hour as prices update daily
                    }
                }
            } catch (err) {
                logError(`Failed to fetch MF ${code}:`, err);
            }
        }));

        setCache(cacheKey, results, 300000); // Cache batch result for 5 mins
        return createSuccessResponse(results);
    } catch (error) {
        logError('Batch MF quote fetch failed', error, { codesParam });
        return createErrorResponse('Failed to fetch batch MF quotes', 500);
    }
}

export const GET = withErrorHandling(handleMFBatchQuote);
