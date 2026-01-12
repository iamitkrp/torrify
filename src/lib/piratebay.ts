// PirateBay API Service
// Uses the apibay.org API (used by thepiratebay.org)

import { Torrent, TorrentCategory } from './types';
import { generateMagnetLink } from './utils';

// PirateBay API response interface
interface PirateBayTorrent {
    id: string;
    name: string;
    info_hash: string;
    leechers: string;
    seeders: string;
    num_files: string;
    size: string;
    username: string;
    added: string;
    status: string;
    category: string;
    imdb: string;
}

// Category mapping from PirateBay categories to our categories
const categoryMap: Record<string, TorrentCategory> = {
    '100': 'music',
    '101': 'music',
    '102': 'music',
    '103': 'music',
    '104': 'music',
    '199': 'music',
    '200': 'movies',
    '201': 'movies',
    '202': 'movies',
    '203': 'movies',
    '204': 'movies',
    '205': 'movies',
    '206': 'movies',
    '207': 'movies',
    '208': 'movies',
    '209': 'tv',
    '299': 'movies',
    '300': 'software',
    '301': 'software',
    '302': 'software',
    '303': 'software',
    '304': 'software',
    '305': 'software',
    '306': 'software',
    '399': 'software',
    '400': 'games',
    '401': 'games',
    '402': 'games',
    '403': 'games',
    '404': 'games',
    '405': 'games',
    '406': 'games',
    '407': 'games',
    '408': 'games',
    '499': 'games',
    '500': 'other',
    '501': 'books',
    '502': 'books',
    '503': 'other',
    '504': 'other',
    '505': 'other',
    '506': 'other',
    '599': 'other',
    '600': 'other',
    '601': 'anime',
    '602': 'anime',
    '603': 'anime',
    '604': 'anime',
    '699': 'anime',
};

// Map our categories to PirateBay category codes
export const ourCategoryToTPB: Record<TorrentCategory | 'all', string> = {
    all: '',
    movies: '200',
    tv: '200', // TV is within movies category (205-209)
    games: '400',
    software: '300',
    music: '100',
    anime: '600',
    books: '500',
    other: '',
};

function mapCategory(pbCategory: string): TorrentCategory {
    return categoryMap[pbCategory] || 'other';
}

function transformTorrent(pb: PirateBayTorrent): Torrent {
    const hash = pb.info_hash;
    const magnetLink = generateMagnetLink(hash, pb.name);

    return {
        id: pb.id,
        name: pb.name,
        size: parseInt(pb.size, 10),
        seeders: parseInt(pb.seeders, 10),
        leechers: parseInt(pb.leechers, 10),
        uploadDate: new Date(parseInt(pb.added, 10) * 1000).toISOString(),
        category: mapCategory(pb.category),
        magnetLink,
        source: 'ThePirateBay',
        hash,
        uploader: pb.username,
    };
}

export async function searchTorrents(
    query: string,
    category: TorrentCategory | 'all' = 'all'
): Promise<Torrent[]> {
    try {
        // Use local API proxy to bypass CORS
        const catCode = ourCategoryToTPB[category];
        const searchQuery = encodeURIComponent(query);

        const url = catCode
            ? `/api/search?q=${searchQuery}&cat=${catCode}`
            : `/api/search?q=${searchQuery}`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            // Add a reasonable timeout
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: PirateBayTorrent[] = await response.json();

        // API returns [{ id: "0", name: "No results..." }] when no results
        if (data.length === 1 && data[0].id === '0') {
            return [];
        }

        return data.map(transformTorrent);
    } catch (error) {
        console.error('PirateBay API error:', error);
        // Return empty array on error - let the UI handle showing the error state
        return [];
    }
}

export async function getTopTorrents(
    category: TorrentCategory | 'all' = 'all'
): Promise<Torrent[]> {
    try {
        const baseUrl = 'https://apibay.org';
        const catCode = ourCategoryToTPB[category];

        const url = catCode
            ? `${baseUrl}/precompiled/data_top100_${catCode}.json`
            : `${baseUrl}/precompiled/data_top100_all.json`;

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            signal: AbortSignal.timeout(10000),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.status}`);
        }

        const data: PirateBayTorrent[] = await response.json();
        return data.map(transformTorrent);
    } catch (error) {
        console.error('PirateBay API error:', error);
        return [];
    }
}
