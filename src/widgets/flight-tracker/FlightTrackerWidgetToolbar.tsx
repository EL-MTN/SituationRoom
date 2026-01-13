'use client';

import { useState } from 'react';
import { Settings } from 'lucide-react';
import { SettingsPopover } from './components';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { FlightTrackerWidgetConfig } from './types';

export function FlightTrackerWidgetToolbar({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<FlightTrackerWidgetConfig>) {
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
