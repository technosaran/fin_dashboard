import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
        return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.mfapi.in/mf/search?q=${query}`);
        const data = await response.json();

        return NextResponse.json(data.map((item: any) => ({
            schemeCode: item.schemeCode,
            schemeName: item.schemeName
        })));
    } catch (error) {
        console.error('Error searching mutual funds:', error);
        return NextResponse.json({ error: 'Failed to search mutual funds' }, { status: 500 });
    }
}
