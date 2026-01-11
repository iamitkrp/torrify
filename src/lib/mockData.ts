// Torrify - Mock Data

import { Torrent, CategoryInfo, Stats, TorrentCategory } from './types';
import { generateMagnetLink } from './utils';

// Helper to generate random hash
const generateHash = () => {
    return Array.from({ length: 40 }, () =>
        Math.floor(Math.random() * 16).toString(16)
    ).join('');
};

// Helper to generate random date within last 6 months
const randomDate = () => {
    const now = Date.now();
    const sixMonthsAgo = now - (180 * 24 * 60 * 60 * 1000);
    const randomTime = Math.random() * (now - sixMonthsAgo) + sixMonthsAgo;
    return new Date(randomTime).toISOString();
};

// Mock torrent data
const mockTorrentData = [
    {
        id: '1',
        name: 'Dune.Part.Two.2024.2160p.UHD.BluRay.x265.HDR.DTS-HD.MA.7.1-RARBG',
        size: 42095542272, // 39.2 GB
        seeders: 2847,
        leechers: 423,
        uploadDate: '2024-12-28T14:30:00Z',
        category: 'movies' as TorrentCategory,
        hash: generateHash(),
        source: 'RARBG',
        uploader: 'SceneRelease',
        magnetLink: '',
        description: 'Dune: Part Two follows Paul Atreides as he unites with the Fremen to lead a rebellion against House Harkonnen.',
        files: [
            { name: 'Dune.Part.Two.2024.2160p.mkv', size: 42000000000 },
            { name: 'Subtitles/', size: 95542272 }
        ]
    },
    {
        id: '2',
        name: 'The.Last.of.Us.S02.Complete.1080p.WEB-DL.DDP5.1.H.264-NTb',
        size: 32212254720, // 30 GB
        seeders: 4521,
        leechers: 892,
        uploadDate: '2024-12-30T09:15:00Z',
        category: 'tv' as TorrentCategory,
        hash: generateHash(),
        source: 'NTb',
        uploader: 'WebRips',
        magnetLink: '',
        files: [
            { name: 'S02E01.mkv', size: 4000000000 },
            { name: 'S02E02.mkv', size: 4000000000 },
            { name: 'S02E03.mkv', size: 4000000000 },
            { name: 'S02E04.mkv', size: 4000000000 },
            { name: 'S02E05.mkv', size: 4000000000 },
            { name: 'S02E06.mkv', size: 4000000000 },
            { name: 'S02E07.mkv', size: 4000000000 },
            { name: 'S02E08.mkv', size: 4212254720 }
        ]
    },
    {
        id: '3',
        name: 'Cyberpunk.2077.Ultimate.Edition.v2.12.Repack-FitGirl',
        size: 53687091200, // 50 GB
        seeders: 1892,
        leechers: 567,
        uploadDate: '2024-12-15T20:45:00Z',
        category: 'games' as TorrentCategory,
        hash: generateHash(),
        source: 'FitGirl',
        uploader: 'FitGirl',
        magnetLink: '',
        description: 'Cyberpunk 2077 is an open-world RPG set in Night City. Includes all DLCs and Phantom Liberty expansion.'
    },
    {
        id: '4',
        name: 'Adobe.Creative.Cloud.2024.Complete.Collection.Multilingual',
        size: 26843545600, // 25 GB
        seeders: 3421,
        leechers: 1234,
        uploadDate: '2024-12-20T16:00:00Z',
        category: 'software' as TorrentCategory,
        hash: generateHash(),
        source: 'm0nkrus',
        uploader: 'SoftArchive',
        magnetLink: ''
    },
    {
        id: '5',
        name: 'Taylor.Swift.The.Eras.Tour.2023.Blu-Ray.FLAC.24bit.96kHz',
        size: 8589934592, // 8 GB
        seeders: 892,
        leechers: 234,
        uploadDate: '2024-12-25T12:00:00Z',
        category: 'music' as TorrentCategory,
        hash: generateHash(),
        source: 'MusiQ',
        uploader: 'AudioPhile',
        magnetLink: ''
    },
    {
        id: '6',
        name: 'Attack.on.Titan.Complete.Series.1080p.Dual.Audio.BluRay.x265',
        size: 75161927680, // 70 GB
        seeders: 2156,
        leechers: 456,
        uploadDate: '2024-12-10T08:30:00Z',
        category: 'anime' as TorrentCategory,
        hash: generateHash(),
        source: 'Judas',
        uploader: 'AnimeWorld',
        magnetLink: ''
    },
    {
        id: '7',
        name: 'O.Reilly.Complete.Programming.Collection.2024.EPUB',
        size: 5368709120, // 5 GB
        seeders: 567,
        leechers: 89,
        uploadDate: '2024-12-18T14:20:00Z',
        category: 'books' as TorrentCategory,
        hash: generateHash(),
        source: 'LibGen',
        uploader: 'BookWorm',
        magnetLink: ''
    },
    {
        id: '8',
        name: 'Oppenheimer.2023.IMAX.2160p.UHD.BluRay.x265.HDR.TrueHD.7.1',
        size: 48318382080, // 45 GB
        seeders: 3892,
        leechers: 521,
        uploadDate: '2024-11-28T10:00:00Z',
        category: 'movies' as TorrentCategory,
        hash: generateHash(),
        source: 'RARBG',
        uploader: 'SceneRelease',
        magnetLink: ''
    },
    {
        id: '9',
        name: 'Breaking.Bad.Complete.Series.2160p.UHD.BluRay.Remux',
        size: 429496729600, // 400 GB
        seeders: 1234,
        leechers: 345,
        uploadDate: '2024-11-15T18:45:00Z',
        category: 'tv' as TorrentCategory,
        hash: generateHash(),
        source: 'FGT',
        uploader: 'QualityEncode',
        magnetLink: ''
    },
    {
        id: '10',
        name: 'GTA.VI.Pre.Release.Build.RELOADED',
        size: 107374182400, // 100 GB
        seeders: 8921,
        leechers: 4567,
        uploadDate: '2024-12-31T00:00:00Z',
        category: 'games' as TorrentCategory,
        hash: generateHash(),
        source: 'RELOADED',
        uploader: 'SceneGames',
        magnetLink: ''
    },
    {
        id: '11',
        name: 'Windows.11.Pro.24H2.Build.26100.Official.ISO',
        size: 6442450944, // 6 GB
        seeders: 4521,
        leechers: 892,
        uploadDate: '2024-12-22T20:30:00Z',
        category: 'software' as TorrentCategory,
        hash: generateHash(),
        source: 'MSDN',
        uploader: 'TechUpload',
        magnetLink: ''
    },
    {
        id: '12',
        name: 'Kendrick.Lamar.Discography.FLAC.320kbps.Complete',
        size: 12884901888, // 12 GB
        seeders: 1567,
        leechers: 234,
        uploadDate: '2024-12-19T16:15:00Z',
        category: 'music' as TorrentCategory,
        hash: generateHash(),
        source: 'Deezloader',
        uploader: 'HipHopHead',
        magnetLink: ''
    },
    {
        id: '13',
        name: 'Demon.Slayer.Infinity.Castle.Arc.2024.1080p.WEB-DL.AAC',
        size: 4294967296, // 4 GB
        seeders: 3421,
        leechers: 567,
        uploadDate: '2024-12-29T14:00:00Z',
        category: 'anime' as TorrentCategory,
        hash: generateHash(),
        source: 'SubsPlease',
        uploader: 'AnimeHaven',
        magnetLink: ''
    },
    {
        id: '14',
        name: 'Project.Hail.Mary.Andy.Weir.Audiobook.Unabridged.M4B',
        size: 1073741824, // 1 GB
        seeders: 892,
        leechers: 123,
        uploadDate: '2024-12-24T11:30:00Z',
        category: 'books' as TorrentCategory,
        hash: generateHash(),
        source: 'Audible',
        uploader: 'AudioBooks',
        magnetLink: ''
    },
    {
        id: '15',
        name: 'The.Batman.2022.2160p.UHD.BluRay.x265.HDR.DTS-X.7.1',
        size: 53687091200, // 50 GB
        seeders: 2156,
        leechers: 345,
        uploadDate: '2024-11-20T09:00:00Z',
        category: 'movies' as TorrentCategory,
        hash: generateHash(),
        source: 'FGT',
        uploader: 'HDEncode',
        magnetLink: ''
    }
].map(t => ({
    ...t,
    magnetLink: generateMagnetLink(t.hash, t.name)
}));

export const mockTorrents: Torrent[] = mockTorrentData;

// Generate more torrents for search results
export const generateMoreTorrents = (category: TorrentCategory | 'all', count: number = 20): Torrent[] => {
    const templates = {
        movies: [
            'Inception.2010.2160p.UHD.BluRay.x265',
            'The.Matrix.Resurrections.2021.1080p.BluRay',
            'Spider.Man.No.Way.Home.2021.2160p.WEB-DL',
            'Avatar.The.Way.of.Water.2022.IMAX.2160p',
            'Interstellar.2014.IMAX.2160p.UHD.Remux'
        ],
        tv: [
            'House.of.the.Dragon.S02.Complete.1080p',
            'Stranger.Things.S05.2160p.NF.WEB-DL',
            'The.Mandalorian.S03.Complete.2160p.DSNP',
            'Wednesday.S01.Complete.1080p.NF',
            'Severance.S02.Complete.2160p.ATVP'
        ],
        games: [
            'Elden.Ring.Shadow.of.the.Erdtree.v1.12-FitGirl',
            'Baldurs.Gate.3.Deluxe.Edition.v4.1-GOG',
            'Starfield.Shattered.Space.v1.14-CODEX',
            'Red.Dead.Redemption.II.Ultimate.v1491-EMPRESS',
            'Hogwarts.Legacy.Deluxe.v1052-P2P'
        ],
        software: [
            'Microsoft.Office.2024.Pro.Plus.VL.x64',
            'Autodesk.AutoCAD.2025.x64.Multilingual',
            'VMware.Workstation.Pro.17.5.x64',
            'JetBrains.IntelliJ.IDEA.Ultimate.2024',
            'DaVinci.Resolve.Studio.19.1.Patched'
        ],
        music: [
            'The.Weeknd.Discography.FLAC.Lossless',
            'Daft.Punk.Complete.Collection.320kbps',
            'Billie.Eilish.Hit.Me.Hard.and.Soft.24bit',
            'Pink.Floyd.The.Dark.Side.Remastered.FLAC',
            'Hans.Zimmer.Filmography.OST.Collection'
        ],
        anime: [
            'One.Piece.Complete.Series.1080p.Dual',
            'Jujutsu.Kaisen.S02.Complete.1080p',
            'Chainsaw.Man.S01.Complete.BluRay',
            'Spy.x.Family.Complete.1080p.WEB-DL',
            'Frieren.Beyond.Journeys.End.Complete'
        ],
        books: [
            'Brandon.Sanderson.Complete.Collection.EPUB',
            'Stephen.King.IT.Audiobook.Unabridged',
            'The.Witcher.Complete.Saga.EPUB.MOBI',
            'Atomic.Habits.James.Clear.PDF.EPUB',
            'Harry.Potter.Complete.Series.Illustrated'
        ],
        other: [
            'Linux.ISO.Collection.2024.Complete',
            'Coursera.Data.Science.Specialization',
            'Unity.Game.Development.Masterclass',
            'Stock.Footage.4K.Nature.Collection',
            'Udemy.Web.Development.Bootcamp.2024'
        ]
    };

    const sources = ['RARBG', 'FitGirl', 'YTS', 'ETTV', '1337x', 'TorrentGalaxy', 'Nyaa', 'RuTracker'];
    const uploaders = ['SceneRelease', 'HDEncode', 'WebRips', 'AudioPhile', 'TechUpload', 'Anonymous'];

    const categories: TorrentCategory[] = category === 'all'
        ? ['movies', 'tv', 'games', 'software', 'music', 'anime', 'books', 'other']
        : [category];

    return Array.from({ length: count }, (_, i) => {
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const templateList = templates[cat];
        const name = templateList[Math.floor(Math.random() * templateList.length)];
        const hash = generateHash();

        return {
            id: `gen-${Date.now()}-${i}`,
            name: `${name}.${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
            size: Math.floor(Math.random() * 100 * 1024 * 1024 * 1024), // 0-100 GB
            seeders: Math.floor(Math.random() * 5000) + 1,
            leechers: Math.floor(Math.random() * 1000),
            uploadDate: randomDate(),
            category: cat,
            hash,
            source: sources[Math.floor(Math.random() * sources.length)],
            uploader: uploaders[Math.floor(Math.random() * uploaders.length)],
            magnetLink: generateMagnetLink(hash, name)
        };
    });
};

// Category information
export const categories: CategoryInfo[] = [
    { id: 'movies', name: 'Movies', icon: 'film', color: '#ef4444', count: 1250000 },
    { id: 'tv', name: 'TV Shows', icon: 'tv', color: '#f59e0b', count: 890000 },
    { id: 'games', name: 'Games', icon: 'gamepad-2', color: '#22c55e', count: 450000 },
    { id: 'software', name: 'Software', icon: 'code', color: '#3b82f6', count: 320000 },
    { id: 'music', name: 'Music', icon: 'music', color: '#8b5cf6', count: 780000 },
    { id: 'anime', name: 'Anime', icon: 'sparkles', color: '#ec4899', count: 210000 },
    { id: 'books', name: 'Books', icon: 'book-open', color: '#14b8a6', count: 560000 },
    { id: 'other', name: 'Other', icon: 'folder', color: '#6b7280', count: 340000 }
];

// Platform stats
export const stats: Stats = {
    totalTorrents: 4800000,
    activeSeeders: 12500000,
    sources: 47
};
