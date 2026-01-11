'use client';

import React from 'react';
import {
    ArrowUp, ArrowDown, Calendar, HardDrive, Magnet,
    ExternalLink, Copy, Check
} from 'lucide-react';
import { Torrent } from '@/lib/types';
import { formatBytes, formatDate, getHealthIndicator, getHealthColor, copyToClipboard } from '@/lib/utils';
import styles from './TorrentCard.module.css';

interface TorrentCardProps {
    torrent: Torrent;
    onSelect?: (torrent: Torrent) => void;
}

export default function TorrentCard({ torrent, onSelect }: TorrentCardProps) {
    const [copied, setCopied] = React.useState(false);
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
        <div
            className={styles.card}
            onClick={() => onSelect?.(torrent)}
            role="button"
            tabIndex={0}
        >
            <div className={styles.healthIndicator} style={{ backgroundColor: healthColor }} />

            <div className={styles.content}>
                <div className={styles.header}>
                    <h3 className={styles.title}>{torrent.name}</h3>
                    <span className={styles.source}>{torrent.source}</span>
                </div>

                <div className={styles.meta}>
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

            <div className={styles.actions}>
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
                <button
                    className={`${styles.actionBtn} ${styles.detailsBtn}`}
                    onClick={(e) => { e.stopPropagation(); onSelect?.(torrent); }}
                    title="View details"
                >
                    <ExternalLink size={18} />
                </button>
            </div>
        </div>
    );
}
