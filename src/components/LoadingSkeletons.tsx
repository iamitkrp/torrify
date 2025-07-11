'use client';

export default function LoadingSkeletons() {
  return (
    <div className="space-y-8">
      {/* Search Bar Skeleton */}
      <div className="w-full max-w-3xl mx-auto">
        <div 
          className="h-16 rounded-2xl animate-pulse"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
      </div>

      {/* Results Summary Skeleton */}
      <div className="flex items-center justify-between">
        <div 
          className="h-4 w-48 rounded animate-pulse"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
        <div 
          className="h-9 w-24 rounded-xl animate-pulse"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
      </div>

      {/* Filter Panel Skeleton (for when filters are shown) */}
      <div className="lg:grid lg:grid-cols-4 lg:gap-8">
        <div className="lg:col-span-1 hidden lg:block">
          <div 
            className="rounded-xl border p-5 space-y-4"
            style={{
              backgroundColor: 'var(--surface)',
              borderColor: 'var(--border)'
            }}
          >
            <div 
              className="h-5 rounded animate-pulse"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}
                  />
                  <div 
                    className="h-4 flex-1 rounded animate-pulse"
                    style={{ backgroundColor: 'var(--surface-subtle)' }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Grid Skeleton */}
        <div className="lg:col-span-3">
          {/* Source Group Skeletons */}
          {[...Array(2)].map((_, sourceIndex) => (
            <div key={sourceIndex} className="mb-10">
              {/* Source Header Skeleton */}
              <div className="flex items-center justify-between mb-6">
                <div 
                  className="h-6 w-32 rounded animate-pulse"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                />
                <div 
                  className="h-5 w-20 rounded-full animate-pulse"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                />
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
    <div 
      className="rounded-xl border p-5 animate-pulse"
      style={{
        backgroundColor: 'var(--surface)',
        borderColor: 'var(--border)'
      }}
    >
      {/* Header */}
      <div className="mb-4">
        {/* Title */}
        <div className="space-y-2 mb-3">
          <div 
            className="h-4 rounded w-full"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
          <div 
            className="h-4 rounded w-3/4"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
        </div>
        
        {/* Badges */}
        <div className="flex gap-2">
          <div 
            className="h-6 w-16 rounded-full"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
          <div 
            className="h-6 w-14 rounded-full"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
          <div 
            className="h-6 w-12 rounded-full"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              />
              <div 
                className="h-3 flex-1 rounded"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              />
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div 
                className="w-4 h-4 rounded"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              />
              <div 
                className="h-3 flex-1 rounded"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <div 
            className="h-3 w-12 rounded"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
          <div 
            className="h-3 w-16 rounded"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
        </div>
        <div 
          className="h-1.5 rounded-full"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <div 
          className="flex-1 h-10 rounded-xl"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
        <div 
          className="h-10 w-20 rounded-xl"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
        <div 
          className="w-10 h-10 rounded-xl"
          style={{ backgroundColor: 'var(--surface-subtle)' }}
        />
      </div>
    </div>
  );
}

export function SearchResultsSkeleton() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header Skeleton */}
      <header 
        className="sticky top-0 z-50 border-b"
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)'
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="w-8 h-8 rounded-xl animate-pulse"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            />
            <div 
              className="h-5 w-20 rounded animate-pulse"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            />
          </div>
          
          <div 
            className="h-16 rounded-2xl animate-pulse"
            style={{ backgroundColor: 'var(--surface-subtle)' }}
          />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="max-w-6xl mx-auto px-6 py-8">
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
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="rounded-xl border p-4 animate-pulse"
          style={{
            backgroundColor: 'var(--surface)',
            borderColor: 'var(--border)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 space-y-3">
              <div 
                className="h-4 rounded w-3/4"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              />
              <div className="flex gap-4">
                <div 
                  className="h-3 w-16 rounded"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                />
                <div 
                  className="h-3 w-16 rounded"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                />
                <div 
                  className="h-3 w-16 rounded"
                  style={{ backgroundColor: 'var(--surface-subtle)' }}
                />
              </div>
            </div>
            <div 
              className="w-24 h-10 rounded-xl"
              style={{ backgroundColor: 'var(--surface-subtle)' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}