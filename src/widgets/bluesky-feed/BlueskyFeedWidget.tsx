'use client';

import { useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CloudSun } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlueskyFeed } from '../../hooks/useBlueskyFeed';
import type { WidgetProps } from '../registry';
import type { BlueskyFeedWidgetConfig } from './BlueskyFeedWidget.types';
import { PostCard } from './PostCard';

export function BlueskyFeedWidget({ config }: WidgetProps<BlueskyFeedWidgetConfig>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const {
    data: posts = [],
    isLoading,
    error,
    dataUpdatedAt,
  } = useBlueskyFeed({
    query: config.query,
    maxResults: config.maxResults,
    pollIntervalMs: config.pollIntervalMs,
  });

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (config.showMedia ? 160 : 100),
    overscan: 5,
  });

  if (!config.query) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--color-muted)] p-4">
        <CloudSun className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center">
          No search query set.
          <br />
          Click the search icon to enter a query.
        </p>
      </div>
    );
  }

  if (isLoading && posts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--color-muted)] text-sm">
          <CloudSun className="w-4 h-4 animate-pulse" />
          <span>Loading posts...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center text-[var(--color-muted)] p-4">
        <p className="text-sm text-center">
          Failed to load posts.
          <br />
          {error.message}
        </p>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-[var(--color-muted)]">
          <CloudSun className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No posts found</p>
          <p className="text-xs mt-1">Try a different query</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="px-2 py-1.5 border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] flex-shrink-0">
        {posts.length} posts
        {dataUpdatedAt && (
          <span className="ml-1.5">
            · {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
          </span>
        )}
      </div>

      <div ref={parentRef} className="flex-1 overflow-auto min-h-0">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const post = posts[virtualItem.index];
            return (
              <div
                key={virtualItem.key}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualItem.size}px`,
                  transform: `translateY(${virtualItem.start}px)`,
                }}
              >
                <PostCard post={post} showMedia={config.showMedia} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
