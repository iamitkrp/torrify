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

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      onSearch(query.trim());
    }
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search bar on '/' key
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
    <div className="w-full max-w-2xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`
          relative rounded-xl border-2 transition-all duration-200
          ${isFocused 
            ? 'border-blue-500 shadow-lg shadow-blue-500/20' 
            : 'border-slate-200 dark:border-slate-700'
          }
          ${loading ? 'bg-slate-50 dark:bg-slate-800' : 'bg-white dark:bg-slate-900'}
        `}>
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="h-5 w-5 text-slate-400" />
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
            className={`
              w-full pl-12 pr-4 py-4 text-lg rounded-xl
              bg-transparent
              text-slate-900 dark:text-white
              placeholder-slate-400 dark:placeholder-slate-500
              border-none outline-none
              ${loading ? 'cursor-not-allowed' : ''}
            `}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Keyboard Shortcut Hint */}
          {!isFocused && !query && (
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
              <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded">
                /
              </kbd>
            </div>
          )}
        </div>

        {/* Search Button (Mobile) */}
        <button
          type="submit"
          disabled={loading || query.trim().length < 2}
          className="sm:hidden mt-4 w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Searching...
            </span>
          ) : (
            'Search'
          )}
        </button>
      </form>

      {/* Search Tips */}
      {isFocused && !query && (
        <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-2">
            Search Tips:
          </h4>
          <ul className="text-xs text-slate-600 dark:text-slate-400 space-y-1">
            <li>• Use specific terms: &ldquo;Avengers 2019 1080p&rdquo;</li>
            <li>• Try alternative spellings</li>
            <li>• Include year for movies/TV shows</li>
            <li>• Use quotes for exact phrases</li>
          </ul>
        </div>
      )}

      {/* Validation Message */}
      {query.length > 0 && query.trim().length < 2 && (
        <p className="mt-2 text-sm text-orange-600 dark:text-orange-400">
          Please enter at least 2 characters to search
        </p>
      )}
    </div>
  );
}