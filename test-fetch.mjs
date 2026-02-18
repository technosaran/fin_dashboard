import { fetchBatchStockQuotes } from './lib/services/stock-fetcher';

async function test() {
  const symbols = ['RELIANCE', 'TCS', 'HDFCBANK'];
  console.log('Fetching quotes for:', symbols);
  try {
    const results = await fetchBatchStockQuotes(symbols);
    console.log('Results:', JSON.stringify(results, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
