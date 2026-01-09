'use client'

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsPopover } from './SettingsPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { EventFeedWidgetConfig } from './EventFeedWidget.types';

export function EventFeedWidgetToolbar({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<EventFeedWidgetConfig>) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-1 rounded hover:bg-(--color-accent) transition-colors"
        title="Settings"
      >
        <Settings className="w-4 h-4 text-(--color-muted)" />
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
