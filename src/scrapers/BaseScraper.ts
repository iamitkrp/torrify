import { BaseScraper, ScraperConfig, ScraperResponse, ScrapingError } from '@/types';
import { normalizeTorrent } from '@/lib/utils';
import axios, { AxiosInstance } from 'axios';

export abstract class BaseScraperClass implements BaseScraper {
  public name: string;
  public config: ScraperConfig;
  protected axiosInstance: AxiosInstance;
  private lastRequestTime: number = 0;

  constructor(config: ScraperConfig) {
    this.name = config.name;
    this.config = config;
    
    // Create axios instance with common configuration
    this.axiosInstance = axios.create({
      timeout: config.timeout,
      headers: {
        'User-Agent': config.userAgent,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
    });

    // Add response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw this.createError('TIMEOUT', 'Request timeout', error);
        }
        if (error.response?.status >= 500) {
          throw this.createError('NETWORK_ERROR', 'Server error', error);
        }
        if (error.response?.status === 429) {
          throw this.createError('RATE_LIMITED', 'Rate limited', error);
        }
        throw this.createError('NETWORK_ERROR', 'Network error', error);
      }
    );
  }

  /**
   * Check if scraper is enabled
   */
  public isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Main search method - must be implemented by each scraper
   */
  public async search(query: string, limit?: number): Promise<ScraperResponse> {
    if (!this.isEnabled()) {
      return {
        source: this.name,
        results: [],
        success: false,
        error: 'Scraper is disabled',
      };
    }

    const startTime = Date.now();

    try {
      // Apply rate limiting
      await this.applyRateLimit();

      // Perform the actual search
      const results = await this.performSearch(query, limit);

      // Normalize results
      const normalizedResults = results.map(result => 
        normalizeTorrent(result, this.name)
      );

      return {
        source: this.name,
        results: normalizedResults,
        success: true,
        executionTime: Date.now() - startTime,
      };

    } catch (error) {
      console.error(`[${this.name}] Search failed:`, error);
      
      return {
        source: this.name,
        results: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        executionTime: Date.now() - startTime,
      };
    }
  }

  /**
   * Abstract method for performing search - must be implemented by each scraper
   */
  protected abstract performSearch(query: string, limit?: number): Promise<Record<string, unknown>[]>;

  /**
   * Apply rate limiting between requests
   */
  protected async applyRateLimit(): Promise<void> {
    if (this.config.rateLimit) {
      const timeSinceLastRequest = Date.now() - this.lastRequestTime;
      const minInterval = this.config.rateLimit;

      if (timeSinceLastRequest < minInterval) {
        const delay = minInterval - timeSinceLastRequest;
        await this.delay(delay);
      }
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Create a standardized error
   */
  protected createError(
    code: ScrapingError['code'],
    message: string,
    originalError?: unknown
  ): ScrapingError {
    const error = new Error(message) as ScrapingError;
    error.source = this.name;
    error.code = code;
    error.details = originalError ? { originalError } : undefined;
    return error;
  }

  /**
   * Delay execution for a specified number of milliseconds
   */
  protected delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clean and prepare search query for the specific site
   */
  protected cleanQuery(query: string): string {
    return query
      .trim()
      .replace(/[^\w\s-_.]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Extract magnet link from various formats
   */
  protected extractMagnetLink(element: Record<string, unknown> | string): string {
    // Common patterns for magnet links
    const magnetPatterns = [
      /magnet:\?xt=urn:btih:[a-fA-F0-9]{40}[^"'\s]*/i,
      /href=['"]?(magnet:[^'">\s]+)/i,
    ];

    let magnetLink = '';

    if (typeof element === 'string') {
      magnetLink = element;
    } else if (element && typeof element === 'object') {
      // Try to find magnet link in href attributes
      if ('href' in element && typeof element.href === 'string') {
        magnetLink = element.href;
      } else if ('getAttribute' in element && typeof element.getAttribute === 'function') {
        magnetLink = (element.getAttribute as (attr: string) => string)('href') || '';
      }
    }

    // If no direct magnet link, search in text content
    if (!magnetLink || !magnetLink.startsWith('magnet:')) {
      let textContent = '';
      
      if (typeof element === 'string') {
        textContent = element;
      } else if (element && typeof element === 'object') {
        textContent = String(element.textContent || element.innerText || element.text || '');
      }
      
      for (const pattern of magnetPatterns) {
        const match = textContent.match(pattern);
        if (match) {
          magnetLink = match[0] || match[1];
          break;
        }
      }
    }

    return magnetLink.startsWith('magnet:') ? magnetLink : '';
  }

  /**
   * Parse number from string (for seeds, leechers, etc.)
   */
  protected parseNumber(value: string | number): number {
    if (typeof value === 'number') return Math.max(0, value);
    
    const cleanValue = String(value).replace(/[^\d.-]/g, '');
    const parsed = parseInt(cleanValue) || 0;
    return Math.max(0, parsed);
  }

  /**
   * Clean and extract text content
   */
  protected extractText(element: Record<string, unknown> | string): string {
    if (typeof element === 'string') return element.trim();
    if (!element) return '';
    
    return String(element.textContent || element.innerText || element.text || '').trim();
  }

  /**
   * Build search URL for the scraper
   */
  protected buildSearchUrl(query: string): string {
    // Default implementation - should be overridden by specific scrapers
    const encodedQuery = encodeURIComponent(this.cleanQuery(query));
    return `${this.config.baseUrl}/search/${encodedQuery}`;
  }

  /**
   * Get HTTP request headers for this scraper
   */
  protected getHeaders(): Record<string, string> {
    return {
      'User-Agent': this.config.userAgent,
      'Referer': this.config.baseUrl,
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
    };
  }
}

/**
 * Factory function to create scraper instances
 */
export function createScraper(scraperClass: new (config: ScraperConfig) => BaseScraperClass, config: ScraperConfig): BaseScraperClass {
  return new scraperClass(config);
}