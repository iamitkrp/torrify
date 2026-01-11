// Torrify - Utility Functions

export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
}

export function truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + '...';
}

export function generateMagnetLink(hash: string, name: string): string {
    const encodedName = encodeURIComponent(name);
    const trackers = [
        'udp://tracker.opentrackr.org:1337/announce',
        'udp://open.stealth.si:80/announce',
        'udp://tracker.torrent.eu.org:451/announce',
        'udp://tracker.bittor.pw:1337/announce',
        'udp://public.popcorn-tracker.org:6969/announce',
        'udp://tracker.dler.org:6969/announce',
        'udp://exodus.desync.com:6969/announce',
        'udp://open.demonii.com:1337/announce'
    ];

    const trackerParams = trackers.map(t => `&tr=${encodeURIComponent(t)}`).join('');

    return `magnet:?xt=urn:btih:${hash}&dn=${encodedName}${trackerParams}`;
}

export function copyToClipboard(text: string): Promise<boolean> {
    return navigator.clipboard.writeText(text)
        .then(() => true)
        .catch(() => false);
}

export function getHealthIndicator(seeders: number, leechers: number): 'excellent' | 'good' | 'fair' | 'poor' {
    const ratio = seeders / (leechers || 1);

    if (seeders >= 100 && ratio >= 2) return 'excellent';
    if (seeders >= 20 && ratio >= 1) return 'good';
    if (seeders >= 5) return 'fair';
    return 'poor';
}

export function getHealthColor(health: 'excellent' | 'good' | 'fair' | 'poor'): string {
    switch (health) {
        case 'excellent': return '#22c55e';
        case 'good': return '#84cc16';
        case 'fair': return '#f59e0b';
        case 'poor': return '#ef4444';
    }
}
