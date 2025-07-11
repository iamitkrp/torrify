import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';

export class LeetxScraper extends BaseScraperClass {
  private browser: Browser | null = null;

  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    let page: Page | null = null;
    
    try {
      // Initialize browser if needed
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
        });
      }

      page = await this.browser.newPage();
      
      // Set user agent and other headers
      await page.setExtraHTTPHeaders({
        'User-Agent': this.config.userAgent,
        ...this.getHeaders(),
      });

      const searchUrl = this.buildSearchUrl(query);
      
      // Navigate to search page with retries
      await page.goto(searchUrl, { 
        waitUntil: 'domcontentloaded',
        timeout: this.config.timeout 
      });

      // Wait for search results to load - be more flexible with selectors
      try {
        await page.waitForSelector('table.table-list tbody tr, .no-results, .search-results', { timeout: 8000 });
      } catch (error) {
        // If specific selectors fail, just wait a bit for general content
        await page.waitForTimeout(2000);
      }

      // Get page content and parse with Cheerio
      const content = await page.content();
      const $ = cheerio.load(content);
      
      const results: Record<string, unknown>[] = [];

      // Parse 1337x search results - try multiple selectors
      const resultSelector = 'table.table-list tbody tr, .table-list tr, tbody tr';
      const $results = $(resultSelector);
      
      if ($results.length === 0) {
        console.log('[1337x] No results found for query:', query);
        return [];
      }

      $results.each((index, element) => {
        if (index >= limit) return false;

        const $row = $(element);
        const $cells = $row.find('td');

        if ($cells.length < 3) return; // Skip invalid rows (relaxed requirement)

        // Extract title and link
        const $nameCell = $cells.eq(0);
        const $titleLink = $nameCell.find('a').last(); // Usually the second link is the title
        const title = this.extractText($titleLink.text());
        const link = $titleLink.attr('href') || '';

        // Extract seeds and leechers
        const $seedsCell = $cells.eq(1);
        const $leechersCell = $cells.eq(2);
        const seeds = this.parseNumber($seedsCell.text());
        const leechers = this.parseNumber($leechersCell.text());

        // Extract upload date
        const $dateCell = $cells.eq(3);
        const uploadDate = this.extractText($dateCell.text());

        // Extract size
        const $sizeCell = $cells.eq(4);
        const size = this.extractText($sizeCell.text()) || '0 B';

        // Extract category from the first cell
        const $categoryLink = $nameCell.find('a').first();
        const categoryText = this.extractText($categoryLink.text()).toLowerCase();
        const category = this.mapLeetxCategory(categoryText);

        // Check if verified uploader
        const verified = $nameCell.find('.vip, .trusted').length > 0;

        if (title && link) {
          results.push({
            title,
            magnetLink: '', // Will be fetched from detail page
            seeds,
            leechers,
            size,
            uploadDate,
            link: link.startsWith('http') ? link : this.config.baseUrl + link,
            category,
            verified,
            detailPage: true, // Flag to indicate we need to fetch magnet from detail page
          });
        }
      });

      return results;

    } catch (error) {
      console.error('[1337x] Search failed:', error);
      throw this.createError('PARSE_ERROR', 'Failed to parse 1337x search results', error);
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  /**
   * Fetch magnet link from torrent detail page
   */
  async fetchMagnetLink(detailUrl: string): Promise<string> {
    let page: Page | null = null;
    
    try {
      if (!this.browser) {
        this.browser = await chromium.launch({
          headless: true,
          args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
      }

      page = await this.browser.newPage();
      await page.setExtraHTTPHeaders({
        'User-Agent': this.config.userAgent,
      });
      
      await page.goto(detailUrl, { 
        waitUntil: 'networkidle',
        timeout: this.config.timeout 
      });

      // Wait for magnet link to appear
      await page.waitForSelector('a[href^="magnet:"]', { timeout: 5000 });

      const magnetLink = await page.getAttribute('a[href^="magnet:"]', 'href') || '';
      
      return magnetLink;

    } catch (error) {
      console.error('[1337x] Failed to fetch magnet link:', error);
      return '';
    } finally {
      if (page) {
        await page.close();
      }
    }
  }

  protected buildSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(this.cleanQuery(query));
    return `${this.config.baseUrl}/search/${encodedQuery}/1/`;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
  }

  /**
   * Map 1337x category to standard category
   */
  private mapLeetxCategory(categoryText: string): string {
    const lower = categoryText.toLowerCase();
    
    if (lower.includes('movie')) return 'movies';
    if (lower.includes('tv')) return 'tv';
    if (lower.includes('music')) return 'music';
    if (lower.includes('game')) return 'games';
    if (lower.includes('software')) return 'software';
    if (lower.includes('anime')) return 'anime';
    if (lower.includes('documentary')) return 'movies';
    if (lower.includes('xxx')) return 'other';
    
    return 'other';
  }

  /**
   * Clean up resources
   */
  async cleanup(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  /**
   * Override search method to handle magnet link fetching
   */
  public async search(query: string, limit?: number): Promise<import('@/types').ScraperResponse> {
    const baseResponse = await super.search(query, limit);
    
    if (baseResponse.success && baseResponse.results.length > 0) {
      // Fetch magnet links for results that need them
      const resultsWithMagnets = await Promise.allSettled(
        baseResponse.results.map(async (result) => {
          const resultWithFlag = result as typeof result & { detailPage?: boolean };
          if (resultWithFlag.detailPage && result.link) {
            try {
              const magnetLink = await this.fetchMagnetLink(result.link);
              return { ...result, magnetLink };
            } catch {
              return result; // Return without magnet if fetch fails
            }
          }
          return result;
        })
      );

      baseResponse.results = resultsWithMagnets
        .filter(result => result.status === 'fulfilled')
        .map(result => (result as PromiseFulfilledResult<import('@/types').TorrentResult>).value)
        .filter(result => result.magnetLink); // Only include results with magnet links
    }

    return baseResponse;
  }
}