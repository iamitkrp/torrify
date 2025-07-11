import { BaseScraperClass } from './BaseScraper';
import { PirateBayScraper } from './PirateBayScraper';
import { YTSScraper } from './YTSScraper';
import { NyaaScraper } from './NyaaScraper';
import { NyaaHttpScraper } from './NyaaHttpScraper';
import { LeetxScraper } from './LeetxScraper';
import { RarbgScraper } from './RarbgScraper';
import { RarbgHttpScraper } from './RarbgHttpScraper';
import { TestScraper } from './TestScraper';
import { SCRAPER_CONFIGS, getEnabledScrapers } from './config';

// Export all scrapers
export { BaseScraperClass } from './BaseScraper';
export { PirateBayScraper } from './PirateBayScraper';
export { YTSScraper } from './YTSScraper';
export { NyaaScraper } from './NyaaScraper';
export { NyaaHttpScraper } from './NyaaHttpScraper';
export { LeetxScraper } from './LeetxScraper';
export { RarbgScraper } from './RarbgScraper';
export { RarbgHttpScraper } from './RarbgHttpScraper';
export { TestScraper } from './TestScraper';
export { SCRAPER_CONFIGS, getEnabledScrapers } from './config';

// Check if we're in a serverless environment (Vercel)
const isServerless = process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY;

/**
 * Scraper factory to create instances
 */
export function createScraperInstance(scraperName: string): BaseScraperClass | null {
  const config = SCRAPER_CONFIGS[scraperName];
  if (!config || !config.enabled) {
    return null;
  }

  switch (scraperName) {
    case 'piratebay':
      return new PirateBayScraper(config);
    case 'yts':
      return new YTSScraper(config);
    case 'nyaa':
      // Use HTTP-based scraper for serverless environments (Vercel), Playwright version for local
      return isServerless ? new NyaaHttpScraper(config) : new NyaaScraper(config);
    case 'leetx':
      return new LeetxScraper(config);
    case 'rarbg':
      // Use HTTP-based scraper for serverless environments (Vercel), Playwright version for local
      return isServerless ? new RarbgHttpScraper(config) : new RarbgScraper(config);
    case 'test':
      return new TestScraper(config);
    default:
      return null;
  }
}

/**
 * Get all enabled scraper instances
 */
export function getAllScrapers(): BaseScraperClass[] {
  const enabledConfigs = getEnabledScrapers();
  const scrapers: BaseScraperClass[] = [];

  for (const config of enabledConfigs) {
    const scraperName = Object.keys(SCRAPER_CONFIGS).find(
      key => SCRAPER_CONFIGS[key] === config
    );
    
    if (scraperName) {
      const scraper = createScraperInstance(scraperName);
      if (scraper) {
        scrapers.push(scraper);
      }
    }
  }

  return scrapers;
}

/**
 * Get scrapers by category
 */
export function getScrapersByCategory(category: string): BaseScraperClass[] {
  const allScrapers = getAllScrapers();
  
  // Filter scrapers based on category preference
  switch (category.toLowerCase()) {
    case 'movies':
    case 'tv':
      return allScrapers.filter(s => 
        s.name === 'YTS' || s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'RARBG' || s.name === 'Test Scraper'
      );
    case 'anime':
      return allScrapers.filter(s => 
        s.name === 'Nyaa' || s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'RARBG' || s.name === 'Test Scraper'
      );
    case 'music':
    case 'games':
    case 'software':
      return allScrapers.filter(s => 
        s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'RARBG' || s.name === 'Test Scraper'
      );
    default:
      return allScrapers;
  }
}

/**
 * Cleanup all scrapers (especially important for Playwright instances)
 */
export async function cleanupAllScrapers(): Promise<void> {
  const scrapers = getAllScrapers();
  
  for (const scraper of scrapers) {
    if (scraper instanceof LeetxScraper) {
      await scraper.cleanup();
    }
    if (scraper instanceof NyaaScraper) {
      await scraper.cleanup();
    }
    // NyaaHttpScraper doesn't need cleanup as it doesn't use browser automation
    if (scraper instanceof RarbgScraper) {
      await scraper.cleanup();
    }
    // RarbgHttpScraper doesn't need cleanup as it doesn't use browser automation
  }
}