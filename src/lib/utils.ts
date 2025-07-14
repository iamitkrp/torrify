import { TorrentResult, SortOption, FilterOptions, ParsedSize, SizeUnit } from '@/types';

/**
 * Parse size string into bytes for comparison
 * Supports formats like "1.5 GB", "750 MB", "2.3TB", etc.
 */
export function parseSizeToBytes(sizeString: string): number {
  const cleanSize = sizeString.trim().toUpperCase();
  const sizeMatch = cleanSize.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/);
  
  if (!sizeMatch) {
    return 0;
  }

  const value = parseFloat(sizeMatch[1]);
  const unit = sizeMatch[2] as SizeUnit;

  const multipliers: Record<SizeUnit, number> = {
    'B': 1,
    'KB': 1024,
    'MB': 1024 ** 2,
    'GB': 1024 ** 3,
    'TB': 1024 ** 4,
  };

  return value * (multipliers[unit] || 1);
}

/**
 * Parse size string into structured format
 */
export function parseSize(sizeString: string): ParsedSize {
  const cleanSize = sizeString.trim().toUpperCase();
  const sizeMatch = cleanSize.match(/^(\d+(?:\.\d+)?)\s*([KMGT]?B)$/);
  
  if (!sizeMatch) {
    return { value: 0, unit: 'B', bytes: 0 };
  }

  const value = parseFloat(sizeMatch[1]);
  const unit = sizeMatch[2] as SizeUnit;
  const bytes = parseSizeToBytes(sizeString);

  return { value, unit, bytes };
}

/**
 * Format bytes into human readable size
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units: SizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB'];
  const k = 1024;
  const dm = 2;

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

  return `${value} ${units[i]}`;
}

/**
 * Parse date string into standardized format
 */
export function parseDate(dateString: string): Date {
  // Handle various date formats commonly found on torrent sites
  const cleanDate = dateString.trim();
  
  // Handle relative dates
  if (cleanDate.includes('ago')) {
    const now = new Date();
    const relativeMatch = cleanDate.match(/(\d+)\s+(minute|hour|day|week|month)s?\s+ago/i);
    
    if (relativeMatch) {
      const value = parseInt(relativeMatch[1]);
      const unit = relativeMatch[2].toLowerCase();
      
      switch (unit) {
        case 'minute':
          now.setMinutes(now.getMinutes() - value);
          break;
        case 'hour':
          now.setHours(now.getHours() - value);
          break;
        case 'day':
          now.setDate(now.getDate() - value);
          break;
        case 'week':
          now.setDate(now.getDate() - (value * 7));
          break;
        case 'month':
          now.setMonth(now.getMonth() - value);
          break;
      }
      return now;
    }
  }

  // Try parsing as standard date
  const parsed = new Date(cleanDate);
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

/**
 * Sort torrents based on the specified option
 */
export function sortTorrents(
  torrents: TorrentResult[],
  sortBy: SortOption,
  sortOrder: 'asc' | 'desc' = 'desc'
): TorrentResult[] {
  const sorted = [...torrents].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'seeds':
        comparison = a.seeds - b.seeds;
        break;
      case 'leechers':
        comparison = a.leechers - b.leechers;
        break;
      case 'size':
        comparison = parseSizeToBytes(a.size) - parseSizeToBytes(b.size);
        break;
      case 'date':
        comparison = parseDate(a.uploadDate).getTime() - parseDate(b.uploadDate).getTime();
        break;
      case 'health':
        // Health is calculated as ratio of seeds to leechers
        const healthA = a.leechers > 0 ? a.seeds / a.leechers : a.seeds;
        const healthB = b.leechers > 0 ? b.seeds / b.leechers : b.seeds;
        comparison = healthA - healthB;
        break;
      default:
        comparison = a.seeds - b.seeds; // Default to seeds
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return sorted;
}

/**
 * Filter torrents based on criteria
 */
export function filterTorrents(
  torrents: TorrentResult[],
  filters: FilterOptions
): TorrentResult[] {
  return torrents.filter((torrent) => {
    // Filter by categories (if specified and torrent has category)
    if (filters.categories.length > 0 && torrent.category) {
      if (!filters.categories.includes(torrent.category)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Normalize torrent data from different sources
 */
export function normalizeTorrent(rawData: Record<string, unknown>, source: string): TorrentResult {
  // Default values
  const normalized: TorrentResult = {
    title: String(rawData.title || '').trim(),
    magnetLink: String(rawData.magnetLink || rawData.magnet || ''),
    seeds: parseInt(String(rawData.seeds || rawData.seeders || '0')),
    leechers: parseInt(String(rawData.leechers || rawData.peers || '0')),
    size: String(rawData.size || '0 B').trim(),
    uploadDate: String(rawData.uploadDate || rawData.date || new Date().toISOString()),
    source,
    link: String(rawData.link || rawData.url || ''),
    category: String(rawData.category || '').toLowerCase() || undefined,
    verified: Boolean(rawData.verified || rawData.trusted || false),
  };

  // Clean up magnet link
  if (normalized.magnetLink && !normalized.magnetLink.startsWith('magnet:')) {
    normalized.magnetLink = '';
  }

  // Ensure positive numbers
  normalized.seeds = Math.max(0, normalized.seeds);
  normalized.leechers = Math.max(0, normalized.leechers);

  return normalized;
}

/**
 * Generate cache key for search queries
 */
export function generateCacheKey(query: string, sources: string[] = []): string {
  const normalizedQuery = query.toLowerCase().trim();
  const sortedSources = [...sources].sort().join(',');
  return `search:${normalizedQuery}:${sortedSources}`;
}

/**
 * Debounce function for search input
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Clean search query
 */
export function cleanSearchQuery(query: string): string {
  return query
    .trim()
    .replace(/[^\w\s-_.]/g, ' ') // Remove special characters except basic ones
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Validate magnet link
 */
export function isValidMagnetLink(magnetLink: string): boolean {
  const magnetRegex = /^magnet:\?xt=urn:btih:[a-fA-F0-9]{40}/;
  return magnetRegex.test(magnetLink);
}

/**
 * Group torrents by source
 */
export function groupTorrentsBySource(torrents: TorrentResult[]): Record<string, TorrentResult[]> {
  return torrents.reduce((groups, torrent) => {
    const source = torrent.source;
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(torrent);
    return groups;
  }, {} as Record<string, TorrentResult[]>);
}

/**
 * Calculate search statistics
 */
export function calculateSearchStats(torrents: TorrentResult[]) {
  const totalResults = torrents.length;
  const sourceStats = groupTorrentsBySource(torrents);
  const avgSeeds = torrents.reduce((sum, t) => sum + t.seeds, 0) / totalResults || 0;
  const avgLeechers = torrents.reduce((sum, t) => sum + t.leechers, 0) / totalResults || 0;

  return {
    totalResults,
    sourceStats: Object.entries(sourceStats).map(([source, results]) => ({
      source,
      count: results.length,
    })),
    avgSeeds: Math.round(avgSeeds),
    avgLeechers: Math.round(avgLeechers),
  };
}