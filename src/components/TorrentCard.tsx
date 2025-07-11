'use client';

import { useState } from 'react';
import { TorrentCardProps } from '@/types';
import { Download, Users, Upload, Calendar, ExternalLink, Shield, Copy, Check } from 'lucide-react';
import { parseDate } from '@/lib/utils';

export default function TorrentCard({ torrent, onMagnetClick }: TorrentCardProps) {
  const [copied, setCopied] = useState(false);

  const handleMagnetClick = () => {
    if (torrent.magnetLink && onMagnetClick) {
      onMagnetClick(torrent.magnetLink);
    }
  };

  const handleCopyClick = async () => {
    if (torrent.magnetLink) {
      try {
        await navigator.clipboard.writeText(torrent.magnetLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy magnet link:', err);
        try {
          const textArea = document.createElement('textarea');
          textArea.value = torrent.magnetLink;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } catch (fallbackErr) {
          console.error('Fallback copy also failed:', fallbackErr);
        }
      }
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
    if (!category) return { bg: 'var(--surface-subtle)', text: 'var(--text-secondary)' };
    
    const colors: Record<string, { bg: string; text: string }> = {
      movies: { bg: '#fef2f2', text: '#dc2626' },
      tv: { bg: '#eff6ff', text: '#2563eb' },
      anime: { bg: '#fdf4ff', text: '#c026d3' },
      music: { bg: '#f3e8ff', text: '#9333ea' },
      games: { bg: '#f0fdf4', text: '#16a34a' },
      software: { bg: '#fff7ed', text: '#ea580c' },
      books: { bg: '#fefce8', text: '#ca8a04' },
    };
    
    return colors[category.toLowerCase()] || colors.movies;
  };

  const getSourceColor = (source: string) => {
    const colors: Record<string, string> = {
      'The Pirate Bay': '#e74c3c',
      '1337x': '#f39c12',
      'YTS': '#27ae60',
      'Nyaa': '#3498db',
    };
    
    return colors[source] || '#6b7280';
  };

  const getHealthInfo = (seeds: number) => {
    if (seeds > 10) return { label: 'Excellent', color: 'var(--success)', width: 100 };
    if (seeds > 5) return { label: 'Good', color: '#10b981', width: 75 };
    if (seeds > 0) return { label: 'Fair', color: 'var(--warning)', width: 50 };
    return { label: 'Poor', color: 'var(--error)', width: 25 };
  };

  const quality = torrent.title.match(/\b(480p|720p|1080p|2160p|4K)\b/i)?.[0] || null;
  const categoryColors = getCategoryColor(torrent.category);
  const sourceColor = getSourceColor(torrent.source);
  const healthInfo = getHealthInfo(torrent.seeds);

  return (
    <div 
      className="group rounded-xl border transition-all duration-200 hover:shadow-lg p-5"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="font-heading text-base font-medium leading-snug mb-3 line-clamp-2" style={{ color: 'var(--text-primary)' }}>
          {torrent.title}
        </h3>
        
        <div className="flex items-center gap-2 flex-wrap">
          {/* Source Badge */}
          <span 
            className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium text-white"
            style={{ backgroundColor: sourceColor }}
          >
            {torrent.source}
          </span>
          
          {/* Category Badge */}
          {torrent.category && (
            <span 
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: categoryColors.bg, 
                color: categoryColors.text 
              }}
            >
              {torrent.category}
            </span>
          )}
          
          {/* Quality Badge */}
          {quality && (
            <span 
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: 'var(--accent-subtle)', 
                color: 'var(--accent)' 
              }}
            >
              {quality}
            </span>
          )}
          
          {/* Verified Badge */}
          {torrent.verified && (
            <span 
              className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
              style={{ 
                backgroundColor: '#f0fdf4', 
                color: '#16a34a' 
              }}
            >
              <Shield className="w-3 h-3 mr-1" />
              Verified
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span className="text-sm font-suisse" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--success)' }}>{torrent.seeds}</span> seeds
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4" style={{ color: 'var(--error)' }} />
            <span className="text-sm font-suisse" style={{ color: 'var(--text-secondary)' }}>
              <span className="font-medium" style={{ color: 'var(--error)' }}>{torrent.leechers}</span> leechers
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} />
            <span className="text-sm font-medium font-suisse" style={{ color: 'var(--text-primary)' }}>
              {torrent.size}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" style={{ color: 'var(--text-subtle)' }} />
            <span className="text-sm font-suisse" style={{ color: 'var(--text-secondary)' }}>
              {formatDate(torrent.uploadDate)}
            </span>
          </div>
        </div>
      </div>

      {/* Health Indicator */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-medium font-suisse" style={{ color: 'var(--text-secondary)' }}>Health</span>
          <span className="font-medium font-suisse" style={{ color: healthInfo.color }}>
            {healthInfo.label}
          </span>
        </div>
        <div 
          className="w-full h-1.5 rounded-full"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        >
          <div 
            className="h-1.5 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: healthInfo.color,
              width: `${healthInfo.width}%` 
            }}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        {/* Magnet Download Button */}
        {torrent.magnetLink ? (
          <button
            onClick={handleMagnetClick}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-md"
            style={{
              backgroundColor: 'var(--accent)',
              color: 'white'
            }}
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        ) : (
          <button
            disabled
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-not-allowed"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              color: 'var(--text-subtle)'
            }}
          >
            <Download className="w-4 h-4" />
            No Magnet
          </button>
        )}

        {/* Copy Button */}
        {torrent.magnetLink ? (
          <button
            onClick={handleCopyClick}
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 border"
            style={{
              backgroundColor: copied ? 'var(--success)' : 'var(--surface)',
              borderColor: copied ? 'var(--success)' : 'var(--border)',
              color: copied ? 'white' : 'var(--text-primary)'
            }}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                Copy
              </>
            )}
          </button>
        ) : (
          <button
            disabled
            className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm cursor-not-allowed border"
            style={{
              backgroundColor: 'var(--surface-subtle)',
              borderColor: 'var(--border)',
              color: 'var(--text-subtle)'
            }}
          >
            <Copy className="w-4 h-4" />
            Copy
          </button>
        )}

        {/* External Link */}
        {torrent.link && (
          <button
            onClick={() => window.open(torrent.link, '_blank', 'noopener,noreferrer')}
            className="flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200 hover:shadow-sm"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)'
            }}
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}