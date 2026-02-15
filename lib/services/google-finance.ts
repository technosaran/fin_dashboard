import { fetchWithTimeout } from './api';
import { logError } from '../utils/logger';

/**
 * Scrapes Google Finance for a stock price
 * Note: Scaping is brittle but often more reliable for Indian stocks than public Yahoo endpoints
 */
export async function fetchGoogleFinancePrice(
  symbol: string,
  exchange: string = 'NSE'
): Promise<{ price: number; previousClose: number } | null> {
  const ticker = `${symbol}:${exchange}`;
  const url = `https://www.google.com/finance/quote/${ticker}`;

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9',
        },
      },
      5000
    );

    if (!response.ok) return null;

    const html = await response.text();

    // Find price using regex in the meta tags or structured data
    // Pattern 1: Meta tag (often most reliable)
    const priceMatch =
      html.match(/<meta itemprop="price" content="([^"]+)"/) ||
      html.match(/data-last-price="([^"]+)"/) ||
      html.match(/class="YMlS7e">([^<]+)<\/div>/);

    let price = 0;
    if (priceMatch) {
      price = parseFloat(priceMatch[1].replace(/,/g, '').replace(/[^\d.]/g, ''));
    }

    // Pattern 2: Previous close
    const prevCloseMatch =
      html.match(/"?previousClose"?\s*:\s*"?([\d,.]+)"?/i) ||
      html.match(/data-last-close-price="([^"]+)"/) ||
      html.match(/>Previous close<\/div>.*?class="P639yc">([^<]+)</);

    let previousClose = price;
    if (prevCloseMatch) {
      previousClose = parseFloat(prevCloseMatch[1].replace(/,/g, '').replace(/[^\d.]/g, ''));
    }

    if (price > 0) {
      return { price, previousClose };
    }

    return null;
  } catch (error) {
    logError(`Google Finance fetch failed for ${ticker}:`, error);
    return null;
  }
}

/**
 * Batch fetch using parallel scraping - use sparingly
 * Wrapped in try/catch for each symbol to ensure partial successes
 */
export async function batchFetchGoogleFinance(
  symbols: string[]
): Promise<Record<string, { price: number; previousClose: number }>> {
  const results: Record<string, { price: number; previousClose: number }> = {};

  await Promise.all(
    symbols.map(async (symbol) => {
      try {
        // Try NSE first
        let data = await fetchGoogleFinancePrice(symbol, 'NSE');
        // If not found, try BSE
        if (!data) data = await fetchGoogleFinancePrice(symbol, 'BSE');

        if (data && data.price > 0) {
          results[symbol] = data;
        }
      } catch (err) {
        logError(`Batch item failed for ${symbol}:`, err);
      }
    })
  );

  return results;
}
