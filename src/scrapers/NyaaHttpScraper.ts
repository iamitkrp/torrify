import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import axios from 'axios';
import * as cheerio from 'cheerio';

export class NyaaHttpScraper extends BaseScraperClass {
  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    // Try multiple Nyaa mirrors if main site fails
    const fallbackMirrors = [
      this.config.baseUrl,
      'https://nyaa.si',
      'https://nyaa.net'
    ];

    for (const baseUrl of fallbackMirrors) {
      try {
        const searchUrl = this.buildSearchUrlWithBase(baseUrl, query);
        console.log(`[Nyaa-HTTP] Trying mirror: ${baseUrl}`);
        
        const response = await axios.get(searchUrl, {
          timeout: this.config.timeout,
          headers: {
            'User-Agent': this.config.userAgent,
            ...this.getHeaders(),
          },
          maxRedirects: 5,
          validateStatus: (status) => status < 500, // Accept redirects and client errors
        });

        const content = response.data;
        
        // Check if we have protection or empty content
        if (content.includes('checking your browser') || content.length < 1000) {
          console.log(`[Nyaa-HTTP] Mirror ${baseUrl} has anti-bot protection, trying next...`);
          continue;
        }

        const $ = cheerio.load(content);
        const results: Record<string, unknown>[] = [];

        // Try multiple selectors for different Nyaa layouts
        const possibleSelectors = [
          'table.torrent-list tbody tr',
          'tbody tr',
          'table tbody tr',
          '.torrent-info',
          'tr'
        ];

        let $resultRows = $('');
        for (const selector of possibleSelectors) {
          $resultRows = $(selector);
          if ($resultRows.length > 1) { // Need more than just header row
            console.log(`[Nyaa-HTTP] Found ${$resultRows.length} rows using selector: ${selector}`);
            break;
          }
        }

        if ($resultRows.length <= 1) {
          console.log('[Nyaa-HTTP] No results found. Content length:', content.length);
          continue;
        }

        // Parse search results table
        $resultRows.each((index, element) => {
          if (index >= limit) return false;

          const $row = $(element);
          const $cells = $row.find('td');

          // Skip header rows and invalid rows
          if ($cells.length < 3 || $row.hasClass('header')) return;

          // Flexible parsing for different Nyaa layouts
          let title = '';
          let link = '';
          let magnetLink = '';
          let seeds = 0;
          let leechers = 0;
          let size = '0 B';
          let uploadDate = '';
          let category = 'anime';
          let verified = false;

          // Find all links in the row
          const $allLinks = $row.find('a');
          
          $allLinks.each((i, linkEl) => {
            const $link = $(linkEl);
            const href = $link.attr('href') || '';
            const linkText = this.extractText($link.text());
            
            if (href.startsWith('magnet:')) {
              magnetLink = href;
            } else if (href.includes('/view/') && linkText && linkText.length > 5) {
              title = linkText;
              link = href.startsWith('http') ? href : baseUrl + href;
            } else if (href.includes('/download/') && !magnetLink) {
              // Torrent file download link
              magnetLink = href.startsWith('http') ? href : baseUrl + href;
            }
          });

          // Extract numeric data from cells
          $cells.each((cellIndex, cellEl) => {
            const $cell = $(cellEl);
            const cellText = $cell.text().trim();
            
            // Look for size patterns (MB, GB, etc.)
            if (cellText.match(/\d+\.?\d*\s*(MB|GB|TB|KB)/i)) {
              size = cellText;
            }
            
            // Look for date patterns
            if (cellText.match(/\d{4}-\d{2}-\d{2}/) || cellText.match(/\d{2}-\d{2}\s+\d{4}/)) {
              uploadDate = cellText;
            }
            
            // Look for seeds/leechers (pure numbers or numbers with styling)
            const numValue = this.parseNumber(cellText);
            if (numValue > 0 && cellText.match(/^\s*\d+\s*$/)) {
              if (seeds === 0) {
                seeds = numValue;
              } else if (leechers === 0) {
                leechers = numValue;
              }
            }
          });

          // Look for category info
          const $categoryIcons = $row.find('img, .category');
          $categoryIcons.each((i, iconEl) => {
            const $icon = $(iconEl);
            const title = $icon.attr('title') || $icon.attr('alt') || '';
            if (title) {
              category = this.mapNyaaCategory(title);
            }
          });

          // Check for trusted/verified indicators
          verified = $row.find('.fa-check-circle, .fa-star, .trusted, .vip').length > 0;

          // Only include results with a title
          if (title.trim() && title.length > 3) {
            const { cleanTitle, quality, episode } = this.parseAnimeTitle(title);
            
            results.push({
              title: cleanTitle || title.trim(),
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

        console.log(`[Nyaa-HTTP] Successfully parsed ${results.length} results from ${baseUrl}`);
        return results;

      } catch (error) {
        console.error(`[Nyaa-HTTP] Mirror ${baseUrl} failed:`, error instanceof Error ? error.message : 'Unknown error');
        continue;
      }
    }

    // If all mirrors failed
    console.error('[Nyaa-HTTP] All mirrors failed');
    throw this.createError('NETWORK_ERROR', 'All Nyaa mirrors are unavailable');
  }

  protected buildSearchUrl(query: string): string {
    return this.buildSearchUrlWithBase(this.config.baseUrl, query);
  }

  protected buildSearchUrlWithBase(baseUrl: string, query: string): string {
    const cleanedQuery = this.cleanQuery(query);
    const encodedQuery = encodeURIComponent(cleanedQuery);
    // Simple search without complex filtering to avoid issues
    const searchUrl = `${baseUrl}/?q=${encodedQuery}&s=seeders&o=desc`;
    console.log(`[Nyaa-HTTP] Building search URL: ${searchUrl}`);
    return searchUrl;
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