'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import { ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Only apply scroll behavior on mobile (screen width < 768px)
      if (window.innerWidth < 768) {
        setIsScrolled(window.scrollY > 50);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

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
    <div className="min-h-screen md:h-screen md:flex md:flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <header className={`px-6 py-4 flex-shrink-0 transition-transform duration-300 md:transform-none ${isScrolled ? '-translate-y-full md:translate-y-0' : 'translate-y-0'}`}>
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="font-heading text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
              <span style={{ color: '#8b5cf6' }}>Torr</span><span style={{ color: '#3b82f6' }}>i</span><span style={{ color: '#06b6d4' }}>fy</span>
            </span>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 md:flex md:flex-col md:justify-center max-w-4xl mx-auto px-6 w-full">
        {/* Hero Section */}
        <div className={`text-center mb-8 pt-16 md:pt-0 animate-fade-in transition-all duration-300 md:transform-none md:opacity-100 ${isScrolled ? '-translate-y-full opacity-0 md:translate-y-0' : 'translate-y-0 opacity-100'}`}>
          <h1 className="font-heading text-4xl md:text-5xl font-medium mb-4 text-balance" style={{ color: 'var(--text-primary)' }}>
            Universal Torrent
            <span className="block mt-1" style={{ color: 'var(--accent)' }}>Search Engine</span>
          </h1>
          <p className="text-base md:text-lg mb-8 max-w-2xl mx-auto text-balance leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
            Search across all major torrent sources simultaneously. 
            Clean interface, fast results, no tracking.
          </p>
        </div>

        {/* Search Section */}
        <div className={`mb-10 animate-slide-up transition-all duration-300 md:transform-none md:opacity-100 ${isScrolled ? '-translate-y-full opacity-0 md:translate-y-0' : 'translate-y-0 opacity-100'}`}>
          <SearchBar
            onSearch={handleSearch}
            loading={isSearching}
            placeholder="Search for anything..."
          />
        </div>

        {/* Quick Categories - Sticky on mobile when scrolled */}
        <div className={`animate-slide-up transition-all duration-300 pb-20 md:pb-0 ${isScrolled ? 'md:relative fixed top-4 left-0 right-0 z-10 bg-[var(--background)] px-6 py-4 shadow-sm' : 'relative'}`}>
          <h2 className="font-heading text-lg font-medium mb-6 text-center" style={{ color: 'var(--text-primary)' }}>
            Popular Categories
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-w-lg mx-auto">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleSearch(category.query)}
                className="group flex items-center space-x-3 p-3 rounded-xl border transition-all duration-200 hover:shadow-sm hover:bg-[var(--surface-subtle)]"
                style={{ 
                  backgroundColor: 'var(--surface)',
                  borderColor: 'var(--border)'
                }}
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
      </main>
    </div>
  );
}
