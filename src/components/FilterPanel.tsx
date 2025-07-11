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
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-slate-900 dark:text-white">
          Filters
        </h3>
        <button
          onClick={resetFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
        >
          Reset
        </button>
      </div>

      {/* Sort Options */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
          Sort By
        </label>
        <div className="space-y-2">
          {sortOptions.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="radio"
                name="sortBy"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={() => handleSortChange(option.value)}
                className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500 dark:bg-slate-700"
              />
              <span className="text-sm text-slate-700 dark:text-slate-300">
                {option.label}
              </span>
            </label>
          ))}
        </div>
        
        {/* Sort Order Toggle */}
        <button
          onClick={handleSortOrderToggle}
          className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowUpDown className="w-4 h-4" />
          {filters.sortOrder === 'desc' ? 'Descending' : 'Ascending'}
        </button>
      </div>

      {/* Minimum Seeds */}
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Minimum Seeds
        </label>
        <input
          type="number"
          min="0"
          value={filters.minSeeds}
          onChange={(e) => handleMinSeedsChange(e.target.value)}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="0"
        />
      </div>

      {/* Sources Filter */}
      {availableSources.length > 0 && (
        <div>
          <button
            onClick={() => setShowSources(!showSources)}
            className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
          >
            Sources
            <ChevronDown className={`w-4 h-4 transition-transform ${showSources ? 'rotate-180' : ''}`} />
          </button>
          
          {showSources && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableSources.map((source) => (
                <label
                  key={source}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={filters.sources.includes(source)}
                      onChange={() => handleSourceToggle(source)}
                      className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:bg-slate-700"
                    />
                    {filters.sources.includes(source) && (
                      <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5 pointer-events-none" />
                    )}
                  </div>
                  <span className="text-sm text-slate-700 dark:text-slate-300">
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
          className="flex items-center justify-between w-full text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
        >
          Categories
          <ChevronDown className={`w-4 h-4 transition-transform ${showCategories ? 'rotate-180' : ''}`} />
        </button>
        
        {showCategories && (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {categories.map((category) => (
              <label
                key={category.value}
                className="flex items-center gap-2 cursor-pointer"
              >
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category.value)}
                    onChange={() => handleCategoryToggle(category.value)}
                    className="w-4 h-4 text-blue-600 border-slate-300 dark:border-slate-600 rounded focus:ring-blue-500 dark:bg-slate-700"
                  />
                  {filters.categories.includes(category.value) && (
                    <Check className="w-3 h-3 text-white absolute top-0.5 left-0.5 pointer-events-none" />
                  )}
                </div>
                <span className="text-sm text-slate-700 dark:text-slate-300">
                  {category.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {(filters.sources.length > 0 || filters.categories.length > 0 || filters.minSeeds > 0) && (
        <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Active Filters:
          </h4>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
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