'use client';

export default function LoadingSkeletons() {
  return (
    <div className="space-y-6">
      {/* Search Bar Skeleton */}
      <div className="w-full max-w-2xl mx-auto">
        <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
      </div>

      {/* Results Summary Skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
      </div>

      {/* Filter Panel Skeleton (for when filters are shown) */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-6">
        <div className="lg:col-span-1 hidden lg:block">
          <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-4">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                  <div className="h-4 flex-1 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid Skeleton */}
        <div className="lg:col-span-3">
          {/* Source Group Skeletons */}
          {[...Array(3)].map((_, sourceIndex) => (
            <div key={sourceIndex} className="mb-8">
              {/* Source Header Skeleton */}
              <div className="flex items-center justify-between mb-4">
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
                <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
              </div>

              {/* Cards Grid Skeleton */}
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {[...Array(6)].map((_, cardIndex) => (
                  <TorrentCardSkeleton key={cardIndex} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TorrentCardSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse">
      {/* Header */}
      <div className="mb-3">
        {/* Title */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-full" />
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
        </div>
        
        {/* Badges */}
        <div className="flex gap-2">
          <div className="h-6 w-16 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div className="h-6 w-12 bg-slate-200 dark:bg-slate-700 rounded-full" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="h-3 flex-1 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 mb-3">
        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-700 rounded" />
        <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>

      {/* Health Bar */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <div className="h-3 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
          <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
        </div>
        <div className="h-1 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Skeleton */}
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
          </div>
          
          <div className="h-14 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse" />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <LoadingSkeletons />
      </main>
    </div>
  );
}

export function CompactLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {[...Array(9)].map((_, i) => (
        <TorrentCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListLoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-4 animate-pulse"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4" />
              <div className="flex gap-4">
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
                <div className="h-3 w-16 bg-slate-200 dark:bg-slate-700 rounded" />
              </div>
            </div>
            <div className="w-24 h-9 bg-slate-200 dark:bg-slate-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}