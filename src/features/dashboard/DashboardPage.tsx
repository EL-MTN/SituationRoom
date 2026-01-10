'use client'

import { useState } from 'react';
import { Globe, Plus, Settings, Share2, Check } from 'lucide-react';
import { DashboardGrid } from '../../components/layout/DashboardGrid';
import { useDashboard } from '../../stores';
import { WidgetRegistry } from '../../widgets';
import { useShareableUrl } from '../../hooks';

export function DashboardPage() {
  const { activeDashboard, addWidget } = useDashboard();
  const { copyShareUrl } = useShareableUrl();
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [shareState, setShareState] = useState<'idle' | 'copied'>('idle');

  // Get all registered widget metadata for the picker
  const widgetTypes = WidgetRegistry.getAllMetadata();

  const handleShare = async () => {
    if (!activeDashboard) return;
    const success = await copyShareUrl(activeDashboard);
    if (success) {
      setShareState('copied');
      setTimeout(() => setShareState('idle'), 2000);
    }
  };

  // Should always have an active dashboard from initial state
  if (!activeDashboard) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-(--color-background)">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-(--color-border)">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-(--color-primary)" />
          <h1 className="text-lg font-semibold">{activeDashboard.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm border border-(--color-border) rounded-lg hover:bg-(--color-accent) transition-colors"
            title="Copy shareable link"
          >
            {shareState === 'copied' ? (
              <>
                <Check className="w-4 h-4 text-green-500" />
                Copied!
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4" />
                Share
              </>
            )}
          </button>
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-(--color-primary) text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
          <button className="p-2 rounded-lg hover:bg-(--color-accent) transition-colors">
            <Settings className="w-5 h-5 text-(--color-muted)" />
          </button>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 overflow-hidden min-h-0 p-1">
        <DashboardGrid dashboard={activeDashboard} />
      </main>

      {/* Add Widget Modal - Now uses registry dynamically */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-(--color-background) rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Add Widget</h2>
            <div className="space-y-3">
              {widgetTypes.map((widget) => {
                const Icon = widget.icon;
                return (
                  <button
                    key={widget.type}
                    onClick={() => {
                      addWidget(activeDashboard.id, widget.type);
                      setShowAddWidget(false);
                    }}
                    className="w-full flex items-center gap-3 p-4 border border-(--color-border) rounded-lg hover:bg-(--color-accent) transition-colors"
                  >
                    <Icon className="w-6 h-6 text-(--color-primary)" />
                    <div className="text-left">
                      <div className="font-medium">{widget.displayName}</div>
                      {widget.description && (
                        <div className="text-sm text-(--color-muted)">
                          {widget.description}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setShowAddWidget(false)}
              className="mt-4 w-full py-2 text-sm text-(--color-muted) hover:text-(--color-foreground)"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
