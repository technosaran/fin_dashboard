import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');

    if (!code) {
        return NextResponse.json({ error: 'Scheme code is required' }, { status: 400 });
    }

    try {
        const response = await fetch(`https://api.mfapi.in/mf/${code}`);
        const data = await response.json();

        if (data && data.meta) {
            const latestNav = data.data[0];
            return NextResponse.json({
                schemeCode: data.meta.scheme_code,
                schemeName: data.meta.scheme_name,
                category: data.meta.scheme_category,
                currentNav: parseFloat(latestNav.nav),
                date: latestNav.date
            });
        }

        return NextResponse.json({ error: 'Mutual fund not found' }, { status: 404 });
    } catch (error) {
        console.error('Error fetching mutual fund details:', error);
        return NextResponse.json({ error: 'Failed to fetch mutual fund details' }, { status: 500 });
    }
}
