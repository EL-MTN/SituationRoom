'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import type { WidgetHeaderExtensionProps } from '../registry';
import { SettingsPopover } from './components';
import type { RssFeedWidgetConfig } from './types';

export function RssFeedWidgetToolbar({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<RssFeedWidgetConfig>) {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setShowSettings(!showSettings)}
        className="p-1 hover:bg-(--color-accent) transition-colors"
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
