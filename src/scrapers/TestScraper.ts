import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';

export class TestScraper extends BaseScraperClass {
  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    // Simulate some delay to mimic real scraping
    await this.delay(500);

    const results: Record<string, unknown>[] = [];
    
    // Generate mock results based on query
    const baseResults = [
      {
        title: `${query} - Mock Result 1 [1080p]`,
        magnetLink: 'magnet:?xt=urn:btih:1234567890abcdef1234567890abcdef12345678&dn=Mock+Torrent+1',
        seeds: 150,
        leechers: 25,
        size: '2.3 GB',
        uploadDate: '2024-01-15',
        category: 'movies',
        verified: true,
      },
      {
        title: `${query} - Mock Result 2 [720p]`,
        magnetLink: 'magnet:?xt=urn:btih:abcdef1234567890abcdef1234567890abcdef12&dn=Mock+Torrent+2',
        seeds: 89,
        leechers: 12,
        size: '1.4 GB',
        uploadDate: '2024-01-14',
        category: 'movies',
        verified: false,
      },
      {
        title: `${query} - Mock Result 3 [4K]`,
        magnetLink: 'magnet:?xt=urn:btih:567890abcdef1234567890abcdef1234567890ab&dn=Mock+Torrent+3',
        seeds: 45,
        leechers: 8,
        size: '8.2 GB',
        uploadDate: '2024-01-13',
        category: 'movies',
        verified: true,
      },
    ];

    // Return up to the limit
    for (let i = 0; i < Math.min(baseResults.length, limit); i++) {
      results.push({
        ...baseResults[i],
        link: `${this.config.baseUrl}/torrent/${i + 1}`,
      });
    }

    console.log(`[Test] Generated ${results.length} mock results for query: ${query}`);
    return results;
  }

  protected buildSearchUrl(query: string): string {
    // Not actually used for mock scraper
    return `${this.config.baseUrl}/search?q=${encodeURIComponent(query)}`;
  }
} 