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

// YTS Search - try multiple domains
async function searchYTS(query: string) {
    const domains = ['yts.lt', 'yts.mx', 'yts.unblockninja.com'];

    for (const domain of domains) {
        try {
            const apiUrl = `https://${domain}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=50`;

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': USER_AGENT,
                },
            });

            if (response.ok) {
                return response.json();
            }
        } catch {
            // Try next domain
            continue;
        }
    }

    throw new Error('All YTS domains failed');
}

// 1337x Search (try multiple public APIs)
async function search1337x(query: string) {
    const apis = [
        `https://1337x-api.onrender.com/search/${encodeURIComponent(query)}/1`,
        `https://1337x.unblockninja.com/search/${encodeURIComponent(query)}/1/`,
    ];

    for (const apiUrl of apis) {
        try {
            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': USER_AGENT,
                },
            });

            if (response.ok) {
                const data = await response.json();
                const torrents = data.torrents || data || [];
                if (torrents.length > 0) {
                    return torrents;
                }
            }
        } catch {
            continue;
        }
    }

    return [];
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
