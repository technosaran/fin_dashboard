import { NextResponse } from 'next/server';
import {
    createErrorResponse,
    createSuccessResponse,
    applyRateLimit,
} from '@/lib/services/api';

/**
 * Bond quote API endpoint
 * Simulates fetching current valuation for a bond
 */
export async function GET(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const isin = searchParams.get('isin');

    if (!isin) {
        return createErrorResponse('ISIN parameter is required', 400);
    }

    // In a real app, we would fetch from a bond market data provider.
    // Here we simulate price fluctuations centered around 100% of face value.
    // Most bonds trade near their par value unless there's a default risk or major rate move.

    // Deterministic "random" price based on ISIN and current day
    const today = new Date().toISOString().split('T')[0];
    const seed = isin + today;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
        hash = seed.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Fluctuation within +/- 0.5%
    const fluctuation = (hash % 100) / 20000;
    const currentPriceMultiplier = 1 + fluctuation;

    return createSuccessResponse({
        isin,
        currentPriceMultiplier,
        updatedAt: new Date().toISOString(),
    });
}
