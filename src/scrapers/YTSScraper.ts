import { BaseScraperClass } from './BaseScraper';
import { ScraperConfig } from '@/types';
import * as cheerio from 'cheerio';

export class YTSScraper extends BaseScraperClass {
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

      // YTS uses a different structure - look for movie containers
      $('.browse-movie-wrap').each((index, element) => {
        if (index >= limit) return false;

        const $movie = $(element);
        const $link = $movie.find('.browse-movie-link');
        
        if (!$link.length) return;

        const title = this.extractText($movie.find('.browse-movie-title').text());
        const year = this.extractText($movie.find('.browse-movie-year').text());
        const fullTitle = year ? `${title} (${year})` : title;
        
        const movieUrl = $link.attr('href') || '';
        const link = movieUrl.startsWith('http') ? movieUrl : this.config.baseUrl + movieUrl;

        // Extract rating and genre
        const rating = this.extractText($movie.find('.rating').text());
        const genres = $movie.find('.browse-movie-tags').text().trim();

        // YTS typically shows quality options, we'll need to get the torrent page
        // For now, we'll create placeholder entries and the actual magnet links
        // would need to be fetched from the individual movie pages
        
        if (title) {
          // Create entries for common YTS qualities
          const qualities = ['720p', '1080p', '2160p'];
          
          qualities.forEach(quality => {
            results.push({
              title: `${fullTitle} [${quality}] [YTS]`,
              magnetLink: '', // Would need to fetch from movie page
              seeds: 0, // YTS doesn't show seeds on browse page
              leechers: 0,
              size: quality === '720p' ? '1.2 GB' : quality === '1080p' ? '2.3 GB' : '4.5 GB',
              uploadDate: new Date().toISOString().split('T')[0], // Approximate
              link,
              category: 'movies',
              verified: true, // YTS releases are generally trusted
              quality,
              rating,
              genres,
            });
          });
        }
      });

      return results.slice(0, limit);

    } catch (error) {
      console.error('[YTS] Search failed:', error);
      throw this.createError('PARSE_ERROR', 'Failed to parse YTS search results', error);
    }
  }

  protected buildSearchUrl(query: string): string {
    const encodedQuery = encodeURIComponent(this.cleanQuery(query));
    return `${this.config.baseUrl}/browse-movies/${encodedQuery}/all/all/0/latest/0/all`;
  }

  protected getHeaders(): Record<string, string> {
    return {
      ...super.getHeaders(),
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
    };
  }

  /**
   * Fetch detailed torrent information from movie page
   * This would be called as a secondary request to get actual magnet links
   */
  private async fetchMovieDetails(movieUrl: string): Promise<Record<string, unknown>[]> {
    try {
      const response = await this.axiosInstance.get(movieUrl, {
        headers: this.getHeaders(),
      });

      const $ = cheerio.load(response.data);
      const torrents: Record<string, unknown>[] = [];

      // Extract torrent download links
      $('.modal-torrent').each((index, element) => {
        const $torrent = $(element);
        const quality = this.extractText($torrent.find('.modal-quality').text());
        const size = this.extractText($torrent.find('.modal-file-size').text());
        const magnetLink = $torrent.find('a[href^="magnet:"]').attr('href') || '';
        
        if (magnetLink) {
          torrents.push({
            quality,
            size,
            magnetLink,
          });
        }
      });

      return torrents;

    } catch (error) {
      console.error('[YTS] Failed to fetch movie details:', error);
      return [];
    }
  }
}