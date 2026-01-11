'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sun, Moon } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isExpanding, setIsExpanding] = useState(false);
  const [overlayColor, setOverlayColor] = useState('#ffffff');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
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

  return (
    <main className={`${styles.main} ${isDark ? styles.dark : styles.light}`}>
      {/* Animated circle overlay */}
      <div
        className={`${styles.circleOverlay} ${isExpanding ? styles.expand : ''}`}
        style={{ backgroundColor: overlayColor }}
      />

      {/* Theme Toggle Button */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className={styles.content}>
        {/* Logo */}
        <div className={styles.logoWrapper}>
          <h1 className={styles.logo}>torrify</h1>
        </div>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          search the decentralized web
        </p>

        {/* Search Bar */}
        <form className={styles.searchWrapper} onSubmit={handleSearch}>
          <div className={styles.searchGlow} />
          <div className={styles.searchBar}>
            <div className={styles.searchIcon}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="What are you looking for?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={styles.searchInput}
              autoFocus
            />
            <button type="submit" className={styles.searchBtn}>
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
