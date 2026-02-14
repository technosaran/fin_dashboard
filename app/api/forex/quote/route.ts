import {
    createSuccessResponse,
    createErrorResponse,
    applyRateLimit,
    withErrorHandling,
} from '@/lib/services/api';

/**
 * Forex quote API endpoint
 * Simulates fetching current exchange rates with improved validation
 */
async function handleForexQuote(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair') || 'USDINR';

    // Validate pair format (should be 6-7 uppercase letters like USDINR or JPYINR)
    if (!/^[A-Z]{6,7}$/.test(pair.toUpperCase())) {
        return createErrorResponse('Invalid forex pair format', 400);
    }

    const sanitizedPair = pair.toUpperCase();

    // Dummy rates for simulation
    const rates: Record<string, number> = {
        'USDINR': 83.45,
        'EURINR': 90.12,
        'GBPINR': 105.67,
        'JPYINR': 0.55,
    };

    const baseRate = rates[sanitizedPair] || 83.45;

    // Small deterministic fluctuation
    const today = new Date().toISOString().split('T')[0];
    const seed = sanitizedPair + today;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const fluctuation = (Math.abs(hash) % 101) / 1000 - 0.05; // +/- 0.05
    const rate = baseRate + fluctuation;

    return createSuccessResponse({
        pair: sanitizedPair,
        rate: Number(rate.toFixed(4)),
        updatedAt: new Date().toISOString(),
    });
}

export const GET = withErrorHandling(handleForexQuote);
