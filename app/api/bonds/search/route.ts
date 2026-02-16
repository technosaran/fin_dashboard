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

  // Expanded Mock bond data (Realistic Indian Bond Market Data)
  const bonds = [
    // --- Sovereign Gold Bonds (SGBs) ---
    {
      isin: 'IN0020230085',
      name: 'SGB 2023-24 Series I',
      company_name: 'Government of India',
      coupon_rate: 2.50,
      face_value: 5926,
      maturity_date: '2031-06-27',
      interest_frequency: 'Half-Yearly',
      category: 'SGB',
      rating: 'SOV',
    },
    {
      isin: 'IN0020230093',
      name: 'SGB 2023-24 Series II',
      company_name: 'Government of India',
      coupon_rate: 2.50,
      face_value: 5923,
      maturity_date: '2031-09-20',
      interest_frequency: 'Half-Yearly',
      category: 'SGB',
      rating: 'SOV',
    },
    {
      isin: 'IN0020220045',
      name: 'SGB 2022-23 Series I',
      company_name: 'Government of India',
      coupon_rate: 2.50,
      face_value: 5091,
      maturity_date: '2030-06-28',
      interest_frequency: 'Half-Yearly',
      category: 'SGB',
      rating: 'SOV',
    },
    {
      isin: 'IN0020220078',
      name: 'SGB 2022-23 Series II',
      company_name: 'Government of India',
      coupon_rate: 2.50,
      face_value: 5197,
      maturity_date: '2030-08-30',
      interest_frequency: 'Half-Yearly',
      category: 'SGB',
      rating: 'SOV',
    },

    // --- Banking & PSU Tax Free Bonds ---
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
      isin: 'INE906B07DT1',
      name: 'NHAI Tax Free Bond 2030',
      company_name: 'National Highways Authority of India',
      coupon_rate: 8.3,
      face_value: 1000,
      maturity_date: '2030-01-25',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE752E07NT7',
      name: 'REC Tax Free Bond 2029',
      company_name: 'REC Limited',
      coupon_rate: 8.12,
      face_value: 1000,
      maturity_date: '2029-03-15',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE134E07439',
      name: 'PFC Tax Free Bond 2031',
      company_name: 'Power Finance Corporation',
      coupon_rate: 8.5,
      face_value: 1000,
      maturity_date: '2031-10-15',
      interest_frequency: 'Yearly',
      category: 'Infrastructure',
      rating: 'AAA',
    },
    {
      isin: 'INE261F07066',
      name: 'NABARD Tax Free Bond',
      company_name: 'NABARD',
      coupon_rate: 7.64,
      face_value: 1000,
      maturity_date: '2031-03-23',
      interest_frequency: 'Yearly',
      category: 'PSU',
      rating: 'AAA',
    },

    // --- Popular Corporate NCDs ---
    {
      isin: 'INE516A07QQ1',
      name: 'Piramal Capital NCD 2026',
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
      name: 'Cholamandalam Inv NCD 2027',
      company_name: 'Cholamandalam Investment and Finance',
      coupon_rate: 8.4,
      face_value: 1000,
      maturity_date: '2027-03-20',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AA+',
    },
    {
      isin: 'INE296A07RQ1',
      name: 'Bajaj Finance NCD 2029',
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
      name: 'Shriram Finance NCD 2026',
      company_name: 'Shriram Finance Limited',
      coupon_rate: 9.2,
      face_value: 1000,
      maturity_date: '2026-12-20',
      interest_frequency: 'Monthly',
      category: 'NBFC',
      rating: 'AA+',
    },
    {
      isin: 'INE414G07HS9',
      name: 'Muthoot Finance NCD 2027',
      company_name: 'Muthoot Finance Limited',
      coupon_rate: 9.0,
      face_value: 1000,
      maturity_date: '2027-01-15',
      interest_frequency: 'Monthly',
      category: 'NBFC',
      rating: 'AA+',
    },
    {
      isin: 'INE245A07FY9',
      name: 'Tata Capital NCD 2028',
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
      name: 'HDB Financial Bond 2025',
      company_name: 'HDB Financial Services Limited',
      coupon_rate: 8.35,
      face_value: 1000,
      maturity_date: '2025-10-10',
      interest_frequency: 'Yearly',
      category: 'NBFC',
      rating: 'AAA',
    },
    // --- State Development Loans (SDLs) ---
    {
      isin: 'IN2220230058',
      name: 'Maharashtra SDL 2033',
      company_name: 'State Government of Maharashtra',
      coupon_rate: 7.64,
      face_value: 10000,
      maturity_date: '2033-06-14',
      interest_frequency: 'Half-Yearly',
      category: 'SDL',
      rating: 'SOV',
    },
    {
      isin: 'IN2920230040',
      name: 'Rajasthan SDL 2033',
      company_name: 'State Government of Rajasthan',
      coupon_rate: 7.68,
      face_value: 10000,
      maturity_date: '2033-06-21',
      interest_frequency: 'Half-Yearly',
      category: 'SDL',
      rating: 'SOV',
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
