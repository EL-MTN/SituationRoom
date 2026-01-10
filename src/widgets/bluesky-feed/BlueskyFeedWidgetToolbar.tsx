'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsPopover } from './SettingsPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { BlueskyFeedWidgetConfig } from './BlueskyFeedWidget.types';

export function BlueskyFeedWidgetToolbar({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<BlueskyFeedWidgetConfig>) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-1 hover:bg-[var(--color-accent)] transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4 text-[var(--color-muted)]" />
      </button>
      <SettingsPopover
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        onConfigChange={onConfigChange}
      />
    </div>
  );
}
