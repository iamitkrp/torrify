// Core torrent data structure
export interface TorrentResult {
  title: string;
  magnetLink: string;
  seeds: number;
  leechers: number;
  size: string;
  uploadDate: string;
  source: string;
  link: string;
  category?: string;
  verified?: boolean;
}

// Scraper response interface
export interface ScraperResponse {
  source: string;
  results: TorrentResult[];
  success: boolean;
  error?: string;
  executionTime?: number;
}

// Search request parameters
export interface SearchParams {
  query: string;
  sources?: string[];
  category?: string;
  sortBy?: SortOption;
  limit?: number;
}

// Sort options for filtering
export type SortOption = 'seeds' | 'leechers' | 'size' | 'date' | 'title';

// Filter options
export interface FilterOptions {
  sources: string[];
  minSeeds: number;
  maxSize?: string;
  categories: string[];
  sortBy: SortOption;
  sortOrder: 'asc' | 'desc';
}

// API response structure
export interface SearchResponse {
  results: TorrentResult[];
  totalCount: number;
  sources: ScraperResponse[];
  query: string;
  cached: boolean;
  executionTime: number;
}

// Scraper configuration
export interface ScraperConfig {
  name: string;
  baseUrl: string;
  timeout: number;
  userAgent: string;
  enabled: boolean;
  usePlaywright?: boolean;
  rateLimit?: number;
}

// Base scraper interface
export interface BaseScraper {
  name: string;
  config: ScraperConfig;
  search(query: string, limit?: number): Promise<ScraperResponse>;
  isEnabled(): boolean;
}

// Error types
export interface ScrapingError extends Error {
  source: string;
  code: 'TIMEOUT' | 'NETWORK_ERROR' | 'PARSE_ERROR' | 'RATE_LIMITED' | 'UNKNOWN';
  details?: Record<string, unknown>;
}

// Cache entry structure
export interface CacheEntry {
  data: SearchResponse;
  timestamp: number;
  expiry: number;
}

// Component props types
export interface SearchBarProps {
  onSearch: (query: string) => void;
  loading?: boolean;
  placeholder?: string;
  defaultValue?: string;
}

export interface TorrentCardProps {
  torrent: TorrentResult;
  onMagnetClick?: (magnetLink: string) => void;
}

export interface FilterPanelProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  availableSources: string[];
}

// Loading states
export interface LoadingState {
  isLoading: boolean;
  loadingSources: string[];
  completedSources: string[];
  failedSources: string[];
}

// Torrent categories
export type TorrentCategory = 
  | 'all'
  | 'movies'
  | 'tv'
  | 'music'
  | 'games'
  | 'software'
  | 'anime'
  | 'books'
  | 'other';

// Size units for parsing
export type SizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB';

// Utility types
export interface ParsedSize {
  value: number;
  unit: SizeUnit;
  bytes: number;
}