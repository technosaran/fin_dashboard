import { fetchGoogleFinancePrice } from './lib/services/google-finance';

async function test() {
  const ticker = 'RELIANCE';
  console.log('Fetching Google Finance for:', ticker);
  try {
    const result = await fetchGoogleFinancePrice(ticker, 'NSE');
    console.log('Result:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
