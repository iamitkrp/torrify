// API route to proxy torrent search requests (bypasses CORS)
// Supports: PirateBay, YTS, 1337x
import { NextRequest, NextResponse } from 'next/server';

const USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// PirateBay Search
async function searchPirateBay(query: string, category?: string) {
    const baseUrl = 'https://apibay.org';
    const apiUrl = category
        ? `${baseUrl}/q.php?q=${encodeURIComponent(query)}&cat=${category}`
        : `${baseUrl}/q.php?q=${encodeURIComponent(query)}`;

    const response = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': USER_AGENT,
        },
    });

    if (!response.ok) {
        throw new Error(`PirateBay API failed: ${response.status}`);
    }

    return response.json();
}

// YTS Search
async function searchYTS(query: string) {
    const apiUrl = `https://yts.mx/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=50`;

    const response = await fetch(apiUrl, {
        headers: {
            'Accept': 'application/json',
            'User-Agent': USER_AGENT,
        },
    });

    if (!response.ok) {
        throw new Error(`YTS API failed: ${response.status}`);
    }

    return response.json();
}

// 1337x Search (scraping approach since no official API)
async function search1337x(query: string) {
    // 1337x doesn't have an official API, so we'll use a public scraper API
    // or return empty for now
    try {
        // Try using a public 1337x API proxy if available
        const apiUrl = `https://1337x-api.onrender.com/search/${encodeURIComponent(query)}/1`;

        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/json',
                'User-Agent': USER_AGENT,
            },
        });

        if (!response.ok) {
            return [];
        }

        const data = await response.json();
        return data.torrents || data || [];
    } catch {
        // If 1337x scraper fails, return empty array
        return [];
    }
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q') || '';
    const source = searchParams.get('source') || 'piratebay';
    const category = searchParams.get('cat') || '';

    if (!query) {
        return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    try {
        let data;

        switch (source) {
            case 'yts':
                data = await searchYTS(query);
                break;
            case '1337x':
                data = await search1337x(query);
                break;
            case 'piratebay':
            default:
                data = await searchPirateBay(query, category);
                break;
        }

        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, max-age=60, s-maxage=60',
            },
        });
    } catch (error) {
        console.error(`${source} API proxy error:`, error);
        return NextResponse.json(
            { error: `Failed to fetch data from ${source}` },
            { status: 500 }
        );
    }
}
