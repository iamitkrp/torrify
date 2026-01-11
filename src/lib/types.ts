// Torrify - TypeScript Types

export interface Torrent {
  id: string;
  name: string;
  size: number; // bytes
  seeders: number;
  leechers: number;
  uploadDate: string;
  category: TorrentCategory;
  magnetLink: string;
  source: string;
  hash: string;
  uploader?: string;
  files?: TorrentFile[];
  description?: string;
}

export interface TorrentFile {
  name: string;
  size: number;
}

export type TorrentCategory = 
  | 'movies'
  | 'tv'
  | 'games'
  | 'software'
  | 'music'
  | 'anime'
  | 'books'
  | 'other';

export interface CategoryInfo {
  id: TorrentCategory;
  name: string;
  icon: string;
  color: string;
  count: number;
}

export interface SearchFilters {
  query: string;
  category: TorrentCategory | 'all';
  sortBy: SortOption;
  minSize?: number;
  maxSize?: number;
}

export type SortOption = 
  | 'relevance'
  | 'seeders'
  | 'leechers'
  | 'size'
  | 'date';

export interface SearchResult {
  torrents: Torrent[];
  totalResults: number;
  page: number;
  totalPages: number;
}

export interface Stats {
  totalTorrents: number;
  activeSeeders: number;
  sources: number;
}
