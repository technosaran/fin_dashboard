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
  // We currently do not simulate fake prices to ensure data accuracy as per user request.
  // In a real implementation, this would fetch the live price from an exchange.

  return createSuccessResponse({
    isin: sanitizedIsin,
    currentPriceMultiplier: 1.0, // No change
    updatedAt: new Date().toISOString(),
  });
}

export const GET = withErrorHandling(handleBondQuote);
