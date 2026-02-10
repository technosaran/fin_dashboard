import { NextResponse } from 'next/server';
import {
    createErrorResponse,
    createSuccessResponse,
    applyRateLimit,
} from '@/lib/services/api';

/**
 * Bond search API endpoint
 * Simulates fetching bond data (Featured Bonds from Wint Wealth style)
 */
export async function GET(request: Request) {
    // Apply rate limiting
    const rateLimitResponse = applyRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.toLowerCase() || '';

    // Mock bond data (Typical high-yield bonds found on Wint Wealth/GoldenPi)
    const bonds = [
        {
            isin: 'INE018E07BU2',
            name: 'SBI Tier 1 Bond',
            company_name: 'State Bank of India',
            coupon_rate: 8.1,
            face_value: 1000000,
            maturity_date: '2030-12-31',
            interest_frequency: 'Yearly',
            category: 'Banking/PSU',
            rating: 'AAA',
        },
        {
            isin: 'INE516A07QQ1',
            name: 'Piramal Capital NCD',
            company_name: 'Piramal Capital & Housing Finance',
            coupon_rate: 9.5,
            face_value: 1000,
            maturity_date: '2026-08-15',
            interest_frequency: 'Monthly',
            category: 'NBFC',
            rating: 'AA',
        },
        {
            isin: 'INE121A07PW3',
            name: 'Cholamandalam Investment NCD',
            company_name: 'Cholamandalam Investment and Finance',
            coupon_rate: 8.4,
            face_value: 1000,
            maturity_date: '2027-03-20',
            interest_frequency: 'Yearly',
            category: 'NBFC',
            rating: 'AA+',
        },
        {
            isin: 'INE081A08823',
            name: 'Tata Motors Finance Bond',
            company_name: 'Tata Motors Finance Limited',
            coupon_rate: 8.75,
            face_value: 1000,
            maturity_date: '2028-11-10',
            interest_frequency: 'Monthly',
            category: 'Corporate',
            rating: 'AA-',
        },
        {
            isin: 'INE296A07RQ1',
            name: 'Bajaj Finance NCD',
            company_name: 'Bajaj Finance Limited',
            coupon_rate: 7.9,
            face_value: 1000,
            maturity_date: '2029-05-25',
            interest_frequency: 'Yearly',
            category: 'NBFC',
            rating: 'AAA',
        },
        {
            isin: 'INE721L07BJ5',
            name: 'Shriram Finance NCD',
            company_name: 'Shriram Finance Limited',
            coupon_rate: 9.2,
            face_value: 1000,
            maturity_date: '2026-12-20',
            interest_frequency: 'Monthly',
            category: 'NBFC',
            rating: 'AA+',
        }
    ];

    const filteredBonds = bonds.filter(
        (b) =>
            b.name.toLowerCase().includes(query) ||
            b.company_name.toLowerCase().includes(query) ||
            b.isin.toLowerCase().includes(query)
    );

    return createSuccessResponse(filteredBonds);
}
