// API route to proxy PirateBay requests (bypasses CORS)
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const category = searchParams.get('cat') || '';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        const baseUrl = 'https://apibay.org';
        const apiUrl = category
            ? `${baseUrl}/q.php?q=${encodeURIComponent(query)}&cat=${category}`
            : `${baseUrl}/q.php?q=${encodeURIComponent(query)}`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data = await response.json();

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=60, s-maxage=60',
            },
        });
    } catch (error) {
        console.error('PirateBay API proxy error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch data from PirateBay' },
            { status: 500 }
        );
    }
}
