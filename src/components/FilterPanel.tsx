'use client';

import { FilterPanelProps, SortOption } from '@/types';
import { RotateCcw } from 'lucide-react';

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {

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

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    
    onFiltersChange({ ...filters, categories: newCategories });
  };

  const handleSortChange = (sortBy: SortOption) => {
    onFiltersChange({ ...filters, sortBy });
  };

  const resetFilters = () => {
    onFiltersChange({
      categories: [],
      sortBy: 'seeds',
      sortOrder: 'desc',
    });
  };

  const hasActiveFilters = filters.categories.length > 0;

  return (
    <div className="p-6">
      {/* Clean Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-heading text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
          Filters
        </h3>
        {hasActiveFilters && (
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200"
            style={{ 
              backgroundColor: 'var(--accent)', 
              color: 'white'
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset All
          </button>
        )}
      </div>

      {/* Clean Layout */}
      <div className="space-y-6">
        
        {/* Sort Options */}
        <div className="space-y-3">
          <h4 className="font-heading text-base font-medium" style={{ color: 'var(--text-primary)' }}>
            Sort By
          </h4>
          <div className="flex flex-wrap gap-2">
            {sortOptions.map((option) => {
              const isSelected = filters.sortBy === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => handleSortChange(option.value)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                  }}
                >
                  <span className="text-base">{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-base font-medium" style={{ color: 'var(--text-primary)' }}>
              Categories
            </h4>
            {filters.categories.length > 0 && (
              <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-subtle)' }}>
                {filters.categories.length} selected
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isSelected = filters.categories.includes(category.value);
              return (
                <button
                  key={category.value}
                  onClick={() => handleCategoryToggle(category.value)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 border"
                  style={{
                    backgroundColor: isSelected ? 'var(--accent)' : 'var(--surface)',
                    color: isSelected ? 'white' : 'var(--text-primary)',
                    borderColor: isSelected ? 'var(--accent)' : 'var(--border)'
                  }}
                >
                  <span className="text-base">{category.emoji}</span>
                  <span>{category.label}</span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}