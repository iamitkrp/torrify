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
            uploadDate: safeDate(parseInt(pb.added, 10) * 1000),
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
        date_uploaded_unix?: number;
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
            if (!movie.torrents) continue;

            for (const torrent of movie.torrents) {
                // Prefer torrent upload date, fall back to movie upload date
                const dateUnix = torrent.date_uploaded_unix || movie.date_uploaded_unix;

                torrents.push({
                    id: `yts-${movie.id}-${torrent.quality}-${torrent.type}`,
                    name: `${movie.title_long} [${torrent.quality}] [${torrent.type}]`,
                    size: torrent.size_bytes,
                    seeders: torrent.seeds || 0,
                    leechers: torrent.peers || 0,
                    uploadDate: safeDate(dateUnix * 1000),
                    category: 'movies' as TorrentCategory,
                    magnetLink: generateMagnetLink(torrent.hash, movie.title),
                    source: 'YTS',
                    hash: torrent.hash,
                    uploader: 'YTS',
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
// Supports multiple API response formats
interface X1337Torrent {
    name: string;
    torrentId?: string;
    id?: string;
    link?: string;
    seeders: string | number;
    leechers: string | number;
    size: string;
    time?: string;
    uploaded?: string;
    uploader?: string;
    hash?: string;
    magnet?: string;
}

async function search1337x(query: string): Promise<Torrent[]> {
    try {
        const url = `/api/search?q=${encodeURIComponent(query)}&source=1337x`;
        const response = await fetch(url, {
            headers: { 'Accept': 'application/json' },
            signal: AbortSignal.timeout(15000),
        });

        if (!response.ok) return [];

        const rawData = await response.json();

        // Handle different response structures
        let data: X1337Torrent[] = [];
        if (Array.isArray(rawData)) {
            data = rawData;
        } else if (rawData.torrents && Array.isArray(rawData.torrents)) {
            data = rawData.torrents;
        } else {
            return [];
        }

        return data.slice(0, 50).map(t => {
            const id = t.torrentId || t.id || 'unknown';
            const name = t.name || 'Unknown Torrent';
            const size = parseSize(t.size);
            const seeders = typeof t.seeders === 'number' ? t.seeders : (parseInt(t.seeders, 10) || 0);
            const leechers = typeof t.leechers === 'number' ? t.leechers : (parseInt(t.leechers, 10) || 0);
            // Some APIs return 'time', others 'uploaded' or 'date'
            const timeStr = t.time || t.uploaded || '';

            return {
                id: `1337x-${id}`,
                name: name,
                size: size,
                seeders: seeders,
                leechers: leechers,
                uploadDate: parseRelativeTime(timeStr),
                category: 'other' as TorrentCategory,
                magnetLink: t.magnet || '', // Some proxies include magnet directly
                source: '1337x',
                hash: t.hash || id, // Fallback to ID if hash missing
                uploader: t.uploader || '1337x',
            };
        });
    } catch (error) {
        console.error('1337x error:', error);
        return [];
    }
}

// Helper to reliably parse upload dates
function safeDate(timestamp: number): string {
    try {
        if (!timestamp || isNaN(timestamp)) {
            return new Date().toISOString();
        }
        return new Date(timestamp).toISOString();
    } catch (e) {
        return new Date().toISOString();
    }
}

// Helper to parse size strings like "1.5 GB"
function parseSize(sizeStr: string): number {
    if (!sizeStr) return 0;
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
    // Basic fallback
    return new Date().toISOString();
}

// ==================== UNIFIED SEARCH ====================
export async function searchAllSources(
    query: string,
    _category: TorrentCategory | 'all' = 'all'
): Promise<Torrent[]> {
    // Fetch from all sources in parallel
    const [pirateBayResults, ytsResults, x1337Results] = await Promise.allSettled([
        searchPirateBay(query),
        searchYTS(query),
        search1337x(query),
    ]);

    const allResults: Torrent[] = [];

    if (pirateBayResults.status === 'fulfilled') {
        allResults.push(...pirateBayResults.value);
    }

    if (ytsResults.status === 'fulfilled') {
        allResults.push(...ytsResults.value);
    }

    if (x1337Results.status === 'fulfilled') {
        allResults.push(...x1337Results.value);
    }

    // Sort by seeders (most seeders first)
    allResults.sort((a, b) => b.seeders - a.seeders);

    // Filter duplicates by info hash
    const uniqueResults = [];
    const seenHashes = new Set();

    for (const torrent of allResults) {
        if (torrent.hash && !seenHashes.has(torrent.hash)) {
            seenHashes.add(torrent.hash);
            uniqueResults.push(torrent);
        } else if (!torrent.hash) {
            uniqueResults.push(torrent);
        }
    }

    return uniqueResults;
}

// For backward compatibility
export const searchTorrents = searchAllSources;
