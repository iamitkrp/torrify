'use client';

import React from 'react';
import Link from 'next/link';
import {
    Film, Tv, Gamepad2, Code, Music, Sparkles, BookOpen, Folder,
    LucideIcon
} from 'lucide-react';
import { CategoryInfo } from '@/lib/types';
import styles from './CategoryCard.module.css';

const iconMap: Record<string, LucideIcon> = {
    'film': Film,
    'tv': Tv,
    'gamepad-2': Gamepad2,
    'code': Code,
    'music': Music,
    'sparkles': Sparkles,
    'book-open': BookOpen,
    'folder': Folder,
};

interface CategoryCardProps {
    category: CategoryInfo;
    animated?: boolean;
    index?: number;
}

export default function CategoryCard({ category, animated = true, index = 0 }: CategoryCardProps) {
    const Icon = iconMap[category.icon] || Folder;

    const formatCount = (count: number): string => {
        if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
        if (count >= 1000) return `${(count / 1000).toFixed(0)}K`;
        return count.toString();
    };

    return (
        <Link
            href={`/search?category=${category.id}`}
            className={`${styles.card} ${animated ? styles.animated : ''}`}
            style={{
                '--accent-color': category.color,
                '--animation-delay': `${index * 0.1}s`
            } as React.CSSProperties}
        >
            <div className={styles.iconWrapper}>
                <Icon className={styles.icon} />
            </div>
            <div className={styles.info}>
                <h3 className={styles.name}>{category.name}</h3>
                <span className={styles.count}>{formatCount(category.count)} torrents</span>
            </div>
            <div className={styles.glow} />
        </Link>
    );
}
