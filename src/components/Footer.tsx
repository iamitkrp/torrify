'use client';

import React from 'react';
import { Zap, Github, Heart, Shield } from 'lucide-react';
import { stats } from '@/lib/mockData';
import styles from './Footer.module.css';

export default function Footer() {
    const formatNumber = (num: number): string => {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
        return num.toString();
    };

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>
                <div className={styles.top}>
                    <div className={styles.brand}>
                        <div className={styles.logo}>
                            <Zap className={styles.logoIcon} />
                            <span className={styles.logoText}>Torrify</span>
                        </div>
                        <p className={styles.tagline}>
                            The next-generation decentralized torrent search engine.
                            Fast, private, and always accessible.
                        </p>
                    </div>

                    <div className={styles.stats}>
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

                <div className={styles.divider} />

                <div className={styles.bottom}>
                    <div className={styles.disclaimer}>
                        <Shield size={14} />
                        <span>
                            Torrify does not host any content. We are a search engine indexing
                            publicly available torrent files. Use responsibly.
                        </span>
                    </div>

                    <div className={styles.links}>
                        <a href="#" className={styles.link}>About</a>
                        <a href="#" className={styles.link}>API</a>
                        <a href="#" className={styles.link}>Privacy</a>
                        <a href="https://github.com" className={styles.link} target="_blank" rel="noopener">
                            <Github size={16} />
                        </a>
                    </div>
                </div>

                <div className={styles.copyright}>
                    <span>Made with</span>
                    <Heart size={14} className={styles.heart} />
                    <span>for the open web · {new Date().getFullYear()}</span>
                </div>
            </div>
        </footer>
    );
}
