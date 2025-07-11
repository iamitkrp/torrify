import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import * as cheerio from 'cheerio';

export class PirateBayScraper extends BaseScraperClass {
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

      // Parse search results table
      $('table#searchResult tbody tr').each((index, element) => {
        if (index >= limit) return false; // Stop if we've reached the limit

        const $row = $(element);
        const $cells = $row.find('td');

        if ($cells.length < 4) return; // Skip invalid rows

        // Extract data from table cells
        const $titleCell = $cells.eq(1);
        const $seedsCell = $cells.eq(2);
        const $leechersCell = $cells.eq(3);

        const $titleLink = $titleCell.find('a').first();
        const title = this.extractText($titleLink.text());
        const link = $titleLink.attr('href') || '';

        // Extract magnet link
        const $magnetLink = $titleCell.find('a[href^="magnet:"]');
        const magnetLink = $magnetLink.attr('href') || '';

        // Extract size and upload date from description
        const description = $titleCell.find('.detDesc').text();
        const sizeMatch = description.match(/Size\s+([0-9.]+\s*[KMGT]?iB)/i);
        const dateMatch = description.match(/Uploaded\s+([^,]+)/i);

        const size = sizeMatch ? sizeMatch[1].replace('iB', 'B') : '0 B';
        const uploadDate = dateMatch ? dateMatch[1].trim() : '';

        // Extract seeds and leechers
        const seeds = this.parseNumber($seedsCell.text());
        const leechers = this.parseNumber($leechersCell.text());

        // Extract category
        const $categoryCell = $cells.eq(0);
        const category = this.extractText($categoryCell.find('a').last().text()).toLowerCase();

        // Check if verified (VIP or trusted)
        const verified = $titleCell.find('img[title*="VIP"], img[title*="Trusted"]').length > 0;

        if (title && magnetLink) {
          results.push({
            title,
            magnetLink,
            seeds,
            leechers,
            size,
            uploadDate,
            link: this.config.baseUrl + link,
            category,
            verified,
          });
        }
      });

      return results;

    } catch (error) {
      console.error('[PirateBay] Search failed:', error);
      throw this.createError('PARSE_ERROR', 'Failed to parse search results', error);
    }
  }

  protected buildSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(this.cleanQuery(query));
    return `${this.config.baseUrl}/search/${encodedQuery}/1/99/0`; // Order by seeders desc
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Upgrade-Insecure-Requests': '1',
    };
  }
}