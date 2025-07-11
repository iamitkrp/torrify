'use client';

import { FilterPanelProps, SortOption } from '@/types';
import { Check, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useState } from 'react';

export default function FilterPanel({ filters, onFiltersChange, availableSources }: FilterPanelProps) {
  const [showSources, setShowSources] = useState(false);
  const [showCategories, setShowCategories] = useState(false);

  const categories = [
    { value: 'movies', label: 'Movies' },
    { value: 'tv', label: 'TV Shows' },
    { value: 'anime', label: 'Anime' },
    { value: 'music', label: 'Music' },
    { value: 'games', label: 'Games' },
    { value: 'software', label: 'Software' },
    { value: 'books', label: 'Books' },
  ];

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'seeds', label: 'Seeds' },
    { value: 'leechers', label: 'Leechers' },
    { value: 'size', label: 'Size' },
    { value: 'date', label: 'Upload Date' },
    { value: 'title', label: 'Title' },
  ];

  const handleSourceToggle = (source: string) => {
    const newSources = filters.sources.includes(source)
      ? filters.sources.filter(s => s !== source)
      : [...filters.sources, source];
    
    onFiltersChange({ ...filters, sources: newSources });
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const handleSortOrderToggle = () => {
    const newSortOrder = filters.sortOrder === 'desc' ? 'asc' : 'desc';
    onFiltersChange({ ...filters, sortOrder: newSortOrder });
  };

  const handleMinSeedsChange = (value: string) => {
    const minSeeds = parseInt(value) || 0;
    onFiltersChange({ ...filters, minSeeds });
  };

  const resetFilters = () => {
    onFiltersChange({
      sources: [],
      minSeeds: 0,
      categories: [],
      sortBy: 'seeds',
      sortOrder: 'desc',
    });
  };

  return (
    <div 
      className="rounded-xl border p-5 space-y-6"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm font-medium transition-colors duration-200"
          style={{ color: 'var(--accent)' }}
        >
          Reset
        </button>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium mb-4" style={{ color: 'var(--text-primary)' }}>
          Sort By
        </label>
        <div className="space-y-3">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <input
                  type="radio"
                  name="sortBy"
                  value={option.value}
                  checked={filters.sortBy === option.value}
                  onChange={() => handleSortChange(option.value)}
                  className="w-4 h-4 opacity-0 absolute"
                />
                <div 
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200"
                  style={{
                    borderColor: filters.sortBy === option.value ? 'var(--accent)' : 'var(--border)',
                    backgroundColor: filters.sortBy === option.value ? 'var(--accent)' : 'transparent'
                  }}
                >
                  {filters.sortBy === option.value && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
                  )}
                </div>
              </div>
              <span className="text-sm font-suisse" style={{ color: 'var(--text-primary)' }}>
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        {/* Sort Order Toggle */}
        <button
          onClick={handleSortOrderToggle}
          className="mt-4 flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{ color: 'var(--text-secondary)' }}
        >
          <ArrowUpDown className="w-4 h-4" />
          {filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
        </button>
      </div>

      {/* Minimum Seeds */}
      <div>
        <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
          Minimum Seeds
        </label>
        <input
          type="number"
          min="0"
          value={filters.minSeeds}
          onChange={(e) => handleMinSeedsChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-sm font-suisse transition-all duration-200 focus:outline-none focus:ring-2"
          style={{
            backgroundColor: 'var(--surface-subtle)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
            '--ring-color': 'var(--accent)',
            '--ring-opacity': '0.2'
          }}
          placeholder="0"
        />
      </div>

      {/* Sources Filter */}
      {availableSources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full text-sm font-medium mb-3 transition-colors duration-200"
            style={{ color: 'var(--text-primary)' }}
          >
            Sources
            <ChevronDown 
              className={`w-4 h-4 transition-transform duration-200 ${showSources ? 'rotate-180' : ''}`}
              style={{ color: 'var(--text-subtle)' }}
            />
          </button>
          
          {showSources && (
            <div className="space-y-3 max-h-40 overflow-y-auto">
              {availableSources.map((source) => (
                <label
                  key={source}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                      className="w-4 h-4 opacity-0 absolute"
                    />
                    <div 
                      className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                      style={{
                        borderColor: filters.sources.includes(source) ? 'var(--accent)' : 'var(--border)',
                        backgroundColor: filters.sources.includes(source) ? 'var(--accent)' : 'transparent'
                      }}
                    >
                      {filters.sources.includes(source) && (
                        <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                      )}
                    </div>
                  </div>
                  <span className="text-sm font-suisse" style={{ color: 'var(--text-primary)' }}>
                    {source}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Categories Filter */}
      <div>
        <button
          onClick={() => setShowCategories(!showCategories)}
          className="flex items-center justify-between w-full text-sm font-medium mb-3 transition-colors duration-200"
          style={{ color: 'var(--text-primary)' }}
        >
          Categories
          <ChevronDown 
            className={`w-4 h-4 transition-transform duration-200 ${showCategories ? 'rotate-180' : ''}`}
            style={{ color: 'var(--text-subtle)' }}
          />
        </button>
        
        {showCategories && (
          <div className="space-y-3 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.value}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.value)}
                    onChange={() => handleCategoryToggle(category.value)}
                    className="w-4 h-4 opacity-0 absolute"
                  />
                  <div 
                    className="w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-200"
                    style={{
                      borderColor: filters.categories.includes(category.value) ? 'var(--accent)' : 'var(--border)',
                      backgroundColor: filters.categories.includes(category.value) ? 'var(--accent)' : 'transparent'
                    }}
                  >
                    {filters.categories.includes(category.value) && (
                      <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className="text-sm font-suisse" style={{ color: 'var(--text-primary)' }}>
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.sources.length > 0 || filters.categories.length > 0 || filters.minSeeds > 0) && (
        <div className="pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
          <h4 className="text-sm font-medium mb-3" style={{ color: 'var(--text-primary)' }}>
            Active Filters
          </h4>
          <div className="space-y-2 text-xs font-suisse" style={{ color: 'var(--text-secondary)' }}>
            {filters.sources.length > 0 && (
              <div>Sources: {filters.sources.length} selected</div>
            )}
            {filters.categories.length > 0 && (
              <div>Categories: {filters.categories.length} selected</div>
            )}
            {filters.minSeeds > 0 && (
              <div>Min Seeds: {filters.minSeeds}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}