'use client';

import { useState } from 'react';
import { Rss } from 'lucide-react';
import type { WidgetHeaderExtensionProps } from '../registry';
import { FeedUrlPopover } from './components';
import type { RssFeedWidgetConfig } from './types';

export function RssFeedWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<RssFeedWidgetConfig>) {
  const [showFeedUrlPopover, setShowFeedUrlPopover] = useState(false);

  // Extract domain for display
  let displayUrl = '';
  if (config.feedUrl) {
    try {
      const url = new URL(config.feedUrl);
      displayUrl = url.hostname.replace(/^www\./, '');
    } catch {
      displayUrl = config.feedUrl;
    }
  }

  return (
    <>
      <button
        onClick={() => setShowFeedUrlPopover(!showFeedUrlPopover)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm transition-colors ${
          config.feedUrl
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Set feed URL"
      >
        <Rss className="w-4 h-4" />
        {config.feedUrl && (
          <span className="font-medium truncate max-w-[120px]">
            {displayUrl}
          </span>
        )}
      </button>

      <FeedUrlPopover
        isOpen={showFeedUrlPopover}
        onClose={() => setShowFeedUrlPopover(false)}
        config={config}
        onConfigChange={onConfigChange}
      />
    </>
  );
}
