'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { Search, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const categories = [
    { name: 'Movies', query: 'movies 2024', emoji: '🎬' },
    { name: 'TV Shows', query: 'tv series', emoji: '📺' },
    { name: 'Anime', query: 'anime', emoji: '🎌' },
    { name: 'Music', query: 'music albums', emoji: '🎵' },
    { name: 'Games', query: 'pc games', emoji: '🎮' },
    { name: 'Software', query: 'software', emoji: '💻' },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className="px-6 py-6">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Search className="h-4 w-4 text-white" />
            </div>
            <span className="font-heading text-xl font-medium" style={{ color: 'var(--text-primary)' }}>
              Torrify
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8 text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>
            <span>Multi-source</span>
            <span>•</span>
            <span>Privacy-focused</span>
            <span>•</span>
            <span>Open source</span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-fade-in">
          <h1 className="font-heading text-5xl md:text-6xl font-medium mb-6 text-balance" style={{ color: 'var(--text-primary)' }}>
            Universal Torrent
            <span className="block mt-2" style={{ color: 'var(--accent)' }}>Search Engine</span>
          </h1>
          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto text-balance leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Search across all major torrent sources simultaneously. 
            Clean interface, fast results, no tracking.
          </p>
        </div>

        {/* Search Section */}
        <div className="mb-20 animate-slide-up">
          <SearchBar
            onSearch={handleSearch}
            loading={isSearching}
            placeholder="Search for anything..."
          />
        </div>

        {/* Quick Categories */}
        <div className="mb-20 animate-slide-up">
          <h2 className="font-heading text-xl font-medium mb-8 text-center" style={{ color: 'var(--text-primary)' }}>
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleSearch(category.query)}
                className="group flex items-center space-x-3 p-4 rounded-xl border transition-all duration-200 hover:shadow-sm"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)',
                  '--hover-bg': 'var(--surface-subtle)'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--surface-subtle)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--surface)'}
              >
                <span className="text-lg">{category.emoji}</span>
                <span className="font-medium text-sm flex-1 text-left" style={{ color: 'var(--text-primary)' }}>
                  {category.name}
                </span>
                <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-subtle)' }} />
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <Search className="h-5 w-5" style={{ color: 'var(--accent)' }} />
            </div>
            <h3 className="font-heading text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Multi-Source
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Search The Pirate Bay, 1337x, YTS, and Nyaa simultaneously for comprehensive results
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <svg className="h-5 w-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Lightning Fast
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              Concurrent scraping with intelligent caching delivers results in milliseconds
            </p>
          </div>

          <div className="text-center p-6">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent-subtle)' }}>
              <svg className="h-5 w-5" style={{ color: 'var(--accent)' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="font-heading text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
              Privacy First
            </h3>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
              No tracking, no ads, no data collection. Your searches remain completely private
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t mt-20" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="text-center">
            <div className="mb-4">
              <p className="text-sm font-medium mb-2" style={{ color: 'var(--warning)' }}>
                ⚠️ Educational Purpose Only
              </p>
              <p className="text-sm leading-relaxed max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
                This application is for educational purposes only. We do not host any content and are not responsible 
                for how you use this tool. Please respect copyright laws and content creators.
              </p>
            </div>
            <div className="flex justify-center items-center space-x-6 text-sm" style={{ color: 'var(--text-subtle)' }}>
              <span>Made with care</span>
              <span>•</span>
              <span>Open source</span>
              <span>•</span>
              <span>Privacy focused</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
