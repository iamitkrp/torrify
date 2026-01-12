// Unified Torrent Search Service
// Combines results from multiple sources: PirateBay, 1337x, YTS

import { Torrent, TorrentCategory } from './types';
import { generateMagnetLink } from './utils';

// ==================== PIRATEBAY ====================
interface PirateBayTorrent {
    id: string;
    name: string;
    info_hash: string;
    leechers: string;
    seeders: string;
    size: string;
    username: string;
    added: string;
    category: string;
}

async function searchPirateBay(query: string): Promise<Torrent[]> {
    try {
        const url = `/api/search?q=${encodeURIComponent(query)}&source=piratebay`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) return [];

        const data: PirateBayTorrent[] = await response.json();

        if (data.length === 1 && data[0].id === '0') return [];

        return data.slice(0, 50).map(pb => ({
            id: `tpb-${pb.id}`,
            name: pb.name,
            size: parseInt(pb.size, 10),
            seeders: parseInt(pb.seeders, 10),
            leechers: parseInt(pb.leechers, 10),
            uploadDate: new Date(parseInt(pb.added, 10) * 1000).toISOString(),
            category: 'other' as TorrentCategory,
            magnetLink: generateMagnetLink(pb.info_hash, pb.name),
            source: 'ThePirateBay',
            hash: pb.info_hash,
            uploader: pb.username,
        }));
    } catch (error) {
        console.error('PirateBay error:', error);
        return [];
    }
}

// ==================== YTS (YIFY) ====================
interface YTSMovie {
    id: number;
    title: string;
    title_long: string;
    year: number;
    rating: number;
    runtime: number;
    genres: string[];
    date_uploaded_unix: number;
    torrents: Array<{
        url: string;
        hash: string;
        quality: string;
        type: string;
        seeds: number;
        peers: number;
        size: string;
        size_bytes: number;
    }>;
}

interface YTSResponse {
    status: string;
    data: {
        movie_count: number;
        movies?: YTSMovie[];
    };
}

async function searchYTS(query: string): Promise<Torrent[]> {
    try {
        const url = `/api/search?q=${encodeURIComponent(query)}&source=yts`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) return [];

        const data: YTSResponse = await response.json();

        if (data.status !== 'ok' || !data.data.movies) return [];

        const torrents: Torrent[] = [];

        for (const movie of data.data.movies.slice(0, 20)) {
            for (const torrent of movie.torrents) {
                torrents.push({
                    id: `yts-${movie.id}-${torrent.quality}`,
                    name: `${movie.title_long} [${torrent.quality}] [YTS]`,
                    size: torrent.size_bytes,
                    seeders: torrent.seeds,
                    leechers: torrent.peers,
                    uploadDate: new Date(movie.date_uploaded_unix * 1000).toISOString(),
                    category: 'movies' as TorrentCategory,
                    magnetLink: generateMagnetLink(torrent.hash, movie.title),
                    source: 'YTS',
                    hash: torrent.hash,
                });
            }
        }

        return torrents;
    } catch (error) {
        console.error('YTS error:', error);
        return [];
    }
}

// ==================== 1337x ====================
interface X1337Torrent {
    name: string;
    torrentId: string;
    link: string;
    seeders: string;
    leechers: string;
    size: string;
    time: string;
    uploader: string;
}

async function search1337x(query: string): Promise<Torrent[]> {
    try {
        const url = `/api/search?q=${encodeURIComponent(query)}&source=1337x`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) return [];

        const data: X1337Torrent[] = await response.json();

        if (!Array.isArray(data)) return [];

        return data.slice(0, 50).map(t => ({
            id: `1337x-${t.torrentId}`,
            name: t.name,
            size: parseSize(t.size),
            seeders: parseInt(t.seeders, 10) || 0,
            leechers: parseInt(t.leechers, 10) || 0,
            uploadDate: parseRelativeTime(t.time),
            category: 'other' as TorrentCategory,
            magnetLink: '', // Will need to be fetched from detail page
            source: '1337x',
            hash: t.torrentId,
            uploader: t.uploader,
        }));
    } catch (error) {
        console.error('1337x error:', error);
        return [];
    }
}

// Helper to parse size strings like "1.5 GB"
function parseSize(sizeStr: string): number {
    const match = sizeStr.match(/^([\d.]+)\s*(B|KB|MB|GB|TB)/i);
    if (!match) return 0;

    const value = parseFloat(match[1]);
    const unit = match[2].toUpperCase();

    const multipliers: Record<string, number> = {
        'B': 1,
        'KB': 1024,
        'MB': 1024 ** 2,
        'GB': 1024 ** 3,
        'TB': 1024 ** 4,
    };

    return Math.round(value * (multipliers[unit] || 1));
}

// Helper to parse relative time strings
function parseRelativeTime(timeStr: string): string {
    // For now, return current date - in production would parse "2 days ago" etc.
    return new Date().toISOString();
}

// ==================== UNIFIED SEARCH ====================
export async function searchAllSources(
    query: string,
    _category: TorrentCategory | 'all' = 'all'
): Promise<Torrent[]> {
    // Fetch from all sources in parallel
    const [pirateBayResults, ytsResults, x1337Results] = await Promise.all([
        searchPirateBay(query),
        searchYTS(query),
        search1337x(query),
    ]);

    // Combine all results
    const allResults = [...pirateBayResults, ...ytsResults, ...x1337Results];

    // Sort by seeders (most seeders first)
    allResults.sort((a, b) => b.seeders - a.seeders);

    return allResults;
}

// For backward compatibility
export const searchTorrents = searchAllSources;
