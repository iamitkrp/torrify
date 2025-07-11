'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { Search, Zap, Shield, Cpu, Globe } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    // Navigate to search results page
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-blue-950">
      {/* Header */}
      <header className="px-6 py-4">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Search className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              Torrify
            </span>
          </div>
          <div className="hidden sm:flex items-center space-x-6 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              Safe
            </span>
            <span className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Fast
            </span>
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              Global
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 sm:py-20">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Search Torrents
            <span className="block text-blue-600 dark:text-blue-400">
              Across All Sources
            </span>
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 max-w-2xl mx-auto">
            Meta-search engine that aggregates results from multiple torrent sources
            including The Pirate Bay, 1337x, YTS, and Nyaa.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-16">
          <SearchBar
            onSearch={handleSearch}
            loading={isSearching}
            placeholder="Search for movies, TV shows, music, games, software..."
          />
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Multi-Source Search
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Search across The Pirate Bay, 1337x, YTS, and Nyaa simultaneously
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Concurrent scraping with caching for instant results
            </p>
          </div>

          <div className="text-center p-6 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Cpu className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Smart Filtering
            </h3>
            <p className="text-slate-600 dark:text-slate-300 text-sm">
              Sort by seeds, size, date with advanced filtering options
            </p>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
            Popular Categories
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { name: 'Movies', query: 'movies 2024' },
              { name: 'TV Shows', query: 'tv series' },
              { name: 'Anime', query: 'anime' },
              { name: 'Music', query: 'music albums' },
              { name: 'Games', query: 'pc games' },
              { name: 'Software', query: 'software' },
            ].map((category) => (
              <button
                key={category.name}
                onClick={() => handleSearch(category.query)}
                className="px-4 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors text-sm font-medium"
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            <div className="mb-4">
              <p className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                ⚠️ Educational Purpose Only
              </p>
              <p>
                This site does not host any torrent files and is for educational purposes only.
                Please respect copyright laws and use torrents responsibly.
              </p>
            </div>
            <div className="flex justify-center items-center space-x-4">
              <span>Made with ❤️ for the community</span>
              <span>•</span>
              <span>Open Source</span>
              <span>•</span>
              <span>Privacy Focused</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
