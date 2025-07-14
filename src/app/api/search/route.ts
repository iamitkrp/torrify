import { NextRequest, NextResponse } from 'next/server';
import { SearchParams, SearchResponse, ScraperResponse } from '@/types';
import { getAllScrapers, getScrapersByCategory, cleanupAllScrapers, BaseScraperClass } from '@/scrapers';
import { sortTorrents, cleanSearchQuery, calculateSearchStats } from '@/lib/utils';
import { getCachedResults, setCachedResults } from '@/lib/cache';

const MAX_CONCURRENT_SCRAPERS = parseInt(process.env.MAX_CONCURRENT_REQUESTS || '4');
// Increase timeout for Vercel to allow more time for HTTP requests
const SEARCH_TIMEOUT = parseInt(process.env.SCRAPING_TIMEOUT || (process.env.VERCEL ? '25000' : '15000'));

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Parse search parameters
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const sources = searchParams.get('sources')?.split(',') || [];
    const category = searchParams.get('category') || 'all';
    const sortBy = (searchParams.get('sortBy') || 'seeds') as 'seeds' | 'leechers' | 'size' | 'date' | 'health';
    const limit = parseInt(searchParams.get('limit') || '50');

    // Validate query
    if (!query || query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    const cleanedQuery = cleanSearchQuery(query);
    
    // Check cache first
    const cached = getCachedResults(cleanedQuery, sources);
    if (cached) {
      console.log(`[API] Cache hit for query: ${cleanedQuery}`);
      return NextResponse.json(cached);
    }

    console.log(`[API] Cache miss, starting search for: ${cleanedQuery}`);

    // Get appropriate scrapers
    const availableScrapers = category === 'all' 
      ? getAllScrapers() 
      : getScrapersByCategory(category);

    // Filter scrapers by requested sources
    const targetScrapers = sources.length > 0
      ? availableScrapers.filter(scraper => 
          sources.some(source => scraper.name.toLowerCase().includes(source.toLowerCase()))
        )
      : availableScrapers;

    if (targetScrapers.length === 0) {
      return NextResponse.json(
        { error: 'No available scrapers for the requested sources' },
        { status: 400 }
      );
    }

    // Execute searches concurrently with controlled concurrency
    const scraperResults = await executeScrapersWithConcurrency(
      targetScrapers,
      cleanedQuery,
      limit,
      MAX_CONCURRENT_SCRAPERS
    );

    // Combine results from all scrapers
    const allResults = scraperResults
      .filter(result => result.success)
      .flatMap(result => result.results);

    // Sort results by seeds (default) or specified sort option
    const sortedResults = sortTorrents(allResults, sortBy, 'desc');

    // Limit results
    const limitedResults = sortedResults.slice(0, limit);

    // Calculate statistics
    const stats = calculateSearchStats(limitedResults);

    // Prepare response
    const response: SearchResponse = {
      results: limitedResults,
      totalCount: limitedResults.length,
      sources: scraperResults,
      query: cleanedQuery,
      cached: false,
      executionTime: Date.now() - startTime,
      ...stats,
    };

    // Cache the response
    setCachedResults(cleanedQuery, sources, response);

    console.log(`[API] Search completed in ${response.executionTime}ms, found ${response.totalCount} results`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[API] Search failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SearchParams;
    
    // Validate request body
    if (!body.query || body.query.trim().length < 2) {
      return NextResponse.json(
        { error: 'Query must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Create URL with query parameters for GET handler
    const url = new URL(request.url);
    url.searchParams.set('q', body.query);
    
    if (body.sources && body.sources.length > 0) {
      url.searchParams.set('sources', body.sources.join(','));
    }
    
    if (body.category) {
      url.searchParams.set('category', body.category);
    }
    
    if (body.sortBy) {
      url.searchParams.set('sortBy', body.sortBy);
    }
    
    if (body.limit) {
      url.searchParams.set('limit', body.limit.toString());
    }

    // Create a new request object with the modified URL
    const newRequest = new NextRequest(url.toString(), {
      method: 'GET',
      headers: request.headers,
    });

    // Call the GET handler
    return await GET(newRequest);

  } catch (error) {
    console.error('[API] POST search failed:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Execute scrapers with controlled concurrency
 */
async function executeScrapersWithConcurrency(
  scrapers: BaseScraperClass[],
  query: string,
  limit: number,
  maxConcurrent: number
): Promise<ScraperResponse[]> {
  const results: ScraperResponse[] = [];
  
  // Split scrapers into chunks for controlled concurrency
  for (let i = 0; i < scrapers.length; i += maxConcurrent) {
    const chunk = scrapers.slice(i, i + maxConcurrent);
    
    // Execute chunk concurrently
    const chunkPromises = chunk.map(async (scraper) => {
      try {
        console.log(`[API] Starting search on ${scraper.name}...`);
        
        // Add timeout wrapper
        const searchPromise = scraper.search(query, limit);
        const timeoutPromise = new Promise<ScraperResponse>((_, reject) => {
          setTimeout(() => reject(new Error('Scraper timeout')), SEARCH_TIMEOUT);
        });

        const result = await Promise.race([searchPromise, timeoutPromise]);
        
        console.log(`[API] ${scraper.name} completed: ${result.success ? `${result.results.length} results` : 'failed'}`);
        
        return result;
      } catch (error) {
        console.error(`[API] ${scraper.name} failed:`, error);
        
        return {
          source: scraper.name,
          results: [],
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          executionTime: SEARCH_TIMEOUT,
        } as ScraperResponse;
      }
    });

    // Wait for chunk to complete
    const chunkResults = await Promise.allSettled(chunkPromises);
    
    // Add fulfilled results
    chunkResults.forEach(result => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      }
    });

    // Add delay between chunks to be respectful to target sites
    if (i + maxConcurrent < scrapers.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

/**
 * Cleanup function for Playwright instances
 */
async function cleanup() {
  try {
    await cleanupAllScrapers();
  } catch (error) {
    console.error('[API] Cleanup failed:', error);
  }
}

// Handle cleanup on process exit
if (typeof window === 'undefined') {
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);
  process.on('exit', cleanup);
}