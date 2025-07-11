'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResponse, TorrentResult, FilterOptions } from '@/types';
import { sortTorrents, filterTorrents, groupTorrentsBySource } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import TorrentCard from '@/components/TorrentCard';
import FilterPanel from '@/components/FilterPanel';
import LoadingSkeletons from '@/components/LoadingSkeletons';
import { ArrowLeft, Filter, Download, Clock, AlertCircle } from 'lucide-react';

function SearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState<TorrentResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<FilterOptions>({
    sources: [],
    minSeeds: 0,
    categories: [],
    sortBy: 'seeds',
    sortOrder: 'desc',
  });

  // Perform search
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        q: searchQuery.trim(),
        limit: '100',
      });

      const response = await fetch(`/api/search?${params}`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setSearchData(data);
      
      // Update URL without triggering navigation
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.replaceState({}, '', newUrl);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort results
  useEffect(() => {
    if (!searchData?.results) {
      setFilteredResults([]);
      return;
    }

    let results = [...searchData.results];
    
    // Apply source filter
    if (selectedSource !== 'all') {
      results = results.filter(torrent => torrent.source === selectedSource);
    }
    
    // Apply other filters
    results = filterTorrents(results, filters);
    
    // Apply sorting
    results = sortTorrents(results, filters.sortBy, filters.sortOrder);
    
    setFilteredResults(results);
  }, [searchData, filters, selectedSource]);

  // Initial search on component mount
  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  // Get available sources for filter
  const availableSources = searchData?.sources?.map(s => s.source) || [];

  // Group results by source
  const groupedResults = groupTorrentsBySource(filteredResults);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">
              Torrify
            </h1>
          </div>
          
          <SearchBar
            onSearch={performSearch}
            loading={loading}
            defaultValue={query}
            placeholder="Search torrents..."
          />
          
          {/* Source Tabs */}
          {searchData && !loading && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedSource('all')}
                  className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                    selectedSource === 'all'
                      ? 'bg-red-500 text-white rounded-md'
                      : 'text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400'
                  }`}
                >
                  All Sources
                </button>
                {availableSources.map((source) => {
                  const sourceResultCount = searchData.results.filter(r => r.source === source).length;
                  return (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                        selectedSource === source
                          ? 'bg-red-500 text-white rounded-md'
                          : 'text-slate-700 dark:text-slate-300 hover:text-red-500 dark:hover:text-red-400'
                      }`}
                    >
                      {source} ({sourceResultCount})
                    </button>
                  );
                })}
              </div>
              
              {/* Results Summary */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  {searchData.cached && (
                    <span className="inline-flex items-center gap-1 mr-3">
                      <Clock className="h-4 w-4" />
                      Cached
                    </span>
                  )}
                  <span>
                    {filteredResults.length} results found in {searchData.executionTime}ms
                    {selectedSource !== 'all' && (
                      <span className="ml-2 text-red-500 font-medium">
                        from {selectedSource}
                      </span>
                    )}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition-colors ${
                      showFilters
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Filter className="h-4 w-4" />
                    Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Loading State */}
        {loading && <LoadingSkeletons />}

        {/* Error State */}
        {error && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                Search Failed
              </h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                {error}
              </p>
              <button
                onClick={() => performSearch(query)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredResults.length === 0 && searchData && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Download className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                No Results Found
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Try adjusting your search terms or filters
              </p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && !error && filteredResults.length > 0 && (
          <div className={`${showFilters ? 'lg:grid lg:grid-cols-4 lg:gap-6' : ''}`}>
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="lg:col-span-1 mb-6 lg:mb-0">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableSources={availableSources}
                />
              </div>
            )}

            {/* Results Grid */}
            <div className={showFilters ? 'lg:col-span-3' : ''}>
              {selectedSource === 'all' ? (
                /* Results grouped by Source */
                Object.entries(groupedResults).map(([source, results]) => (
                  <div key={source} className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                        {source}
                      </h2>
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {results.length} results
                      </span>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {results.map((torrent, index) => (
                        <TorrentCard
                          key={`${source}-${index}`}
                          torrent={torrent}
                          onMagnetClick={(magnetLink: string) => {
                            window.open(magnetLink, '_blank');
                          }}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                /* Results from single source */
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {filteredResults.map((torrent, index) => (
                    <TorrentCard
                      key={`${selectedSource}-${index}`}
                      torrent={torrent}
                      onMagnetClick={(magnetLink: string) => {
                        window.open(magnetLink, '_blank');
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <SearchResults />
    </Suspense>
  );
}