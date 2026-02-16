import {
  createSuccessResponse,
  createErrorResponse,
  applyRateLimit,
  withErrorHandling,
} from '@/lib/services/api';
import { validateStockQuery } from '@/lib/validators/input';

/**
 * Bond search API endpoint
 * Simulates fetching bond data (Featured Bonds from Wint Wealth style) with improved validation
 */
async function handleBondSearch(request: Request) {
  // Apply rate limiting
  const rateLimitResponse = applyRateLimit(request);
  if (rateLimitResponse) return rateLimitResponse;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.toLowerCase() || '';

  // Validate query if provided
  if (query && query.length > 0) {
    const validation = validateStockQuery(query);
    if (!validation.isValid) {
      return createErrorResponse(validation.error || 'Invalid search query', 400);
    }
  }

  const sanitizedQuery = query.trim().toLowerCase();

  // Mock bond data (Typical high-yield bonds found on Wint Wealth/GoldenPi)
  const bonds = [
    // Banking & PSU
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
      isin: 'INE062A08216',
      name: 'SBI Perp 7.72 Bond',
      company_name: 'State Bank of India',
      coupon_rate: 7.72,
      face_value: 1000000,
      maturity_date: '2099-12-31',
      interest_frequency: 'Yearly',
      category: 'Banking/PSU',
      rating: 'AAA',
    },
    {
      isin: 'INE028A08257',
      name: 'Bank of Baroda AT1',
      company_name: 'Bank of Baroda',
      coupon_rate: 8.25,
      face_value: 1000000,
      maturity_date: '2099-12-31',
      interest_frequency: 'Yearly',
      category: 'Banking/PSU',
      rating: 'AA+',
    },

    // NBFCs & Corporate
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
    },
    {
      isin: 'INE511C08AK8',
      name: 'Poonawalla Fincorp NCD',
      company_name: 'Poonawalla Fincorp Limited',
      coupon_rate: 8.8,
      face_value: 1000,
      maturity_date: '2025-06-30',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AAA',
    },
    {
      isin: 'INE414G07HS9',
      name: 'Muthoot Finance NCD',
      company_name: 'Muthoot Finance Limited',
      coupon_rate: 9.0,
      face_value: 1000,
      maturity_date: '2027-01-15',
      interest_frequency: 'Monthly',
      category: 'NBFC',
      rating: 'AA+',
    },
    {
      isin: 'INE652X07019',
      name: 'Navi Technologies NCD',
      company_name: 'Navi Technologies Limited',
      coupon_rate: 10.5,
      face_value: 1000,
      maturity_date: '2026-05-10',
      interest_frequency: 'Monthly',
      category: 'NBFC',
      rating: 'A',
    },
    {
      isin: 'INE245A07FY9',
      name: 'Tata Capital NCD',
      company_name: 'Tata Capital Financial Services',
      coupon_rate: 8.1,
      face_value: 1000,
      maturity_date: '2028-09-12',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AAA',
    },
    {
      isin: 'INE539K07230',
      name: 'CreditAccess Grameen NCD',
      company_name: 'CreditAccess Grameen Limited',
      coupon_rate: 9.48,
      face_value: 1000,
      maturity_date: '2026-11-20',
      interest_frequency: 'Monthly',
      category: 'NBFC',
      rating: 'AA-',
    },
    {
      isin: 'INE020G07156',
      name: 'Manappuram Finance NCD',
      company_name: 'Manappuram Finance Limited',
      coupon_rate: 9.25,
      face_value: 1000,
      maturity_date: '2027-04-15',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AA',
    },
    {
      isin: 'INE756I08041',
      name: 'HDB Financial Bond',
      company_name: 'HDB Financial Services Limited',
      coupon_rate: 8.35,
      face_value: 1000,
      maturity_date: '2025-10-10',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AAA',
    },

    // Infrastructure & PSU Corp
    {
      isin: 'INE752E07NT7',
      name: 'REC Tax Free Bond',
      company_name: 'REC Limited',
      coupon_rate: 8.12,
      face_value: 1000,
      maturity_date: '2029-03-15',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE906B07DT1',
      name: 'NHAI Tax Free Bond',
      company_name: 'National Highways Authority of India',
      coupon_rate: 8.3,
      face_value: 1000,
      maturity_date: '2030-01-25',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE053F07937',
      name: 'PFC Tax Free Bond',
      company_name: 'Power Finance Corporation',
      coupon_rate: 8.2,
      face_value: 1000,
      maturity_date: '2028-07-30',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE733E07364',
      name: 'NTPC Bond Series I',
      company_name: 'NTPC Limited',
      coupon_rate: 7.8,
      face_value: 1000,
      maturity_date: '2032-12-15',
      interest_frequency: 'Yearly',
      category: 'PSU',
      rating: 'AAA',
    },
  ];

  const filteredBonds = bonds.filter(
    (b) =>
      b.name.toLowerCase().includes(sanitizedQuery) ||
      b.company_name.toLowerCase().includes(sanitizedQuery) ||
      b.isin.toLowerCase().includes(sanitizedQuery)
  );

  return createSuccessResponse(filteredBonds.slice(0, 50));
}

export const GET = withErrorHandling(handleBondSearch);
