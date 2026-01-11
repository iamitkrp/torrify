'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, X, Zap } from 'lucide-react';
import styles from './Header.module.css';

interface HeaderProps {
    showSearch?: boolean;
    initialQuery?: string;
}

export default function Header({ showSearch = true, initialQuery = '' }: HeaderProps) {
    const router = useRouter();
    const [query, setQuery] = useState(initialQuery);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (query.trim()) {
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <header className={styles.header}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    <Zap className={styles.logoIcon} />
                    <span className={styles.logoText}>Torrify</span>
                </Link>

                {showSearch && (
                    <form className={styles.searchForm} onSubmit={handleSearch}>
                        <div className={styles.searchWrapper}>
                            <Search className={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search torrents..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className={styles.searchInput}
                            />
                        </div>
                        <button type="submit" className={styles.searchButton}>
                            Search
                        </button>
                    </form>
                )}

                <nav className={`${styles.nav} ${mobileMenuOpen ? styles.navOpen : ''}`}>
                    <Link href="/search?category=movies" className={styles.navLink}>Movies</Link>
                    <Link href="/search?category=tv" className={styles.navLink}>TV</Link>
                    <Link href="/search?category=games" className={styles.navLink}>Games</Link>
                    <Link href="/search?category=software" className={styles.navLink}>Software</Link>
                </nav>

                <button
                    className={styles.menuButton}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    aria-label="Toggle menu"
                >
                    {mobileMenuOpen ? <X /> : <Menu />}
                </button>
            </div>
        </header>
    );
}
