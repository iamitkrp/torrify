'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Search, SlidersHorizontal, ArrowUpDown, Grid, List,
    ChevronDown, Loader2, ArrowUp, ArrowDown,
    HardDrive, Calendar, Magnet, Copy, Check, Sun, Moon
} from 'lucide-react';
import { searchTorrents } from '@/lib/piratebay';
import { Torrent, TorrentCategory, SortOption } from '@/lib/types';
import { formatBytes, formatDate, getHealthIndicator, getHealthColor, copyToClipboard } from '@/lib/utils';
import { stats } from '@/lib/mockData';
import styles from './page.module.css';

// Minimal Torrent Card component
function TorrentCard({ torrent }: { torrent: Torrent }) {
    const [copied, setCopied] = useState(false);
    const health = getHealthIndicator(torrent.seeders, torrent.leechers);
    const healthColor = getHealthColor(health);

    const handleCopy = async (e: React.MouseEvent) => {
        e.stopPropagation();
        const success = await copyToClipboard(torrent.magnetLink);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleMagnet = (e: React.MouseEvent) => {
        e.stopPropagation();
        window.location.href = torrent.magnetLink;
    };

    return (
        <div className={styles.torrentCard}>
            <div className={styles.healthIndicator} style={{ backgroundColor: healthColor }} />
            <div className={styles.torrentContent}>
                <div className={styles.torrentHeader}>
                    <h3 className={styles.torrentTitle}>{torrent.name}</h3>
                    <span className={styles.sourceBadge}>{torrent.source}</span>
                </div>
                <div className={styles.torrentMeta}>
                    <span className={styles.metaItem}>
                        <HardDrive size={14} />
                        {formatBytes(torrent.size)}
                    </span>
                    <span className={styles.metaItem}>
                        <Calendar size={14} />
                        {formatDate(torrent.uploadDate)}
                    </span>
                    <span className={`${styles.metaItem} ${styles.seeders}`}>
                        <ArrowUp size={14} />
                        {torrent.seeders.toLocaleString()}
                    </span>
                    <span className={`${styles.metaItem} ${styles.leechers}`}>
                        <ArrowDown size={14} />
                        {torrent.leechers.toLocaleString()}
                    </span>
                </div>
            </div>
            <div className={styles.torrentActions}>
                <button
                    className={`${styles.actionBtn} ${styles.magnetBtn}`}
                    onClick={handleMagnet}
                    title="Open magnet link"
                >
                    <Magnet size={18} />
                </button>
                <button
                    className={`${styles.actionBtn} ${styles.copyBtn}`}
                    onClick={handleCopy}
                    title="Copy magnet link"
                >
                    {copied ? <Check size={18} /> : <Copy size={18} />}
                </button>
            </div>
        </div>
    );
}

// Minimal Footer
function MinimalFooter() {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.footerContent}>
                <div className={styles.footerBrand}>
                    <span className={styles.footerLogoText}>torrify</span>
                    <p className={styles.footerTagline}>
                        The next-generation decentralized torrent search engine.
                    </p>
                </div>
                <div className={styles.footerStats}>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{formatNumber(stats.totalTorrents)}</span>
                        <span className={styles.statLabel}>Indexed Torrents</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{formatNumber(stats.activeSeeders)}</span>
                        <span className={styles.statLabel}>Active Seeders</span>
                    </div>
                    <div className={styles.statItem}>
                        <span className={styles.statValue}>{stats.sources}</span>
                        <span className={styles.statLabel}>Sources</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function SearchContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const query = searchParams.get('q') || '';
    const categoryParam = searchParams.get('category') as TorrentCategory | null;

    const [searchQuery, setSearchQuery] = useState(query);
    const [torrents, setTorrents] = useState<Torrent[]>([]);
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState<TorrentCategory | 'all'>(categoryParam || 'all');
    const [sortBy, setSortBy] = useState<SortOption>('seeders');
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [showFilters, setShowFilters] = useState(false);
    const [isDark, setIsDark] = useState(true);
    const [isExpanding, setIsExpanding] = useState(false);
    const [overlayColor, setOverlayColor] = useState('#ffffff');

    const categories = [
        { id: 'movies', name: 'Movies' },
        { id: 'tv', name: 'TV' },
        { id: 'games', name: 'Games' },
        { id: 'software', name: 'Software' },
    ];

    const sortOptions: { value: SortOption; label: string }[] = [
        { value: 'seeders', label: 'Most Seeders' },
        { value: 'date', label: 'Newest' },
        { value: 'size', label: 'Largest' },
        { value: 'leechers', label: 'Most Leechers' },
    ];

    const fetchTorrents = useCallback(async (q: string, cat: TorrentCategory | 'all') => {
        if (!q.trim()) return;

        setLoading(true);
        try {
            const results = await searchTorrents(q, cat);
            setTorrents(results);
        } catch (error) {
            console.error('Search error:', error);
            setTorrents([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (query) {
            fetchTorrents(query, category);
        }
    }, [query, category, fetchTorrents]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        }
    };

    const toggleTheme = () => {
        if (isExpanding) return;

        // Set overlay to the NEW theme color
        setOverlayColor(isDark ? '#ffffff' : '#000000');

        // Start expanding
        setIsExpanding(true);

        // Switch theme when circle covers screen
        setTimeout(() => {
            setIsDark(prev => !prev);
        }, 600);

        // Stop animation after full duration
        setTimeout(() => {
            setIsExpanding(false);
        }, 1800);
    };

    // Sort torrents
    const sortedTorrents = [...torrents].sort((a, b) => {
        switch (sortBy) {
            case 'seeders':
                return b.seeders - a.seeders;
            case 'leechers':
                return b.leechers - a.leechers;
            case 'size':
                return b.size - a.size;
            case 'date':
                return new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime();
            default:
                return 0;
        }
    });

    // Filter by category
    const filteredTorrents = category === 'all'
        ? sortedTorrents
        : sortedTorrents.filter(t => t.category === category);

    return (
        <div className={`${styles.page} ${isDark ? styles.dark : styles.light}`}>
            {/* Animated circle overlay */}
            <div
                className={`${styles.circleOverlay} ${isExpanding ? styles.expand : ''}`}
                style={{ backgroundColor: overlayColor }}
            />

            {/* Minimal Header */}
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <Link href="/" className={styles.logo}>
                        <span className={styles.logoText}>torrify</span>
                    </Link>

                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <div className={styles.searchWrapper}>
                            <Search className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search torrents..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <button type="submit" className={styles.searchButton}>
                            Search
                        </button>
                    </form>

                    <button
                        className={styles.themeToggle}
                        onClick={toggleTheme}
                        aria-label="Toggle theme"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.container}>
                    {/* Results Header */}
                    <div className={styles.resultsHeader}>
                        <div className={styles.resultInfo}>
                            <h1>
                                Results for <span className={styles.queryText}>&quot;{query}&quot;</span>
                            </h1>
                            <p className={styles.resultCount}>
                                {loading ? 'Searching...' : `${filteredTorrents.length} results found`}
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
                                            onClick={() => setCategory(cat.id as TorrentCategory)}
                                        >
                                            {cat.name}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results */}
                    {loading ? (
                        <div className={styles.loadingState}>
                            <Loader2 className={styles.spinner} size={32} />
                            <span>Searching torrents...</span>
                        </div>
                    ) : filteredTorrents.length > 0 ? (
                        <div className={`${styles.results} ${styles[viewMode]}`}>
                            {filteredTorrents.map(torrent => (
                                <TorrentCard key={torrent.id} torrent={torrent} />
                            ))}
                        </div>
                    ) : (
                        <div className={styles.noResults}>
                            <h3>No torrents found</h3>
                            <p>Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </main>

            {/* Minimal Footer */}
            <MinimalFooter />
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={
            <div className={styles.loadingState}>
                <Loader2 className={styles.spinner} size={32} />
                <span>Loading...</span>
            </div>
        }>
            <SearchContent />
        </Suspense>
    );
}
