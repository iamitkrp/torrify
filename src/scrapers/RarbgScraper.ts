import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import { chromium, Browser, Page } from 'playwright';
import * as cheerio from 'cheerio';

export class RarbgScraper extends BaseScraperClass {
  private browser: Browser | null = null;

  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    let page: Page | null = null;
    
    // Try multiple RARBG mirrors/clones since the original shut down
    const fallbackMirrors = [
      'https://rargb.to',
      'https://rarbg.to',
      'https://rarbggo.to',
      'https://www.rarbgproxy.to',
      'https://proxyrarbg.to'
    ];

    for (const baseUrl of fallbackMirrors) {
      try {
        // Initialize browser if needed
        if (!this.browser) {
          this.browser = await chromium.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-accelerated-2d-canvas',
              '--no-first-run',
              '--no-zygote',
              '--disable-gpu'
            ],
          });
        }

        page = await this.browser.newPage();
        
        // Set user agent and headers to avoid detection
        await page.setExtraHTTPHeaders({
          'User-Agent': this.config.userAgent,
          ...this.getHeaders(),
        });

        const searchUrl = this.buildSearchUrlWithBase(baseUrl, query);
        console.log(`[RARBG] Trying mirror with Playwright: ${baseUrl} - ${searchUrl}`);
        
        // Navigate to search page with shorter timeout
        await page.goto(searchUrl, { 
          waitUntil: 'domcontentloaded',
          timeout: 15000 // Shorter timeout
        });

        // Wait for content to load but not too long
        await page.waitForTimeout(2000);

        // Check if we're on a blocked/maintenance page
        const content = await page.content();
        
        if (content.includes('blocked') || content.includes('suspended') || 
            content.includes('unavailable') || content.includes('maintenance') ||
            content.includes('checking your browser') || content.length < 500) {
          console.log(`[RARBG] Mirror ${baseUrl} is blocked/suspended/unavailable, trying next...`);
          await page.close();
          continue;
        }

        const $ = cheerio.load(content);
        const results: Record<string, unknown>[] = [];

        // Look for RARBG-style table or torrent listings
        const possibleSelectors = [
          'table.lista2t tbody tr:not(.lista2)',
          'table.lista tbody tr',
          '.lista2t tbody tr',
          'table tbody tr',
          '.torrent-row',
          'tr:has(td)'
        ];

        let $resultRows = $('');
        for (const selector of possibleSelectors) {
          $resultRows = $(selector);
          if ($resultRows.length > 1) { // Need more than header
            console.log(`[RARBG] Found ${$resultRows.length} rows using selector: ${selector}`);
            break;
          }
        }

        if ($resultRows.length <= 1) {
          console.log('[RARBG] No results found with table selectors. Trying alternative...');
          // Look for any rows with torrent-like content
          $resultRows = $('tr').filter((i, el) => {
            const text = $(el).text();
            return $(el).find('td').length >= 3 && 
                   (text.includes('MB') || text.includes('GB') || text.includes('magnet:'));
          });
        }

        if ($resultRows.length === 0) {
          console.log(`[RARBG] No results found on ${baseUrl}. Content length: ${content.length}`);
          console.log('[RARBG] Page content snippet:', content.substring(0, 500));
          await page.close();
          continue;
        }

        console.log(`[RARBG] Processing ${$resultRows.length} rows...`);

        // Parse search results
        $resultRows.each((index, element) => {
          if (index >= limit) return false;

          const $row = $(element);
          const $cells = $row.find('td');

          if ($cells.length < 3) return;

          let title = '';
          let link = '';
          let magnetLink = '';
          let seeds = 0;
          let leechers = 0;
          let size = '0 B';
          let uploadDate = '';
          let category = 'other';

          // Find all links first
          $row.find('a').each((i, linkEl) => {
            const $link = $(linkEl);
            const href = $link.attr('href') || '';
            const linkText = this.extractText($link.text());
            
            if (href.startsWith('magnet:')) {
              magnetLink = href;
            } else if (linkText && linkText.length > 5 && (!title || linkText.length > title.length)) {
              title = linkText;
              link = href.startsWith('http') ? href : baseUrl + href;
            }
          });

          // Extract numbers from cells
          $cells.each((cellIndex, cellEl) => {
            const $cell = $(cellEl);
            const cellText = $cell.text().trim();
            
            // Size patterns
            if (cellText.match(/\d+\.?\d*\s*(MB|GB|TB|KB)/i)) {
              size = cellText;
            }
            
            // Date patterns  
            if (cellText.match(/\d{4}-\d{2}-\d{2}/) || cellText.match(/\d{2}-\d{2}-\d{4}/)) {
              uploadDate = cellText;
            }
            
            // Seeds/leechers (numbers)
            const numValue = this.parseNumber(cellText);
            if (numValue >= 0 && cellText.match(/^\s*\d+\s*$/)) {
              if (seeds === 0 && numValue > 0) {
                seeds = numValue;
              } else if (leechers === 0) {
                leechers = numValue;
              }
            }
          });

          // Category from title
          if (title) {
            category = this.categorizeFromText(title);
          }

          // Only include if we have a title
          if (title.trim() && title.length > 3) {
            results.push({
              title: title.trim(),
              magnetLink,
              seeds,
              leechers,
              size: this.normalizeSize(size),
              uploadDate,
              link,
              category,
              verified: false,
            });
          }
        });

        // Validate results match query
        const cleanedQuery = this.cleanQuery(query).toLowerCase();
        const matchingResults = results.filter(result => 
          result.title.toLowerCase().includes(cleanedQuery)
        );

        if (matchingResults.length === 0 && results.length > 0) {
          console.log(`[RARBG] No results match query '${cleanedQuery}' on ${baseUrl}, likely trending page`);
          await page.close();
          continue;
        }

        console.log(`[RARBG] Successfully found ${matchingResults.length} matching results from ${baseUrl}`);
        await page.close();
        return matchingResults;

      } catch (error) {
        console.error(`[RARBG] Mirror ${baseUrl} failed:`, error instanceof Error ? error.message : 'Unknown error');
        if (page) {
          await page.close();
        }
      }
    }

    throw this.createError('NETWORK_ERROR', 'All RARBG mirrors failed or returned no matching results');
  }

  protected buildSearchUrl(query: string): string {
    return this.buildSearchUrlWithBase(this.config.baseUrl, query);
  }

  protected buildSearchUrlWithBase(baseUrl: string, query: string): string {
    const cleanedQuery = this.cleanQuery(query);
    const encodedQuery = encodeURIComponent(cleanedQuery);
    
    // Use the correct URL format based on the working example
    return `${baseUrl}/search/?search=${encodedQuery}`;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Upgrade-Insecure-Requests': '1',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
    };
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

  private categorizeFromText(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('movie') || lowerText.includes('film') || lowerText.includes('dvd') || lowerText.includes('bluray')) {
      return 'movies';
    }
    if (lowerText.includes('tv') || lowerText.includes('series') || lowerText.includes('episode') || lowerText.includes('season')) {
      return 'tv';
    }
    if (lowerText.includes('music') || lowerText.includes('album') || lowerText.includes('mp3') || lowerText.includes('flac')) {
      return 'music';
    }
    if (lowerText.includes('game') || lowerText.includes('xbox') || lowerText.includes('ps3') || lowerText.includes('ps4') || lowerText.includes('pc game')) {
      return 'games';
    }
    if (lowerText.includes('software') || lowerText.includes('app') || lowerText.includes('program') || lowerText.includes('windows') || lowerText.includes('mac')) {
      return 'software';
    }
    if (lowerText.includes('anime') || lowerText.includes('manga')) {
      return 'anime';
    }
    if (lowerText.includes('book') || lowerText.includes('ebook') || lowerText.includes('pdf') || lowerText.includes('epub')) {
      return 'books';
    }
    
    return 'other';
  }

  private normalizeSize(size: string): string {
    if (!size) return '0 B';
    
    // Clean up size string and ensure proper format
    const cleanSize = size.trim().replace(/[^\d.\s\w]/g, '');
    const match = cleanSize.match(/(\d+(?:\.\d+)?)\s*([KMGT]?B)/i);
    
    if (match) {
      const [, value, unit] = match;
      return `${value} ${unit.toUpperCase()}`;
    }
    
    return size;
  }
} 