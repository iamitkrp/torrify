'use client';

import React, { useEffect } from 'react';
import {
    X, Magnet, Copy, Check, ArrowUp, ArrowDown,
    HardDrive, Calendar, User, FileText, Download
} from 'lucide-react';
import { Torrent } from '@/lib/types';
import { formatBytes, formatDate, copyToClipboard, getHealthIndicator, getHealthColor } from '@/lib/utils';
import styles from './TorrentModal.module.css';

interface TorrentModalProps {
    torrent: Torrent;
    onClose: () => void;
}

export default function TorrentModal({ torrent, onClose }: TorrentModalProps) {
    const [copied, setCopied] = React.useState(false);
    const health = getHealthIndicator(torrent.seeders, torrent.leechers);
    const healthColor = getHealthColor(health);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [onClose]);

    const handleCopy = async () => {
        const success = await copyToClipboard(torrent.magnetLink);
        if (success) {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleOverlayClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) onClose();
    };

    return (
        <div className={styles.overlay} onClick={handleOverlayClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <div className={styles.healthBadge} style={{ backgroundColor: healthColor }}>
                        {health.toUpperCase()}
                    </div>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={20} />
                    </button>
                </div>

                <div className={styles.content}>
                    <h2 className={styles.title}>{torrent.name}</h2>

                    <div className={styles.stats}>
                        <div className={styles.stat}>
                            <HardDrive size={18} />
                            <div>
                                <span className={styles.statLabel}>Size</span>
                                <span className={styles.statValue}>{formatBytes(torrent.size)}</span>
                            </div>
                        </div>
                        <div className={styles.stat}>
                            <Calendar size={18} />
                            <div>
                                <span className={styles.statLabel}>Uploaded</span>
                                <span className={styles.statValue}>{formatDate(torrent.uploadDate)}</span>
                            </div>
                        </div>
                        <div className={`${styles.stat} ${styles.seeders}`}>
                            <ArrowUp size={18} />
                            <div>
                                <span className={styles.statLabel}>Seeders</span>
                                <span className={styles.statValue}>{torrent.seeders.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className={`${styles.stat} ${styles.leechers}`}>
                            <ArrowDown size={18} />
                            <div>
                                <span className={styles.statLabel}>Leechers</span>
                                <span className={styles.statValue}>{torrent.leechers.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    <div className={styles.infoGrid}>
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Source</span>
                            <span className={styles.infoValue}>{torrent.source}</span>
                        </div>
                        {torrent.uploader && (
                            <div className={styles.infoItem}>
                                <span className={styles.infoLabel}>Uploader</span>
                                <span className={styles.infoValue}>
                                    <User size={14} /> {torrent.uploader}
                                </span>
                            </div>
                        )}
                        <div className={styles.infoItem}>
                            <span className={styles.infoLabel}>Hash</span>
                            <span className={`${styles.infoValue} ${styles.hash}`}>{torrent.hash}</span>
                        </div>
                    </div>

                    {torrent.description && (
                        <div className={styles.description}>
                            <h4><FileText size={16} /> Description</h4>
                            <p>{torrent.description}</p>
                        </div>
                    )}

                    {torrent.files && torrent.files.length > 0 && (
                        <div className={styles.files}>
                            <h4><Download size={16} /> Files ({torrent.files.length})</h4>
                            <ul>
                                {torrent.files.slice(0, 10).map((file, i) => (
                                    <li key={i}>
                                        <span className={styles.fileName}>{file.name}</span>
                                        <span className={styles.fileSize}>{formatBytes(file.size)}</span>
                                    </li>
                                ))}
                                {torrent.files.length > 10 && (
                                    <li className={styles.moreFiles}>
                                        +{torrent.files.length - 10} more files
                                    </li>
                                )}
                            </ul>
                        </div>
                    )}
                </div>

                <div className={styles.footer}>
                    <button className={styles.copyBtn} onClick={handleCopy}>
                        {copied ? <Check size={18} /> : <Copy size={18} />}
                        {copied ? 'Copied!' : 'Copy Magnet'}
                    </button>
                    <a href={torrent.magnetLink} className={styles.magnetBtn}>
                        <Magnet size={18} />
                        Download via Magnet
                    </a>
                </div>
            </div>
        </div>
    );
}
