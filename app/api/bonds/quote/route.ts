import {
  createSuccessResponse,
  createErrorResponse,
  applyRateLimit,
  withErrorHandling,
  deterministicHash,
} from '@/lib/services/api';

/**
 * Bond quote API endpoint
 * Simulates fetching current valuation for a bond
 */
async function handleBondQuote(request: Request) {
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const isin = searchParams.get('isin');

  if (!isin) {
    return createErrorResponse('ISIN parameter is required', 400);
  }

  if (!/^[A-Z]{2}[A-Z0-9]{10}$/i.test(isin)) {
    return createErrorResponse('Invalid ISIN format (expected 12 alphanumeric characters)', 400);
  }

  const sanitizedIsin = isin.toUpperCase();
  const today = new Date().toISOString().split('T')[0];
  const hash = deterministicHash(sanitizedIsin + today);
  const fluctuation = (hash % 100) / 20000;

  return createSuccessResponse({
    isin: sanitizedIsin,
    currentPriceMultiplier: 1 + fluctuation,
    updatedAt: new Date().toISOString(),
  });
}

export const GET = withErrorHandling(handleBondQuote);
