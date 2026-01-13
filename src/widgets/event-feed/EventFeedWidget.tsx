'use client'

import { useRef, useEffect } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { ExternalLink, Newspaper, Clock, Globe } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useGdeltEvents } from '../../hooks/useGdeltEvents';
import { useEvents, usePolling } from '../../stores';
import type { WidgetProps } from '../registry';
import type { EventFeedWidgetConfig } from './EventFeedWidget.types';
import type { NormalizedEvent } from '../../types';
import { WidgetError } from '../../components/WidgetError';

export function EventFeedWidget({ config }: WidgetProps<EventFeedWidgetConfig>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const { selectedEvent, selectEvent } = useEvents();
  const { isPaused, registerWidget, unregisterWidget } = usePolling();

  const { data: events = [], isLoading, error, refetch, dataUpdatedAt } = useGdeltEvents({
    filters: config.filters,
    timespan: config.filters.timespan,
    maxRecords: config.maxItems,
    pollIntervalMs: config.pollIntervalMs,
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
    count: events.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => (config.showImages ? 72 : 56),
    overscan: 5,
  });

  // Scroll to selected event when it changes from another widget
  useEffect(() => {
    if (
      selectedEvent.eventId &&
      selectedEvent.source !== 'event-feed'
    ) {
      const index = events.findIndex((e) => e.id === selectedEvent.eventId);
      if (index !== -1) {
        virtualizer.scrollToIndex(index, { align: 'center', behavior: 'smooth' });
      }
    }
  }, [selectedEvent, events, virtualizer]);

  // Handle event click
  const handleEventClick = (event: NormalizedEvent) => {
    selectEvent(event.id, 'event-feed');
  };

  // Highlight keywords in title
  const highlightText = (text: string): React.ReactNode => {
    if (!config.highlightKeywords.length) return text;

    const regex = new RegExp(
      `(${config.highlightKeywords.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
      'gi'
    );
    const parts = text.split(regex);

    return parts.map((part, i) =>
      config.highlightKeywords.some(
        (k) => k.toLowerCase() === part.toLowerCase()
      ) ? (
        <mark key={i} className="bg-[var(--color-highlight)] px-0.5">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  if (isLoading && events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex items-center gap-2 text-[var(--color-muted)] text-sm">
          <Newspaper className="w-4 h-4 animate-pulse" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error && events.length === 0) {
    return <WidgetError error={error} onRetry={() => refetch()} />;
  }

  if (events.length === 0) {
    return (
      <div className="h-full flex items-center justify-center p-4">
        <div className="text-center text-[var(--color-muted)]">
          <Newspaper className="w-6 h-6 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No events found</p>
          <p className="text-xs mt-1">Try adjusting filters</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Event count */}
      <div className="px-2 py-1.5 border-b border-[var(--color-border)] text-xs text-[var(--color-muted)] flex-shrink-0">
        {events.length} events
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
            const event = events[virtualItem.index];
            const isSelected = selectedEvent.eventId === event.id;

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
                <EventItem
                  event={event}
                  isSelected={isSelected}
                  showImage={config.showImages}
                  onClick={() => handleEventClick(event)}
                  highlightText={highlightText}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

interface EventItemProps {
  event: NormalizedEvent;
  isSelected: boolean;
  showImage: boolean;
  onClick: () => void;
  highlightText: (text: string) => React.ReactNode;
}

function EventItem({ event, isSelected, showImage, onClick, highlightText }: EventItemProps) {
  return (
    <div
      className={`h-full flex items-center gap-2 px-2 border-b border-[var(--color-border)] cursor-pointer transition-colors ${
        isSelected
          ? 'bg-[var(--color-primary)]/10 border-l-2 border-l-[var(--color-primary)]'
          : 'hover:bg-[var(--color-accent)]'
      }`}
      onClick={onClick}
    >
      {/* Image */}
      {showImage && event.imageUrl && (
        <img
          src={event.imageUrl}
          alt=""
          className="w-12 h-9 object-cover flex-shrink-0"
          onError={(e) => {
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      )}

      {/* Content */}
      <div className="flex-1 min-w-0 py-1.5">
        <h3 className="text-xs font-medium line-clamp-2 leading-tight">
          {highlightText(event.title)}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-[var(--color-muted)]">
          <span className="flex items-center gap-0.5">
            <Globe className="w-2.5 h-2.5 flex-shrink-0" />
            <span className="truncate">{event.sourceName}</span>
          </span>
          <span className="flex items-center gap-0.5 flex-shrink-0">
            <Clock className="w-2.5 h-2.5" />
            {formatDistanceToNow(event.publishedAt, { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* External link */}
      <a
        href={event.url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex-shrink-0 p-1.5 hover:bg-[var(--color-accent)] transition-colors"
        onClick={(e) => e.stopPropagation()}
        title="Open article"
      >
        <ExternalLink className="w-3.5 h-3.5 text-[var(--color-muted)]" />
      </a>
    </div>
  );
}
