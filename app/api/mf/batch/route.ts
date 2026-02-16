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

interface MFAPIResponse {
  meta?: {
    scheme_code?: string;
    scheme_name?: string;
  };
  data?: Array<{ nav: string; date: string }>;
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
 */
async function handleMFBatchQuote(request: Request): Promise<NextResponse> {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const parsed = parseCommaSeparatedParam(searchParams, 'codes');
  if (parsed.error) return parsed.error;
  const codes = parsed.items;

  const cacheKey = `mf_batch_${codes.sort().join(',')}`;
  const cached = getCache<Record<string, MFQuoteData>>(cacheKey);
  if (cached) return createSuccessResponse(cached);

  try {
    const results: Record<string, MFQuoteData> = {};

    await Promise.all(
      codes.map(async (code) => {
        const individualCacheKey = `mf_quote_${code}`;
        const individualCached = getCache<MFQuoteData>(individualCacheKey);
        if (individualCached) {
          results[code] = individualCached;
          return;
        }

        try {
          const response = await fetchWithTimeout(`https://api.mfapi.in/mf/${code}`, {}, 5000);
          if (!response.ok) return;

          const data = (await response.json()) as MFAPIResponse;
          if (data?.meta && data.data && data.data.length > 0) {
            const latestNav = data.data[0];
            const previousNav = data.data.length > 1 ? data.data[1] : latestNav;
            const mfData: MFQuoteData = {
              schemeCode: data.meta.scheme_code || code,
              schemeName: data.meta.scheme_name || code,
              currentNav: parseFloat(latestNav.nav) || 0,
              previousNav: parseFloat(previousNav.nav) || 0,
              date: latestNav.date,
            };
            results[code] = mfData;
            setCache(individualCacheKey, mfData, 3600000);
          }
        } catch (err) {
          logError(`Failed to fetch MF ${code}:`, err);
        }
      })
    );

    setCache(cacheKey, results, 300000);
    return createSuccessResponse(results);
  } catch (error) {
    logError('Batch MF quote fetch failed', error, { codes: codes.join(',') });
    return createErrorResponse('Failed to fetch batch MF quotes', 500);
  }
}

export const GET = withErrorHandling(handleMFBatchQuote);
