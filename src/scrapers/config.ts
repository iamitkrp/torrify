import { ScraperConfig } from '@/types';

const DEFAULT_USER_AGENT = process.env.USER_AGENT || 
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

const DEFAULT_TIMEOUT = parseInt(process.env.SCRAPING_TIMEOUT || '15000');
const DEFAULT_RATE_LIMIT = parseInt(process.env.REQUEST_DELAY || '1000');

export const SCRAPER_CONFIGS: Record<string, ScraperConfig> = {
  piratebay: {
    name: 'The Pirate Bay',
    baseUrl: 'https://piratebay.live', // Try a different working mirror
    timeout: DEFAULT_TIMEOUT,
    userAgent: DEFAULT_USER_AGENT,
    enabled: true,
    usePlaywright: false,
    rateLimit: DEFAULT_RATE_LIMIT,
  },
  leetx: {
    name: '1337x',
    baseUrl: 'https://1337x.to',
    timeout: DEFAULT_TIMEOUT * 1.2, // Give 1337x more time
    userAgent: DEFAULT_USER_AGENT,
    enabled: false, // Temporarily disable due to parsing issues
    usePlaywright: true, // 1337x has more dynamic content
    rateLimit: DEFAULT_RATE_LIMIT * 1.5, // Slightly higher rate limit
  },
  yts: {
    name: 'YTS',
    baseUrl: 'https://yts.mx',
    timeout: DEFAULT_TIMEOUT,
    userAgent: DEFAULT_USER_AGENT,
    enabled: false, // Temporarily disable due to timeout issues
    usePlaywright: false, // YTS has a clean API-like structure
    rateLimit: DEFAULT_RATE_LIMIT * 0.5, // Lower rate limit for API-like requests
  },
  nyaa: {
    name: 'Nyaa',
    baseUrl: 'https://nyaa.si',
    timeout: DEFAULT_TIMEOUT,
    userAgent: DEFAULT_USER_AGENT,
    enabled: true,
    usePlaywright: process.env.VERCEL ? false : true, // Disable Playwright on Vercel, enable locally
    rateLimit: DEFAULT_RATE_LIMIT, // Standard rate limit for HTTP requests
    // On Vercel, uses HTTP-based scraper instead of Playwright for compatibility.
  },
  rarbg: {
    name: 'RARBG',
    baseUrl: 'https://rargb.to', // Updated to working mirror
    timeout: DEFAULT_TIMEOUT, // Reduce timeout for serverless compatibility
    userAgent: DEFAULT_USER_AGENT,
    enabled: true,
    usePlaywright: process.env.VERCEL ? false : true, // Disable Playwright on Vercel, enable locally
    rateLimit: DEFAULT_RATE_LIMIT, // Standard rate limit for HTTP requests
    // Note: RARBG officially shut down in May 2023. Available mirrors may be unreliable,
    // blocked, or potentially unsafe. Enable at your own discretion.
    // On Vercel, uses HTTP-based scraper instead of Playwright for compatibility.
  },
  test: {
    name: 'Test Scraper',
    baseUrl: 'https://example.com',
    timeout: DEFAULT_TIMEOUT,
    userAgent: DEFAULT_USER_AGENT,
    enabled: false, // Disabled since real scrapers are working
    usePlaywright: false,
    rateLimit: 100, // Very low rate limit for test
  },
};

/**
 * Get all enabled scraper configurations
 */
export function getEnabledScrapers(): ScraperConfig[] {
  return Object.values(SCRAPER_CONFIGS).filter(config => config.enabled);
}

/**
 * Get scraper configuration by name
 */
export function getScraperConfig(name: string): ScraperConfig | undefined {
  return SCRAPER_CONFIGS[name];
}

/**
 * Update scraper configuration at runtime
 */
export function updateScraperConfig(name: string, updates: Partial<ScraperConfig>): boolean {
  if (SCRAPER_CONFIGS[name]) {
    SCRAPER_CONFIGS[name] = { ...SCRAPER_CONFIGS[name], ...updates };
    return true;
  }
  return false;
}

/**
 * Disable/enable scrapers at runtime
 */
export function toggleScraper(name: string, enabled: boolean): boolean {
  return updateScraperConfig(name, { enabled });
}