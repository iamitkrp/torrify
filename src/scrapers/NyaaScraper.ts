import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import * as cheerio from 'cheerio';

export class NyaaScraper extends BaseScraperClass {
  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    const searchUrl = this.buildSearchUrl(query);
    
    try {
      const response = await this.axiosInstance.get(searchUrl, {
        headers: this.getHeaders(),
      });

      const $ = cheerio.load(response.data);
      const results: Record<string, unknown>[] = [];

      // Parse Nyaa search results table
      $('table.torrent-list tbody tr').each((index, element) => {
        if (index >= limit) return false;

        const $row = $(element);
        const $cells = $row.find('td');

        if ($cells.length < 6) return; // Skip invalid rows

        // Extract category
        const $categoryCell = $cells.eq(0);
        const categoryTitle = $categoryCell.find('a').attr('title') || '';
        const category = this.mapNyaaCategory(categoryTitle);

        // Extract title and links
        const $nameCell = $cells.eq(1);
        const $titleLinks = $nameCell.find('a');
        
        let title = '';
        let link = '';
        let magnetLink = '';

        $titleLinks.each((i, linkEl) => {
          const $link = $(linkEl);
          const href = $link.attr('href') || '';
          
          if (href.startsWith('magnet:')) {
            magnetLink = href;
          } else if (href.includes('/view/')) {
            title = this.extractText($link.text());
            link = this.config.baseUrl + href;
          }
        });

        // Extract torrent file link if no magnet
        if (!magnetLink) {
          const $torrentLink = $nameCell.find('a[href$=".torrent"]');
          if ($torrentLink.length) {
            const torrentHref = $torrentLink.attr('href');
            if (torrentHref) {
              // Convert torrent file link to magnet (would need hash extraction)
              magnetLink = torrentHref.startsWith('http') ? torrentHref : this.config.baseUrl + torrentHref;
            }
          }
        }

        // Extract size
        const $sizeCell = $cells.eq(3);
        const size = this.extractText($sizeCell.text()) || '0 B';

        // Extract upload date
        const $dateCell = $cells.eq(4);
        const uploadDate = this.extractText($dateCell.text());

        // Extract seeds and leechers
        const $seedsCell = $cells.eq(5);
        const $leechersCell = $cells.eq(6);
        const seeds = this.parseNumber($seedsCell.text());
        const leechers = this.parseNumber($leechersCell.text());

        // Check if trusted/verified uploader
        const verified = $nameCell.find('.fa-check-circle, .fa-star').length > 0;

        // Extract additional info from title
        const { cleanTitle, quality, episode } = this.parseAnimeTitle(title);

        if (title && (magnetLink || link)) {
          results.push({
            title: cleanTitle || title,
            magnetLink,
            seeds,
            leechers,
            size,
            uploadDate,
            link,
            category,
            verified,
            quality,
            episode,
            originalTitle: title,
          });
        }
      });

      return results;

    } catch (error) {
      console.error('[Nyaa] Search failed:', error);
      throw this.createError('PARSE_ERROR', 'Failed to parse Nyaa search results', error);
    }
  }

  protected buildSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(this.cleanQuery(query));
    // Filter for anime and sort by seeders
    return `${this.config.baseUrl}/?f=0&c=1_0&q=${encodedQuery}&s=seeders&o=desc`;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };
  }

  /**
   * Map Nyaa category to standard category
   */
  private mapNyaaCategory(categoryTitle: string): string {
    const lower = categoryTitle.toLowerCase();
    
    if (lower.includes('anime')) return 'anime';
    if (lower.includes('manga')) return 'books';
    if (lower.includes('music')) return 'music';
    if (lower.includes('game')) return 'games';
    if (lower.includes('software')) return 'software';
    
    return 'anime'; // Default for Nyaa
  }

  /**
   * Parse anime title to extract quality, episode info, etc.
   */
  private parseAnimeTitle(title: string): { cleanTitle: string; quality?: string; episode?: string } {
    // Common anime title patterns
    const qualityMatch = title.match(/\[(720p|1080p|480p|2160p|4K)\]/i);
    const episodeMatch = title.match(/- (\d+(?:\.\d+)?|\d+-\d+) /);
    const groupMatch = title.match(/^\[([^\]]+)\]/);
    
    let cleanTitle = title;
    
    // Remove group tags and quality info for cleaner title
    if (groupMatch) {
      cleanTitle = cleanTitle.replace(groupMatch[0], '').trim();
    }
    
    if (qualityMatch) {
      cleanTitle = cleanTitle.replace(qualityMatch[0], '').trim();
    }

    return {
      cleanTitle: cleanTitle.replace(/\s+/g, ' ').trim(),
      quality: qualityMatch ? qualityMatch[1] : undefined,
      episode: episodeMatch ? episodeMatch[1] : undefined,
    };
  }
}