import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://query1.finance.yahoo.com/v1/finance/search?q=${query}&quotesCount=10&newsCount=0`);
        const data = await response.json();

        // Filter for Indian stocks (ending with .NS or .BO)
        const results = data.quotes
            .filter((quote: any) => quote.symbol.endsWith('.NS') || quote.symbol.endsWith('.BO'))
            .map((quote: any) => ({
                symbol: quote.symbol.split('.')[0],
                fullSymbol: quote.symbol,
                companyName: quote.longname || quote.shortname,
                exchange: quote.exchange,
                type: quote.quoteType
            }));

        return NextResponse.json(results);
    } catch (error) {
        console.error('Error searching stocks:', error);
        return NextResponse.json({ error: 'Failed to search stocks' }, { status: 500 });
    }
}
