'use client';

import { TorrentCardProps } from '@/types';
import { Download, Users, Upload, Calendar, ExternalLink, Shield } from 'lucide-react';
import { parseDate } from '@/lib/utils';

export default function TorrentCard({ torrent, onMagnetClick }: TorrentCardProps) {
  const handleMagnetClick = () => {
    if (torrent.magnetLink && onMagnetClick) {
      onMagnetClick(torrent.magnetLink);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = parseDate(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getCategoryColor = (category?: string) => {
    if (!category) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    
    const colors: Record<string, string> = {
      movies: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      tv: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      anime: 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300',
      music: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      games: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      software: 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300',
      books: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
    };
    
    return colors[category.toLowerCase()] || colors.movies;
  };

  const getSourceBadgeColor = (source: string) => {
    const colors: Record<string, string> = {
      'The Pirate Bay': 'bg-red-500',
      '1337x': 'bg-orange-500',
      'YTS': 'bg-green-500',
      'Nyaa': 'bg-blue-500',
    };
    
    return colors[source] || 'bg-slate-500';
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-slate-900 dark:text-white leading-5 line-clamp-2 mb-2">
            {torrent.title}
          </h3>
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Source Badge */}
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getSourceBadgeColor(torrent.source)}`}>
              {torrent.source}
            </span>
            
            {/* Category Badge */}
            {torrent.category && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(torrent.category)}`}>
                {torrent.category}
              </span>
            )}
            
            {/* Verified Badge */}
            {torrent.verified && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                <Shield className="w-3 h-3 mr-1" />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4 text-xs">
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Upload className="w-3 h-3 text-green-500" />
          <span className="font-medium text-green-600 dark:text-green-400">{torrent.seeds}</span>
          <span>seeds</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Download className="w-3 h-3 text-red-500" />
          <span className="font-medium text-red-600 dark:text-red-400">{torrent.leechers}</span>
          <span>leechers</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Users className="w-3 h-3" />
          <span>{torrent.size}</span>
        </div>
        
        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(torrent.uploadDate)}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Magnet Download Button */}
        {torrent.magnetLink ? (
          <button
            onClick={handleMagnetClick}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded-md transition-colors"
          >
            <Download className="w-4 h-4" />
            Magnet
          </button>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 bg-slate-300 dark:bg-slate-600 text-slate-500 dark:text-slate-400 text-sm font-medium py-2 px-3 rounded-md cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            No Magnet
          </button>
        )}

        {/* External Link */}
        {torrent.link && (
          <button
            onClick={() => window.open(torrent.link, '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-center w-9 h-9 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-md hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Quality indicator for video content */}
      {(torrent.category === 'movies' || torrent.category === 'tv' || torrent.category === 'anime') && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Quality:</span>
            <span className="font-medium">
              {torrent.title.match(/\b(480p|720p|1080p|2160p|4K)\b/i)?.[0] || 'Unknown'}
            </span>
          </div>
        </div>
      )}

      {/* Torrent health indicator */}
      <div className="mt-2">
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Health:</span>
          <span className={`font-medium ${
            torrent.seeds > 10 ? 'text-green-600 dark:text-green-400' :
            torrent.seeds > 0 ? 'text-yellow-600 dark:text-yellow-400' :
            'text-red-600 dark:text-red-400'
          }`}>
            {torrent.seeds > 10 ? 'Excellent' :
             torrent.seeds > 0 ? 'Good' : 'Poor'}
          </span>
        </div>
        
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1">
          <div 
            className={`h-1 rounded-full transition-all ${
              torrent.seeds > 10 ? 'bg-green-500' :
              torrent.seeds > 0 ? 'bg-yellow-500' :
              'bg-red-500'
            }`}
            style={{ 
              width: `${Math.min(100, Math.max(10, (torrent.seeds / 50) * 100))}%` 
            }}
          />
        </div>
      </div>
    </div>
  );
}