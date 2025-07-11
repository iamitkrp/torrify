'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { SearchBarProps } from '@/types';

export default function SearchBar({
  onSearch,
  loading = false,
  placeholder = "Search torrents...",
  defaultValue = ""
}: SearchBarProps) {
  const [query, setQuery] = useState(defaultValue);
  const [isFocused, setIsFocused] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSearch(query.trim());
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !isFocused) {
        e.preventDefault();
        const searchInput = document.getElementById('search-input') as HTMLInputElement;
        searchInput?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div 
          className="relative rounded-2xl border-2 transition-all duration-300 ease-out"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: isFocused ? 'var(--accent)' : 'var(--border)',
            boxShadow: isFocused ? '0 8px 24px rgba(0, 102, 255, 0.15)' : 'var(--shadow-sm)'
          }}
        >
          {/* Search Icon */}
          <div className="absolute left-6 top-1/2 transform -translate-y-1/2 z-10">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: 'var(--accent)' }} />
            ) : (
              <Search className="h-5 w-5" style={{ color: isFocused ? 'var(--accent)' : 'var(--text-subtle)' }} />
            )}
          </div>

          {/* Input Field */}
          <input
            id="search-input"
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={loading}
            className="w-full pl-14 pr-20 py-5 text-lg rounded-2xl bg-transparent border-none outline-none font-suisse placeholder:font-normal"
            style={{
              color: 'var(--text-primary)',
              '::placeholder': { color: 'var(--text-subtle)' }
            }}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Keyboard Shortcut Hint */}
          {!isFocused && !query && (
            <div className="absolute right-6 top-1/2 transform -translate-y-1/2">
              <div className="hidden sm:flex items-center space-x-2">
                <span className="text-xs font-medium" style={{ color: 'var(--text-subtle)' }}>Press</span>
                <kbd 
                  className="px-2 py-1 text-xs font-mono rounded border"
                  style={{
                    backgroundColor: 'var(--surface-subtle)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  /
                </kbd>
              </div>
            </div>
          )}

          {/* Search Button (Mobile) */}
          {query.trim().length >= 2 && (
            <button
              type="submit"
              disabled={loading}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 sm:hidden"
              style={{
                backgroundColor: 'var(--accent)',
                color: 'white'
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search'
              )}
            </button>
          )}
        </div>

        {/* Search Tips */}
        {isFocused && !query && (
          <div 
            className="absolute top-full left-0 right-0 mt-2 p-4 rounded-xl border animate-fade-in z-20"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              boxShadow: 'var(--shadow-lg)'
            }}
          >
            <h4 className="font-medium text-sm mb-3" style={{ color: 'var(--text-primary)' }}>
              Search tips
            </h4>
            <ul className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li className="flex items-start space-x-2">
                <span className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-subtle)' }}>•</span>
                <span>Use specific terms like <span className="font-mono text-xs px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--surface-subtle)' }}>&ldquo;Dune 2021 1080p&rdquo;</span></span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-subtle)' }}>•</span>
                <span>Include year for movies and TV shows</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-xs font-mono mt-0.5" style={{ color: 'var(--text-subtle)' }}>•</span>
                <span>Try alternative spellings if nothing found</span>
              </li>
            </ul>
          </div>
        )}
      </form>

      {/* Validation Message */}
      {query.length > 0 && query.trim().length < 2 && (
        <p className="mt-3 text-sm font-medium" style={{ color: 'var(--warning)' }}>
          Please enter at least 2 characters to search
        </p>
      )}
    </div>
  );
}