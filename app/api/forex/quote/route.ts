import {
    createErrorResponse,
    createSuccessResponse,
    applyRateLimit,
} from '@/lib/services/api';

/**
 * Forex quote API endpoint
 * Simulates fetching current exchange rates
 */
export async function GET(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const pair = searchParams.get('pair') || 'USDINR';

    // Dummy rates for simulation
    const rates: Record<string, number> = {
        'USDINR': 83.45,
        'EURINR': 90.12,
        'GBPINR': 105.67,
        'JPYINR': 0.55,
    };

    const baseRate = rates[pair.toUpperCase()] || 83.45;

    // Small deterministic fluctuation
    const today = new Date().toISOString().split('T')[0];
    const seed = pair + today;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }
    const fluctuation = (hash % 100) / 1000 - 0.05; // +/- 0.05
    const rate = baseRate + fluctuation;

    return createSuccessResponse({
        pair: pair.toUpperCase(),
        rate: Number(rate.toFixed(4)),
        updatedAt: new Date().toISOString(),
    });
}
