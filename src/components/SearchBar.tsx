'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ChevronDown, Sparkles } from 'lucide-react';
import { TorrentCategory } from '@/lib/types';
import { categories } from '@/lib/mockData';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    large?: boolean;
    initialQuery?: string;
    initialCategory?: TorrentCategory | 'all';
}

export default function SearchBar({
    large = false,
    initialQuery = '',
    initialCategory = 'all'
}: SearchBarProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [category, setCategory] = useState<TorrentCategory | 'all'>(initialCategory);
    const [showDropdown, setShowDropdown] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (query.trim()) params.set('q', query.trim());
        if (category !== 'all') params.set('category', category);
        router.push(`/search?${params.toString()}`);
    };

    const selectedCategory = category === 'all'
        ? { name: 'All Categories', icon: 'sparkles' }
        : categories.find(c => c.id === category);

    return (
        <form
            className={`${styles.searchBar} ${large ? styles.large : ''}`}
            onSubmit={handleSearch}
        >
            <div className={styles.categorySelector}>
                <button
                    type="button"
                    className={styles.categoryButton}
                    onClick={() => setShowDropdown(!showDropdown)}
                >
                    <Sparkles size={16} />
                    <span className={styles.categoryText}>{selectedCategory?.name}</span>
                    <ChevronDown size={16} className={showDropdown ? styles.rotated : ''} />
                </button>

                {showDropdown && (
                    <div className={styles.dropdown}>
                        <button
                            type="button"
                            className={`${styles.dropdownItem} ${category === 'all' ? styles.active : ''}`}
                            onClick={() => { setCategory('all'); setShowDropdown(false); }}
                        >
                            All Categories
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                type="button"
                                className={`${styles.dropdownItem} ${category === cat.id ? styles.active : ''}`}
                                onClick={() => { setCategory(cat.id); setShowDropdown(false); }}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className={styles.inputWrapper}>
                <Search className={styles.searchIcon} />
                <input
                    type="text"
                    placeholder="Search millions of torrents..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={styles.input}
                />
            </div>

            <button type="submit" className={styles.submitButton}>
                <Search size={20} />
                <span>Search</span>
            </button>
        </form>
    );
}
