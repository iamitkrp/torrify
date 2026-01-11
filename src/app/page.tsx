'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Zap, ArrowRight, TrendingUp } from 'lucide-react';
import SearchBar from '@/components/SearchBar';
import CategoryCard from '@/components/CategoryCard';
import TorrentCard from '@/components/TorrentCard';
import TorrentModal from '@/components/TorrentModal';
import Footer from '@/components/Footer';
import { categories, mockTorrents, stats } from '@/lib/mockData';
import { Torrent } from '@/lib/types';
import styles from './page.module.css';

export default function Home() {
  const [selectedTorrent, setSelectedTorrent] = useState<Torrent | null>(null);

  const trendingTorrents = mockTorrents
    .sort((a, b) => b.seeders - a.seeders)
    .slice(0, 5);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M+`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K+`;
    return num.toString();
  };

  return (
    <>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <Zap size={14} />
            <span>Decentralized & Private</span>
          </div>

          <h1 className={styles.title}>
            Search Torrents<br />
            <span className={styles.highlight}>Across The Globe</span>
          </h1>

          <p className={styles.subtitle}>
            The next-generation torrent search engine. Access millions of torrents
            from {stats.sources}+ sources with lightning-fast results and zero tracking.
          </p>

          <div className={styles.searchWrapper}>
            <SearchBar large />
          </div>

          <div className={styles.stats}>
            <div className={styles.stat}>
              <div className={styles.statValue}>{formatNumber(stats.totalTorrents)}</div>
              <div className={styles.statLabel}>Torrents Indexed</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{formatNumber(stats.activeSeeders)}</div>
              <div className={styles.statLabel}>Active Seeders</div>
            </div>
            <div className={styles.stat}>
              <div className={styles.statValue}>{stats.sources}+</div>
              <div className={styles.statLabel}>Sources</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className={styles.categories}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Browse by Category</h2>
          <p className={styles.sectionSubtitle}>
            Find exactly what you&apos;re looking for
          </p>
        </div>

        <div className={styles.categoryGrid}>
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              index={index}
            />
          ))}
        </div>
      </section>

      {/* Trending Section */}
      <section className={styles.trending}>
        <div className={styles.trendingHeader}>
          <div>
            <h2 className={styles.sectionTitle}>
              <TrendingUp size={28} style={{ display: 'inline', marginRight: '12px', color: 'var(--accent-primary)' }} />
              Trending Now
            </h2>
            <p className={styles.sectionSubtitle}>Most popular torrents right now</p>
          </div>
          <Link href="/search?sort=seeders" className={styles.viewAll}>
            View All <ArrowRight size={16} />
          </Link>
        </div>

        <div className={styles.trendingList}>
          {trendingTorrents.map((torrent) => (
            <TorrentCard
              key={torrent.id}
              torrent={torrent}
              onSelect={setSelectedTorrent}
            />
          ))}
        </div>
      </section>

      {/* Footer */}
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
