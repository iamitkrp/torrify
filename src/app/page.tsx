'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, ArrowRight, Code, Menu, X } from 'lucide-react';
import styles from './page.module.css';

// Category chips
const categories = ['Movies', 'Music', 'Software', 'Games', 'Books'];

// Trending items
const trendingItems = [
  'Ubuntu 24.04',
  'Kali Linux 2024.1',
  'Blender 4.2 LTS',
  'Arch Linux ISO',
  'GIMP 3.0 RC'
];

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleCategoryClick = (category: string) => {
    router.push(`/search?category=${category.toLowerCase()}`);
  };

  return (
    <>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          {/* Brand */}
          <Link href="/" className={styles.brand}>
            <div className={styles.brandIcon}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M8 12h8M12 8v8" />
              </svg>
            </div>
            <span className={styles.brandText}>Torrify</span>
          </Link>

          {/* Desktop Nav */}
          <nav className={styles.nav}>
            <Link href="/search" className={styles.navLink}>Discover</Link>
            <Link href="/search?sort=seeders" className={styles.navLink}>Top 100</Link>
            <Link href="#" className={styles.navLink}>Upload</Link>
          </nav>

          {/* GitHub Button */}
          <a
            href="https://github.com/iamitkrp/torrify"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubBtn}
          >
            <Code size={18} />
            <span>GitHub</span>
          </a>

          {/* Mobile Menu Toggle */}
          <button
            className={styles.menuBtn}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <nav className={styles.mobileNav}>
            <Link href="/search" className={styles.mobileNavLink}>Discover</Link>
            <Link href="/search?sort=seeders" className={styles.mobileNavLink}>Top 100</Link>
            <Link href="#" className={styles.mobileNavLink}>Upload</Link>
          </nav>
        )}
      </header>

      {/* Main Content */}
      <main className={styles.main}>
        {/* Background Glow */}
        <div className={styles.backgroundGlow} />

        <div className={styles.content}>
          {/* Hero Text */}
          <div className={styles.hero}>
            <h1 className={styles.title}>
              Search the<br />
              <span className={styles.titleHighlight}>Decentralized Web.</span>
            </h1>
            <p className={styles.subtitle}>
              Privacy-focused. DHT-powered. Verified integrity. The next generation
              of peer-to-peer discovery.
            </p>
          </div>

          {/* Search Component */}
          <form className={styles.searchWrapper} onSubmit={handleSearch}>
            <div className={styles.searchGlow} />
            <div className={styles.searchBar}>
              <div className={styles.searchIcon}>
                <Search size={24} />
              </div>
              <input
                type="text"
                placeholder="What are you looking for?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className={styles.searchInput}
              />
              <button type="submit" className={styles.searchBtn}>
                <ArrowRight size={24} />
              </button>
            </div>
          </form>

          {/* Category Chips */}
          <div className={styles.categories}>
            {categories.map((category) => (
              <button
                key={category}
                className={styles.chip}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Trending Ticker */}
          <div className={styles.trending}>
            <div className={styles.trendingFadeLeft} />
            <div className={styles.trendingFadeRight} />
            <div className={styles.trendingContent}>
              <span className={styles.trendingLabel}>Trending Now</span>
              <span className={styles.trendingDot} />
              {trendingItems.map((item, index) => (
                <React.Fragment key={item}>
                  <Link
                    href={`/search?q=${encodeURIComponent(item)}`}
                    className={styles.trendingItem}
                  >
                    {item}
                  </Link>
                  {index < trendingItems.length - 1 && (
                    <span className={styles.trendingSeparator}>•</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLinks}>
            <span>© 2024 Torrify.</span>
            <span className={styles.footerDivider}>|</span>
            <Link href="#" className={styles.footerLink}>Privacy Policy</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="#" className={styles.footerLink}>DMCA</Link>
            <span className={styles.footerSeparator}>•</span>
            <Link href="#" className={styles.footerLink}>Terms</Link>
          </div>

          <div className={styles.statusBadge}>
            <div className={styles.statusDot}>
              <span className={styles.statusPing} />
              <span className={styles.statusCore} />
            </div>
            <span className={styles.statusText}>System Operational</span>
          </div>
        </div>
      </footer>
    </>
  );
}
