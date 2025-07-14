'use client';

import { useState, useEffect, Suspense, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { SearchResponse, TorrentResult, FilterOptions } from '@/types';
import { sortTorrents, filterTorrents, groupTorrentsBySource } from '@/lib/utils';
import SearchBar from '@/components/SearchBar';
import TorrentCard from '@/components/TorrentCard';
import FilterPanel from '@/components/FilterPanel';
import LoadingSkeletons from '@/components/LoadingSkeletons';
import { ArrowLeft, Filter, Download, Clock, AlertCircle, Search, Grid, List, SlidersHorizontal } from 'lucide-react';

// Mobile-First Search Component
function MobileSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState<TorrentResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<FilterOptions>({
    sources: [],
    minSeeds: 0,
    categories: [],
    sortBy: 'seeds',
    sortOrder: 'desc',
  });

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
      
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.replaceState({}, '', newUrl);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchData?.results) {
      setFilteredResults([]);
      return;
    }

    let results = [...searchData.results];
    
    if (selectedSource !== 'all') {
      results = results.filter(torrent => torrent.source === selectedSource);
    }
    
    results = filterTorrents(results, filters);
    results = sortTorrents(results, filters.sortBy, filters.sortOrder);
    
    setFilteredResults(results);
  }, [searchData, filters, selectedSource]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const availableSources = searchData?.sources?.map(s => s.source) || [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Mobile Header */}
      <header className="sticky top-0 z-50 header-backdrop border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="px-4 py-3">
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2.5 rounded-full transition-all duration-200"
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center">
              <h1 className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: '#8b5cf6' }}>Torr</span><span style={{ color: '#3b82f6' }}>i</span><span style={{ color: '#06b6d4' }}>fy</span>
              </h1>
            </div>

            <button
              onClick={() => setShowFilters(true)}
              className="p-2.5 rounded-full transition-all duration-200"
              style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </button>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <SearchBar
                onSearch={performSearch}
                loading={loading}
                defaultValue={query}
                placeholder="Search torrents..."
              />
            </div>
          </div>

          {/* Source Pills */}
          {searchData && !loading && (
            <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
              <button
                onClick={() => setSelectedSource('all')}
                className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200"
                style={{
                  backgroundColor: selectedSource === 'all' ? 'var(--accent)' : 'var(--surface)',
                  color: selectedSource === 'all' ? 'white' : 'var(--text-primary)',
                  border: selectedSource === 'all' ? 'none' : '1px solid var(--border)'
                }}
              >
                All Sources
              </button>
              {availableSources.map((source) => {
                const count = searchData.results.filter(r => r.source === source).length;
                return (
                  <button
                    key={source}
                    onClick={() => setSelectedSource(source)}
                    className="flex-shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all duration-200 whitespace-nowrap"
                    style={{
                      backgroundColor: selectedSource === source ? 'var(--accent)' : 'var(--surface)',
                      color: selectedSource === source ? 'white' : 'var(--text-primary)',
                      border: selectedSource === source ? 'none' : '1px solid var(--border)'
                    }}
                  >
                    {source} • {count}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </header>

      {/* Results Summary & View Toggle */}
      {searchData && !loading && (
        <div 
          className="sticky top-0 z-40 px-4 py-3 border-b backdrop-blur-sm"
          style={{ 
            backgroundColor: 'var(--backdrop-bg)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                {searchData.cached && (
                  <span className="inline-flex items-center gap-1 mr-3 text-xs">
                    <Clock className="h-3 w-3" />
                    <span>Cached</span>
                  </span>
                )}
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  {filteredResults.length}
                </span>
                <span> results</span>
                {selectedSource !== 'all' && (
                  <span className="ml-1 text-xs" style={{ color: 'var(--accent)' }}>
                    from {selectedSource}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--surface-subtle)',
                  color: 'var(--text-secondary)'
                }}
              >
                {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 px-4 py-4">
        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-2xl border p-4 animate-pulse" style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="h-4 rounded w-3/4 mb-2" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                    <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                  </div>
                  <div className="h-8 w-20 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                </div>
                <div className="flex gap-2 mb-3">
                  <div className="h-6 w-16 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                  <div className="h-6 w-12 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex gap-4">
                    <div className="h-3 w-12 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                    <div className="h-3 w-16 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                  </div>
                  <div className="h-8 w-24 rounded-lg" style={{ backgroundColor: 'var(--surface-subtle)' }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <AlertCircle className="h-8 w-8" style={{ color: 'var(--error)' }} />
            </div>
            <h3 className="font-heading text-lg font-medium mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              Oops! Something went wrong
            </h3>
            <p className="text-sm text-center mb-6 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              {error}
            </p>
            <button
              onClick={() => performSearch(query)}
              className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200"
              style={{ backgroundColor: 'var(--accent)', color: 'white' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* No Results */}
        {!loading && !error && filteredResults.length === 0 && searchData && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full mb-4 flex items-center justify-center" style={{ backgroundColor: 'var(--surface-subtle)' }}>
              <Search className="h-8 w-8" style={{ color: 'var(--text-subtle)' }} />
            </div>
            <h3 className="font-heading text-lg font-medium mb-2 text-center" style={{ color: 'var(--text-primary)' }}>
              No results found
            </h3>
            <p className="text-sm text-center max-w-sm" style={{ color: 'var(--text-secondary)' }}>
              Try adjusting your search terms or check different sources
            </p>
          </div>
        )}

        {/* Results */}
        {!loading && !error && filteredResults.length > 0 && (
          <div className={`space-y-4 ${viewMode === 'list' ? 'max-w-none' : ''}`}>
            {viewMode === 'grid' ? (
              filteredResults.map((torrent, index) => (
                <TorrentCard
                  key={`${torrent.source}-${index}`}
                  torrent={torrent}
                  onMagnetClick={(magnetLink: string) => {
                    window.open(magnetLink, '_blank');
                  }}
                />
              ))
            ) : (
              filteredResults.map((torrent, index) => (
                <div
                  key={`${torrent.source}-${index}`}
                  className="rounded-xl border p-4 transition-all duration-200"
                  style={{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm leading-tight line-clamp-2 mb-2" style={{ color: 'var(--text-primary)' }}>
                        {torrent.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="px-2 py-1 rounded-full font-medium" style={{ backgroundColor: 'var(--surface-subtle)' }}>
                          {torrent.source}
                        </span>
                        <span>{torrent.size}</span>
                        <span>•</span>
                        <span className="text-green-600 font-medium">{torrent.seeds}↑</span>
                        <span className="text-red-600 font-medium">{torrent.leechers}↓</span>
                      </div>
                    </div>
                    {torrent.magnetLink && (
                      <button
                        onClick={() => window.open(torrent.magnetLink, '_blank')}
                        className="ml-3 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200"
                        style={{ backgroundColor: 'var(--accent)', color: 'white' }}
                      >
                        Download
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>

      {/* Mobile Filter Dialog */}
      {showFilters && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setShowFilters(false)}
          />
          <div 
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-4xl rounded-2xl shadow-2xl"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-heading text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                Filter Results
              </h3>
              <button
                onClick={() => setShowFilters(false)}
                className="p-2 rounded-full" 
                style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            </div>
            <div className="p-2">
              <FilterPanel
                filters={filters}
                onFiltersChange={setFilters}
                availableSources={availableSources}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Desktop Search Component (Original - Untouched)
function DesktopSearchResults() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchData, setSearchData] = useState<SearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filteredResults, setFilteredResults] = useState<TorrentResult[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [headerVisible, setHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);
  const isScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<FilterOptions>({
    sources: [],
    minSeeds: 0,
    categories: [],
    sortBy: 'seeds',
    sortOrder: 'desc',
  });

  // Desktop scroll detection for header visibility
  useEffect(() => {
    const currentTimeout = scrollTimeout.current;
    
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollDifference = Math.abs(currentScrollY - lastScrollY.current);
      
      if (scrollDifference < 5) return;
      
      if (currentScrollY <= 50) {
        setHeaderVisible(true);
        lastScrollY.current = currentScrollY;
        return;
      }
      
      if (currentScrollY > 150 && scrollDifference > 10) {
        if (currentScrollY > lastScrollY.current + 15) {
          setHeaderVisible(false);
        } else if (currentScrollY < lastScrollY.current - 15) {
          setHeaderVisible(true);
        }
      }
      
      lastScrollY.current = currentScrollY;
    };

    const debouncedHandleScroll = () => {
      if (!isScrolling.current) {
        isScrolling.current = true;
        requestAnimationFrame(() => {
          handleScroll();
          isScrolling.current = false;
        });
      }
    };

    window.addEventListener('scroll', debouncedHandleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', debouncedHandleScroll);
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, []);

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
      
      const newUrl = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      window.history.replaceState({}, '', newUrl);
      
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!searchData?.results) {
      setFilteredResults([]);
      return;
    }

    let results = [...searchData.results];
    
    if (selectedSource !== 'all') {
      results = results.filter(torrent => torrent.source === selectedSource);
    }
    
    results = filterTorrents(results, filters);
    results = sortTorrents(results, filters.sortBy, filters.sortOrder);
    
    setFilteredResults(results);
  }, [searchData, filters, selectedSource]);

  useEffect(() => {
    if (query) {
      performSearch(query);
    }
  }, [query]);

  const availableSources = searchData?.sources?.map(s => s.source) || [];
  const groupedResults = groupTorrentsBySource(filteredResults);

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 border-b transition-transform duration-500 ease-out header-backdrop ${
          headerVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
        style={{ 
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.push('/')}
              className="p-2 rounded-xl transition-all duration-200 hover:shadow-sm"
              style={{
                backgroundColor: 'var(--surface-subtle)',
                color: 'var(--text-secondary)'
              }}
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div className="flex items-center">
              <span className="font-heading text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                <span style={{ color: '#8b5cf6' }}>Torr</span><span style={{ color: '#3b82f6' }}>i</span><span style={{ color: '#06b6d4' }}>fy</span>
              </span>
            </div>
          </div>
          
          <SearchBar
            onSearch={performSearch}
            loading={loading}
            defaultValue={query}
            placeholder="Search for anything..."
          />
          
          {/* Source Tabs & Results Summary */}
          {searchData && !loading && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedSource('all')}
                  className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: selectedSource === 'all' ? 'var(--accent)' : 'var(--surface-subtle)',
                    color: selectedSource === 'all' ? 'white' : 'var(--text-primary)'
                  }}
                >
                  All Sources
                </button>
                {availableSources.map((source) => {
                  const sourceResultCount = searchData.results.filter(r => r.source === source).length;
                  return (
                    <button
                      key={source}
                      onClick={() => setSelectedSource(source)}
                      className="px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                      style={{
                        backgroundColor: selectedSource === source ? 'var(--accent)' : 'var(--surface-subtle)',
                        color: selectedSource === source ? 'white' : 'var(--text-primary)'
                      }}
                    >
                      {source} ({sourceResultCount})
                    </button>
                  );
                })}
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm" style={{ color: 'var(--text-secondary)' }}>
                  {searchData.cached && (
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Cached
                    </span>
                  )}
                  <span>
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {filteredResults.length}
                    </span> results in {searchData.executionTime}ms
                    {selectedSource !== 'all' && (
                      <span className="ml-2 font-medium" style={{ color: 'var(--accent)' }}>
                        from {selectedSource}
                      </span>
                    )}
                  </span>
                </div>
                
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl transition-all duration-200"
                  style={{
                    backgroundColor: showFilters ? 'var(--accent-subtle)' : 'var(--surface-subtle)',
                    color: showFilters ? 'var(--accent)' : 'var(--text-primary)'
                  }}
                >
                  <Filter className="h-4 w-4" />
                  Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Content with proper top spacing */}
      <div className="pt-72">
        {/* Main Content */}
        <main className="max-w-6xl mx-auto px-6 py-8">
          {/* Loading State */}
          {loading && <LoadingSkeletons />}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                >
                  <AlertCircle className="h-8 w-8" style={{ color: 'var(--error)' }} />
                </div>
                <h3 className="font-heading text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  Search Failed
                </h3>
                <p className="text-sm mb-6 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  {error}
                </p>
                <button
                  onClick={() => performSearch(query)}
                  className="px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'white'
                  }}
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* No Results */}
          {!loading && !error && filteredResults.length === 0 && searchData && (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md">
                <div 
                  className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                >
                  <Download className="h-8 w-8" style={{ color: 'var(--text-subtle)' }} />
                </div>
                <h3 className="font-heading text-xl font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
                  No Results Found
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  Try adjusting your search terms or filters
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {!loading && !error && filteredResults.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredResults.map((torrent, index) => (
                <TorrentCard
                  key={`${torrent.source}-${index}`}
                  torrent={torrent}
                  onMagnetClick={(magnetLink: string) => {
                    window.open(magnetLink, '_blank');
                  }}
                />
              ))}
            </div>
          )}

          {/* Desktop Filter Dialog */}
          {showFilters && (
            <>
              <div 
                className="fixed inset-0 bg-black/50 z-50"
                onClick={() => setShowFilters(false)}
              />
              <div 
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[95vw] max-w-5xl rounded-2xl shadow-2xl"
                style={{ backgroundColor: 'var(--surface)' }}
              >
                <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--border)' }}>
                  <h3 className="font-heading text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
                    Filter Results
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 rounded-full hover:shadow-sm transition-all duration-200" 
                    style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-secondary)' }}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-2">
                  <FilterPanel
                    filters={filters}
                    onFiltersChange={setFilters}
                    availableSources={availableSources}
                  />
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// Main Component with Responsive Logic
function SearchResults() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile ? <MobileSearchResults /> : <DesktopSearchResults />;
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSkeletons />}>
      <SearchResults />
    </Suspense>
  );
}