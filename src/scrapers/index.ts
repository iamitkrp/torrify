import { BaseScraperClass } from './BaseScraper';
import { PirateBayScraper } from './PirateBayScraper';
import { YTSScraper } from './YTSScraper';
import { NyaaScraper } from './NyaaScraper';
import { LeetxScraper } from './LeetxScraper';
import { TestScraper } from './TestScraper';
import { SCRAPER_CONFIGS, getEnabledScrapers } from './config';

// Export all scrapers
export { BaseScraperClass } from './BaseScraper';
export { PirateBayScraper } from './PirateBayScraper';
export { YTSScraper } from './YTSScraper';
export { NyaaScraper } from './NyaaScraper';
export { LeetxScraper } from './LeetxScraper';
export { TestScraper } from './TestScraper';
export { SCRAPER_CONFIGS, getEnabledScrapers } from './config';

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
      return new NyaaScraper(config);
    case 'leetx':
      return new LeetxScraper(config);
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
        s.name === 'YTS' || s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'Test Scraper'
      );
    case 'anime':
      return allScrapers.filter(s => 
        s.name === 'Nyaa' || s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'Test Scraper'
      );
    case 'music':
    case 'games':
    case 'software':
      return allScrapers.filter(s => 
        s.name === 'The Pirate Bay' || s.name === '1337x' || s.name === 'Test Scraper'
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
  }
}