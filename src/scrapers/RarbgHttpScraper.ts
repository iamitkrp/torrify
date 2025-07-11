import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class RarbgHttpScraper extends BaseScraperClass {
  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    // Try multiple RARBG mirrors without browser automation
    const fallbackMirrors = [
      'https://rargb.to',
      'https://rarbg.to',
      'https://rarbggo.to',
      'https://www.rarbgproxy.to',
      'https://proxyrarbg.to'
    ];

    for (const baseUrl of fallbackMirrors) {
      try {
        const searchUrl = this.buildSearchUrlWithBase(baseUrl, query);
        console.log(`[RARBG-HTTP] Trying mirror: ${baseUrl} - ${searchUrl}`);
        
        const response = await axios.get(searchUrl, {
          timeout: this.config.timeout,
          headers: {
            'User-Agent': this.config.userAgent,
            ...this.getHeaders(),
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 400, // Accept redirects
        });

        const content = response.data;
        
        // Check if we're on a blocked/maintenance page
        if (content.includes('blocked') || content.includes('suspended') || 
            content.includes('unavailable') || content.includes('maintenance') ||
            content.includes('checking your browser') || content.length < 500) {
          console.log(`[RARBG-HTTP] Mirror ${baseUrl} is blocked/suspended/unavailable, trying next...`);
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
            console.log(`[RARBG-HTTP] Found ${$resultRows.length} rows using selector: ${selector}`);
            break;
          }
        }

        if ($resultRows.length <= 1) {
          console.log('[RARBG-HTTP] No results found with table selectors. Trying alternative...');
          // Look for any rows with torrent-like content
          $resultRows = $('tr').filter((i, el) => {
            const text = $(el).text();
            return $(el).find('td').length >= 3 && 
                   (text.includes('MB') || text.includes('GB') || text.includes('magnet:'));
          });
        }

        if ($resultRows.length === 0) {
          console.log(`[RARBG-HTTP] No results found on ${baseUrl}. Content length: ${content.length}`);
          continue;
        }

        console.log(`[RARBG-HTTP] Processing ${$resultRows.length} rows...`);

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
          (result.title as string).toLowerCase().includes(cleanedQuery)
        );

        if (matchingResults.length === 0 && results.length > 0) {
          console.log(`[RARBG-HTTP] No results match query '${cleanedQuery}' on ${baseUrl}, likely trending page`);
          continue;
        }

        console.log(`[RARBG-HTTP] Successfully found ${matchingResults.length} matching results from ${baseUrl}`);
        return matchingResults;

      } catch (error) {
        console.error(`[RARBG-HTTP] Mirror ${baseUrl} failed:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
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
    
    return `${baseUrl}/search/?search=${encodedQuery}`;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };
  }

  private categorizeFromText(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('movie') || lowerText.includes('film') || 
        lowerText.match(/\b(720p|1080p|4k|hdcam|dvdrip|bluray|webrip)\b/)) {
      return 'movies';
    }
    
    if (lowerText.includes('s0') || lowerText.includes('season') || 
        lowerText.includes('episode') || lowerText.match(/\bs\d+e\d+\b/)) {
      return 'tv';
    }
    
    if (lowerText.includes('game') || lowerText.includes('pc') || lowerText.includes('xbox') || 
        lowerText.includes('ps3') || lowerText.includes('ps4') || lowerText.includes('ps5')) {
      return 'games';
    }
    
    if (lowerText.includes('software') || lowerText.includes('app') || lowerText.includes('crack') ||
        lowerText.includes('keygen') || lowerText.includes('patch')) {
      return 'software';
    }
    
    return 'other';
  }

  private normalizeSize(size: string): string {
    if (!size || size === '0 B') return size;
    
    // Clean up size format
    const cleaned = size.replace(/[^\d.\s]/gi, '').trim();
    const unit = size.replace(/[\d.\s]/g, '').toUpperCase();
    
    return `${cleaned} ${unit}`;
  }
} 