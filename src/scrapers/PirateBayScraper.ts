import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import * as cheerio from 'cheerio';

export class PirateBayScraper extends BaseScraperClass {
  constructor(config: ScraperConfig) {
    super(config);
  }

  protected async performSearch(query: string, limit: number = 50): Promise<Record<string, unknown>[]> {
    // Try multiple mirrors in case one is down
    const fallbackMirrors = [
      this.config.baseUrl,
      'https://thepiratebay7.com',
      'https://thepiratebay0.org',
      'https://thepiratebay.zone',
      'https://tpb.party'
    ];

    for (const baseUrl of fallbackMirrors) {
      try {
        const searchUrl = this.buildSearchUrlWithBase(baseUrl, query);
        console.log(`[PirateBay] Trying mirror: ${baseUrl}`);
        
        const response = await this.axiosInstance.get(searchUrl, {
          headers: this.getHeaders(),
          timeout: this.config.timeout,
          maxRedirects: 3,
        });

        // Check if we got redirected to a non-Pirate Bay page
        if (response.data.includes('iframe') && (response.data.includes('airtel') || response.data.includes('blocked'))) {
          console.log(`[PirateBay] Mirror ${baseUrl} is blocked/redirected, trying next...`);
          continue;
        }

        // Check if the response looks like a valid Pirate Bay page
        if (!response.data.includes('search') && !response.data.includes('torrent')) {
          console.log(`[PirateBay] Mirror ${baseUrl} doesn't look like Pirate Bay, trying next...`);
          continue;
        }

      const $ = cheerio.load(response.data);
      const results: Record<string, unknown>[] = [];

      // Try multiple selectors for different site layouts
      const possibleSelectors = [
        'table#searchResult tbody tr',
        '#searchResult tbody tr', 
        'table tbody tr',
        '.detName',
        '.torrentrow'
      ];

      let $resultRows = $();
      for (const selector of possibleSelectors) {
        $resultRows = $(selector);
        if ($resultRows.length > 0) {
          console.log(`[PirateBay] Found ${$resultRows.length} results using selector: ${selector}`);
          break;
        }
      }

      if ($resultRows.length === 0) {
        console.log('[PirateBay] No results found with any selector. Page HTML:', response.data.substring(0, 1000));
        return [];
      }

      // Parse search results
      $resultRows.each((index, element) => {
        if (index >= limit) return false; // Stop if we've reached the limit

        const $row = $(element);
        const $cells = $row.find('td');

        if ($cells.length < 3) return; // Skip invalid rows (relaxed from 4 to 3)

        // Flexible data extraction for different layouts
        let title = '';
        let link = '';
        let magnetLink = '';
        let seeds = 0;
        let leechers = 0;
        let size = '0 B';
        let uploadDate = '';
        let category = 'other';
        let verified = false;

        // Try to find title and links from different possible structures
        const $allLinks = $row.find('a');
        
        $allLinks.each((i, linkEl) => {
          const $link = $(linkEl);
          const href = $link.attr('href') || '';
          const linkText = this.extractText($link.text());
          
          if (href.startsWith('magnet:')) {
            magnetLink = href;
          } else if (href.includes('/torrent/') && linkText && !title) {
            title = linkText;
            link = href;
          } else if (linkText && linkText.length > title.length && !href.startsWith('magnet:')) {
            // Prefer longer text as title
            title = linkText;
            if (href) link = href;
          }
        });

        // Try different cell arrangements for seeds/leechers
        if ($cells.length >= 4) {
          // Standard layout: category, title, seeds, leechers
          seeds = this.parseNumber($cells.eq(2).text());
          leechers = this.parseNumber($cells.eq(3).text());
        } else if ($cells.length >= 3) {
          // Alternative layout: title, seeds, leechers
          seeds = this.parseNumber($cells.eq(1).text());
          leechers = this.parseNumber($cells.eq(2).text());
        }

        // Look for size and date in description or anywhere in the row
        const allText = $row.text();
        const sizeMatch = allText.match(/Size[:\s]+([0-9.]+\s*[KMGT]?[iB]+)/i) || 
                         allText.match(/([0-9.]+\s*[KMGT][iB])/i);
        const dateMatch = allText.match(/Uploaded[:\s]+([^,\n]+)/i) || 
                         allText.match(/(\d{2}-\d{2}\s+\d{4})/i) ||
                         allText.match(/(\d{4}-\d{2}-\d{2})/i);

        if (sizeMatch) {
          size = sizeMatch[1].replace('iB', 'B').trim();
        }
        if (dateMatch) {
          uploadDate = dateMatch[1].trim();
        }

        // Look for category
        if ($cells.length > 0) {
          const categoryText = this.extractText($cells.eq(0).text()).toLowerCase();
          if (categoryText.includes('video')) category = 'movies';
          else if (categoryText.includes('audio')) category = 'music';
          else if (categoryText.includes('app')) category = 'software';
          else if (categoryText.includes('game')) category = 'games';
        }

        // Check for verification badges
        verified = $row.find('img[title*="VIP"], img[title*="Trusted"], .vip, .trusted').length > 0;

        // Only include results with at least a title
        if (title.trim()) {
          results.push({
            title: title.trim(),
            magnetLink,
            seeds,
            leechers,
            size,
            uploadDate,
            link: link.startsWith('http') ? link : this.config.baseUrl + link,
            category,
            verified,
          });
        }
      });

        console.log(`[PirateBay] Successfully parsed ${results.length} results from ${baseUrl}`);
        return results;

      } catch (error) {
        console.error(`[PirateBay] Mirror ${baseUrl} failed:`, error);
        // Continue to next mirror
      }
    }

         // If all mirrors failed
     console.error('[PirateBay] All mirrors failed');
     throw this.createError('NETWORK_ERROR', 'All Pirate Bay mirrors are unavailable');
   }

  protected buildSearchUrl(query: string): string {
    return this.buildSearchUrlWithBase(this.config.baseUrl, query);
  }

  protected buildSearchUrlWithBase(baseUrl: string, query: string): string {
    const cleanedQuery = this.cleanQuery(query);
    const encodedQuery = encodeURIComponent(cleanedQuery);
    const searchUrl = `${baseUrl}/search/${encodedQuery}/1/99/0`; // Order by seeders desc
    return searchUrl;
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