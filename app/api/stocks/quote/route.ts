import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');

    if (!symbol) {
        return NextResponse.json({ error: 'Symbol is required' }, { status: 400 });
    }

    try {
        // Try NSE first
        let response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.NS?interval=1d&range=1d`);
        let data = await response.json();

        // If not found in NSE, try BSE
        if (!data.chart.result) {
            response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}.BO?interval=1d&range=1d`);
            data = await response.json();
        }

        if (data.chart.result) {
            const meta = data.chart.result[0].meta;
            return NextResponse.json({
                symbol: meta.symbol.split('.')[0],
                currentPrice: meta.regularMarketPrice,
                previousClose: meta.previousClose,
                currency: meta.currency,
                exchange: meta.exchangeName
            });
        }

        return NextResponse.json({ error: 'Symbol not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching stock quote:', error);
        return NextResponse.json({ error: 'Failed to fetch stock quote' }, { status: 500 });
    }
}
