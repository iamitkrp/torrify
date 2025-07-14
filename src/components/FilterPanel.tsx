'use client';

import { FilterPanelProps, SortOption } from '@/types';
import { Check, ChevronDown, ArrowUpDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { useState } from 'react';

export default function FilterPanel({ filters, onFiltersChange, availableSources }: FilterPanelProps) {

  const categories = [
    { value: 'movies', label: 'Movies', emoji: '🎬' },
    { value: 'tv', label: 'TV Shows', emoji: '📺' },
    { value: 'anime', label: 'Anime', emoji: '🎌' },
    { value: 'music', label: 'Music', emoji: '🎵' },
    { value: 'games', label: 'Games', emoji: '🎮' },
    { value: 'software', label: 'Software', emoji: '💻' },
    { value: 'books', label: 'Books', emoji: '📚' },
  ];

  const sortOptions: { value: SortOption; label: string; icon: string }[] = [
    { value: 'seeds', label: 'Seeds', icon: '🌱' },
    { value: 'leechers', label: 'Leechers', icon: '⬇️' },
    { value: 'size', label: 'Size', icon: '📦' },
    { value: 'date', label: 'Date', icon: '📅' },
    { value: 'health', label: 'Health', icon: '💚' },
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
    if (value === '') {
      onFiltersChange({ ...filters, minSeeds: 0 });
    } else {
      const minSeeds = Math.max(0, parseInt(value) || 0);
      onFiltersChange({ ...filters, minSeeds });
    }
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

  const hasActiveFilters = filters.sources.length > 0 || filters.categories.length > 0 || filters.minSeeds > 0;

  return (
    <div 
      className="rounded-xl border shadow-sm p-3"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border-subtle)'
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4" style={{ color: 'var(--accent)' }} />
          <h3 className="font-heading text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
            Filters
          </h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-md transition-all duration-200 hover:shadow-sm"
            style={{ 
              backgroundColor: 'var(--surface-subtle)', 
              color: 'var(--accent)' 
            }}
          >
            <RotateCcw className="w-3 h-3" />
            Reset
          </button>
        )}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2.5">
        
        {/* Column 1: Sort Options */}
        <div className="space-y-1.5">
          <h4 className="font-heading text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Sort By
          </h4>
          <div className="flex flex-wrap gap-1">
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortChange(option.value)}
                className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:shadow-sm"
                style={{
                  backgroundColor: filters.sortBy === option.value ? 'var(--accent)' : 'var(--surface-subtle)',
                  color: filters.sortBy === option.value ? 'white' : 'var(--text-primary)',
                  border: filters.sortBy === option.value ? 'none' : '1px solid var(--border)'
                }}
              >
                <span>{option.icon}</span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>

        </div>

        {/* Column 2: Sources Filter */}
        {availableSources.length > 0 && (
          <div className="space-y-1.5">
            <h4 className="font-heading text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Sources ({filters.sources.length}/{availableSources.length})
            </h4>
            <div className="flex flex-wrap gap-1">
              {availableSources.map((source) => {
                const isSelected = filters.sources.includes(source);
                return (
                  <button
                    key={source}
                    onClick={() => handleSourceToggle(source)}
                    className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:shadow-sm"
                    style={{
                      backgroundColor: isSelected ? 'var(--accent-subtle)' : 'var(--surface-subtle)',
                      color: isSelected ? 'var(--accent)' : 'var(--text-primary)',
                      border: isSelected ? '1px solid var(--accent)' : '1px solid transparent'
                    }}
                  >
                    <span>{source}</span>
                    {isSelected && (
                      <div className="w-3.5 h-3.5 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                        <Check className="w-2 h-2 text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Column 3: Categories Filter */}
        <div className="space-y-1.5">
          <h4 className="font-heading text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
            Categories ({filters.categories.length}/{categories.length})
          </h4>
          <div className="flex flex-wrap gap-1">
            {categories.map((category) => {
              const isSelected = filters.categories.includes(category.value);
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className="inline-flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md transition-all duration-200 hover:shadow-sm"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface-subtle)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    border: isSelected ? 'none' : '1px solid var(--border)'
                  }}
                >
                  <span>{category.emoji}</span>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>

          {/* Minimum Seeds */}
          <div className="space-y-1.5 mt-2">
            <h4 className="font-heading text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>
              Minimum Seeds
            </h4>
            <div className="relative">
              <input
                type="number"
                min="0"
                value={filters.minSeeds === 0 ? '' : filters.minSeeds}
                onChange={(e) => handleMinSeedsChange(e.target.value)}
                className="w-full pl-2.5 pr-12 py-1.5 rounded-md text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-50 border"
                style={{
                  backgroundColor: 'var(--surface)',
                  color: 'var(--text-primary)',
                  borderColor: 'var(--border)',
                  '--tw-ring-color': 'var(--accent)'
                } as React.CSSProperties}
                placeholder="Enter minimum seeds"
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-medium pointer-events-none" style={{ color: 'var(--text-subtle)' }}>
                seeds
              </div>
            </div>
          </div>
        </div>

      </div>


    </div>
  );
}