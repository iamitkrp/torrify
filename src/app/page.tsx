'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, ArrowRight } from 'lucide-react';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <main className={styles.main}>
      {/* Background Glow */}
      <div className={styles.backgroundGlow} />

      <div className={styles.content}>
        {/* Logo as stylized text */}
        <h1 className={styles.logo}>torrify</h1>

        {/* Subtitle */}
        <p className={styles.subtitle}>
          Search the decentralized web
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
