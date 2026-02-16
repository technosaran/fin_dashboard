import {
  createSuccessResponse,
  createErrorResponse,
  applyRateLimit,
  withErrorHandling,
  deterministicHash,
} from '@/lib/services/api';

const BASE_RATES: Record<string, number> = {
  USDINR: 83.45,
  EURINR: 90.12,
  GBPINR: 105.67,
  JPYINR: 0.55,
};

/**
 * Forex quote API endpoint
 * Simulates fetching current exchange rates
 */
async function handleForexQuote(request: Request) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const pair = searchParams.get('pair') || 'USDINR';

  if (!/^[A-Z]{6,7}$/.test(pair.toUpperCase())) {
    return createErrorResponse('Invalid forex pair format', 400);
  }

  const sanitizedPair = pair.toUpperCase();
  const baseRate = BASE_RATES[sanitizedPair] || 83.45;

  const today = new Date().toISOString().split('T')[0];
  const hash = deterministicHash(sanitizedPair + today);
  const fluctuation = (Math.abs(hash) % 101) / 1000 - 0.05;

  return createSuccessResponse({
    pair: sanitizedPair,
    rate: Number((baseRate + fluctuation).toFixed(4)),
    updatedAt: new Date().toISOString(),
  });
}

export const GET = withErrorHandling(handleForexQuote);
