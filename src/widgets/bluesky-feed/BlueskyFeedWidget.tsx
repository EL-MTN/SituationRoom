'use client';

import { useRef, useState, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { CloudSun } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useBlueskyFeed } from './hooks';
import { getCredentials } from './services';
import { usePolling } from '../../stores';
import type { WidgetProps } from '../registry';
import type { BlueskyFeedWidgetConfig } from './types';
import { PostCard, CredentialsForm } from './components';
import { WidgetError } from '../../components/WidgetError';

export function BlueskyFeedWidget({ config }: WidgetProps<BlueskyFeedWidgetConfig>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [hasCredentials, setHasCredentials] = useState<boolean | null>(null);
  const { isPaused, registerWidget, unregisterWidget } = usePolling();

  // Check for credentials on mount and when localStorage changes
  useEffect(() => {
    const checkCredentials = () => {
      setHasCredentials(!!getCredentials());
    };

    checkCredentials();

    // Listen for storage changes (in case credentials are updated in another tab)
    window.addEventListener('storage', checkCredentials);

    // Also poll occasionally in case credentials change in this tab
    const interval = setInterval(checkCredentials, 1000);

    return () => {
      window.removeEventListener('storage', checkCredentials);
      clearInterval(interval);
    };
  }, []);

  const {
    data: posts = [],
    isLoading,
    error,
    refetch,
    dataUpdatedAt,
  } = useBlueskyFeed({
    query: config.query,
    maxResults: config.maxResults,
    pollIntervalMs: config.pollIntervalMs,
    enabled: !isPaused && hasCredentials === true && !!config.query,
  });

  // Register widget status for global connection tracking
  useEffect(() => {
    registerWidget(config.id, {
      isLoading,
      hasError: !!error,
      errorMessage: error?.message,
      lastUpdated: dataUpdatedAt,
    });
    return () => unregisterWidget(config.id);
  }, [config.id, isLoading, error, dataUpdatedAt, registerWidget, unregisterWidget]);

  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (config.showMedia ? 160 : 100),
    overscan: 5,
  });

  // Still loading credential check
  if (hasCredentials === null) {
    return null;
  }

  // No credentials - show login form
  if (!hasCredentials) {
    return <CredentialsForm />;
  }

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

  if (error && posts.length === 0) {
    return <WidgetError error={error} onRetry={() => refetch()} />;
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
