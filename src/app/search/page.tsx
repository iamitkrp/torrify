'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
    SlidersHorizontal, ArrowUpDown, Grid, List,
    ChevronDown, X, Loader2
} from 'lucide-react';
import Header from '@/components/Header';
import TorrentCard from '@/components/TorrentCard';
import TorrentModal from '@/components/TorrentModal';
import Footer from '@/components/Footer';
import { mockTorrents, generateMoreTorrents, categories } from '@/lib/mockData';
import { Torrent, TorrentCategory, SortOption } from '@/lib/types';
import styles from './page.module.css';

function SearchContent() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') as TorrentCategory | null;
    const sortParam = searchParams.get('sort') as SortOption | null;

    const [selectedTorrent, setSelectedTorrent] = useState<Torrent | null>(null);
    const [category, setCategory] = useState<TorrentCategory | 'all'>(categoryParam || 'all');
    const [sortBy, setSortBy] = useState<SortOption>(sortParam || 'seeders');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showFilters, setShowFilters] = useState(false);

    // Generate search results
    const allTorrents = useMemo(() => {
        return [...mockTorrents, ...generateMoreTorrents(category, 30)];
    }, [category]);

    // Filter and sort torrents
    const filteredTorrents = useMemo(() => {
        let results = allTorrents;

        // Filter by search query
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(t =>
                t.name.toLowerCase().includes(lowerQuery)
            );
        }

        // Filter by category
        if (category !== 'all') {
            results = results.filter(t => t.category === category);
        }

        // Sort results
        switch (sortBy) {
            case 'seeders':
                results.sort((a, b) => b.seeders - a.seeders);
                break;
            case 'leechers':
                results.sort((a, b) => b.leechers - a.leechers);
                break;
            case 'size':
                results.sort((a, b) => b.size - a.size);
                break;
            case 'date':
                results.sort((a, b) =>
                    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
                );
                break;
            default:
                // relevance - keep original order for mock
                break;
        }

        return results;
    }, [allTorrents, query, category, sortBy]);

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'seeders', label: 'Most Seeders' },
        { value: 'date', label: 'Newest' },
        { value: 'size', label: 'Largest' },
        { value: 'leechers', label: 'Most Leechers' },
    ];

    return (
        <>
            <Header showSearch initialQuery={query} />

            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Search Header */}
                    <div className={styles.searchHeader}>
                        <div className={styles.resultInfo}>
                            {query ? (
                                <h1>
                                    Results for <span className={styles.query}>&quot;{query}&quot;</span>
                                </h1>
                            ) : category !== 'all' ? (
                                <h1>
                                    Browsing <span className={styles.query}>
                                        {categories.find(c => c.id === category)?.name}
                                    </span>
                                </h1>
                            ) : (
                                <h1>All Torrents</h1>
                            )}
                            <p className={styles.resultCount}>
                                {filteredTorrents.length.toLocaleString()} results found
                            </p>
                        </div>

                        <div className={styles.controls}>
                            <button
                                className={`${styles.controlBtn} ${showFilters ? styles.active : ''}`}
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <SlidersHorizontal size={18} />
                                <span>Filters</span>
                            </button>

                            <div className={styles.sortDropdown}>
                                <button className={styles.controlBtn}>
                                    <ArrowUpDown size={18} />
                                    <span>{sortOptions.find(s => s.value === sortBy)?.label}</span>
                                    <ChevronDown size={16} />
                                </button>
                                <div className={styles.dropdownMenu}>
                                    {sortOptions.map(option => (
                                        <button
                                            key={option.value}
                                            className={`${styles.dropdownItem} ${sortBy === option.value ? styles.active : ''}`}
                                            onClick={() => setSortBy(option.value)}
                                        >
                                            {option.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className={styles.viewToggle}>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
                                    onClick={() => setViewMode('list')}
                                    title="List view"
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
                                    onClick={() => setViewMode('grid')}
                                    title="Grid view"
                                >
                                    <Grid size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters Panel */}
                    {showFilters && (
                        <div className={styles.filtersPanel}>
                            <div className={styles.filterGroup}>
                                <label>Category</label>
                                <div className={styles.categoryFilters}>
                                    <button
                                        className={`${styles.categoryBtn} ${category === 'all' ? styles.active : ''}`}
                                        onClick={() => setCategory('all')}
                                    >
                                        All
                                    </button>
                                    {categories.map(cat => (
                                        <button
                                            key={cat.id}
                                            className={`${styles.categoryBtn} ${category === cat.id ? styles.active : ''}`}
                                            onClick={() => setCategory(cat.id)}
                                            style={{ '--cat-color': cat.color } as React.CSSProperties}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {(category !== 'all' || query) && (
                                <button
                                    className={styles.clearFilters}
                                    onClick={() => {
                                        setCategory('all');
                                    }}
                                >
                                    <X size={14} />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    )}

                    {/* Results */}
                    <div className={`${styles.results} ${styles[viewMode]}`}>
                        {filteredTorrents.length > 0 ? (
                            filteredTorrents.map(torrent => (
                                <TorrentCard
                                    key={torrent.id}
                                    torrent={torrent}
                                    onSelect={setSelectedTorrent}
                                />
                            ))
                        ) : (
                            <div className={styles.noResults}>
                                <h3>No torrents found</h3>
                                <p>Try adjusting your search or filters</p>
                            </div>
                        )}
                    </div>

                    {/* Load More */}
                    {filteredTorrents.length >= 20 && (
                        <div className={styles.loadMore}>
                            <button className={styles.loadMoreBtn}>
                                Load More Results
                            </button>
                        </div>
                    )}
                </div>
            </main>

            <Footer />

            {/* Modal */}
            {selectedTorrent && (
                <TorrentModal
                    torrent={selectedTorrent}
                    onClose={() => setSelectedTorrent(null)}
                />
            )}
        </>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className={styles.loading}>
                <Loader2 className={styles.spinner} size={32} />
                <span>Loading results...</span>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
