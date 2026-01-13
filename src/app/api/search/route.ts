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

// YTS Search - try multiple domains with failover
async function searchYTS(query: string) {
    // List of known YTS mirrors
    // yts.mx is the official one but often blocked
    // yts.lt and yts.am are common mirrors
    const domains = [
        'yts.mx',
        'yts.lt',
        'yts.am',
        'yts.ag'
    ];

    for (const domain of domains) {
        try {
            console.log(`[YTS] Trying ${domain}...`);
            // Updated query to match YTS API requirements and ensure sufficient results
            const apiUrl = `https://${domain}/api/v2/list_movies.json?query_term=${encodeURIComponent(query)}&limit=20`;

            // Add a short timeout to prevent hanging on bad mirrors
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            const response = await fetch(apiUrl, {
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': USER_AGENT,
                },
                signal: controller.signal
            });

            clearTimeout(timeoutId);

            if (response.ok) {
                const data = await response.json();
                // Basic validation to ensure we got a valid response structure
                if (data && data.status === 'ok' && data.data && data.data.movies) {
                    console.log(`[YTS] Success from ${domain}`);
                    return data;
                } else if (data && data.status === 'ok' && data.data && !data.data.movies) {
                    // Successful request but no movies found (empty result)
                    console.log(`[YTS] Success from ${domain} (no results)`);
                    return data;
                }
            } else {
                console.warn(`[YTS] ${domain} returned status ${response.status}`);
            }
        } catch (e) {
            // Ignore errors and try next domain
            const errorMessage = e instanceof Error ? e.message : String(e);
            console.warn(`[YTS] Failed to fetch from ${domain}: ${errorMessage}`);
            continue;
        }
    }

    // specific error so frontend knows all attempts failed
    console.error('[YTS] All domains failed');
    throw new Error('All YTS domains failed or returned no data');
}

// 1337x Search
// Currently disabled/stubbed because most public mirrors and proxies are blocked by Cloudflare/ISPs
// and require complex scraping or solver services (e.g. FlareSolverr) which are outside current scope.
async function search1337x(query: string) {
    console.warn(`1337x search for "${query}" skipped - mirrors unavailable/blocked.`);
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
