'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight, Sun, Moon } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [isDark, setIsDark] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const toggleTheme = () => {
    if (isAnimating) return;

    setIsAnimating(true);

    // Start the animation
    if (overlayRef.current) {
      overlayRef.current.classList.add(styles.expanding);
    }

    // Switch theme halfway through animation
    setTimeout(() => {
      setIsDark(!isDark);
    }, 400);

    // Remove overlay after animation completes
    setTimeout(() => {
      if (overlayRef.current) {
        overlayRef.current.classList.remove(styles.expanding);
      }
      setIsAnimating(false);
    }, 800);
  };

  return (
    <main className={`${styles.main} ${isDark ? styles.dark : styles.light}`}>
      {/* Theme transition overlay */}
      <div
        ref={overlayRef}
        className={`${styles.themeOverlay} ${isDark ? styles.overlayLight : styles.overlayDark}`}
      />

      {/* Theme Toggle */}
      <button
        className={styles.themeToggle}
        onClick={toggleTheme}
        aria-label="Toggle theme"
        disabled={isAnimating}
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
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
