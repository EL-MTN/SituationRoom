'use client';

import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ExternalLink, Rss, Clock, Globe, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { usePolling } from '../../stores';
import type { WidgetProps } from '../registry';
import { useRssFeed } from './hooks';
import type { RssFeedWidgetConfig, FeedItem } from './types';
import { WidgetError } from '../../components/WidgetError';

export function RssFeedWidget({ config }: WidgetProps<RssFeedWidgetConfig>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { isPaused, registerWidget, unregisterWidget } = usePolling();

  const { data: items = [], isLoading, error, refetch, dataUpdatedAt } = useRssFeed({
    feedUrl: config.feedUrl,
    pollIntervalMs: config.pollIntervalMs,
    maxItems: config.maxItems,
    enabled: !isPaused,
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

  // Setup virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 72,
    overscan: 5,
  });

  // No feed URL configured
  if (!config.feedUrl) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-[var(--color-muted)]">
          <LinkIcon className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No feed configured</p>
          <p className="text-xs mt-1">Click the gear icon to add a feed URL</p>
        </div>
      </div>
    );
  }

  if (isLoading && items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--color-muted)] text-sm">
          <Rss className="w-4 h-4 animate-pulse" />
          <span>Loading feed...</span>
        </div>
      </div>
    );
  }

  if (error && items.length === 0) {
    return <WidgetError error={error} onRetry={() => refetch()} />;
  }

  if (items.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-[var(--color-muted)]">
          <Rss className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No items in feed</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Item count and last updated */}
      <div className="px-2 py-1.5 border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] flex-shrink-0">
        {items.length} items
        {dataUpdatedAt && (
          <span className="ml-1.5">
            · {formatDistanceToNow(dataUpdatedAt, { addSuffix: true })}
          </span>
        )}
      </div>

      {/* Virtualized list */}
      <div ref={parentRef} className="flex-1 overflow-auto min-h-0">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {virtualizer.getVirtualItems().map((virtualItem) => {
            const item = items[virtualItem.index];

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
                <FeedItemRow item={item} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface FeedItemRowProps {
  item: FeedItem;
}

function FeedItemRow({ item }: FeedItemRowProps) {
  return (
    <a
      href={item.link}
      target="_blank"
      rel="noopener noreferrer"
      className="h-full flex items-center gap-2 px-2 border-b border-[var(--color-border)] cursor-pointer transition-colors hover:bg-[var(--color-accent)]"
    >
      {/* Image */}
      {item.imageUrl && (
        <img
          src={item.imageUrl}
          alt=""
          className="w-12 h-9 object-cover flex-shrink-0 rounded"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 py-1.5">
        <h3 className="text-xs font-medium line-clamp-2 leading-tight">
          {item.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-muted)]">
          {item.sourceName && (
            <span className="flex items-center gap-0.5">
              <Globe className="w-2.5 h-2.5 flex-shrink-0" />
              <span className="truncate">{item.sourceName}</span>
            </span>
          )}
          {item.pubDate && (
            <span className="flex items-center gap-0.5 flex-shrink-0">
              <Clock className="w-2.5 h-2.5" />
              {formatDistanceToNow(item.pubDate, { addSuffix: true })}
            </span>
          )}
        </div>
      </div>

      {/* External link indicator */}
      <div className="flex-shrink-0 p-1.5">
        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted)]" />
      </div>
    </a>
  );
}
