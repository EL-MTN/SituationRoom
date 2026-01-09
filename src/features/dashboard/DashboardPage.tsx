import { useState } from 'react';
import { Globe, Plus, Settings, List } from 'lucide-react';
import { DashboardGrid } from '../../components/layout/DashboardGrid';
import { useDashboard } from '../../stores';

export function DashboardPage() {
  const { activeDashboard, addWidget } = useDashboard();
  const [showAddWidget, setShowAddWidget] = useState(false);

  // Should always have an active dashboard from initial state
  if (!activeDashboard) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-[var(--color-background)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-border)]">
        <div className="flex items-center gap-3">
          <Globe className="w-6 h-6 text-[var(--color-primary)]" />
          <h1 className="text-lg font-semibold">{activeDashboard.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddWidget(true)}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white rounded-lg hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Add Widget
          </button>
          <button className="p-2 rounded-lg hover:bg-[var(--color-accent)] transition-colors">
            <Settings className="w-5 h-5 text-[var(--color-muted)]" />
          </button>
        </div>
      </header>

      {/* Dashboard Grid */}
      <main className="flex-1 overflow-hidden min-h-0 p-1">
        <DashboardGrid dashboard={activeDashboard} />
      </main>

      {/* Add Widget Modal */}
      {showAddWidget && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-background)] rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-lg font-semibold mb-4">Add Widget</h2>
            <div className="space-y-3">
              <button
                onClick={() => {
                  addWidget(activeDashboard.id, 'map');
                  setShowAddWidget(false);
                }}
                className="w-full flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-accent)] transition-colors"
              >
                <Globe className="w-6 h-6 text-[var(--color-primary)]" />
                <div className="text-left">
                  <div className="font-medium">Map</div>
                  <div className="text-sm text-[var(--color-muted)]">
                    Interactive map with event markers
                  </div>
                </div>
              </button>
              <button
                onClick={() => {
                  addWidget(activeDashboard.id, 'event-feed');
                  setShowAddWidget(false);
                }}
                className="w-full flex items-center gap-3 p-4 border border-[var(--color-border)] rounded-lg hover:bg-[var(--color-accent)] transition-colors"
              >
                <List className="w-6 h-6 text-[var(--color-primary)]" />
                <div className="text-left">
                  <div className="font-medium">Event Feed</div>
                  <div className="text-sm text-[var(--color-muted)]">
                    Chronological list of events
                  </div>
                </div>
              </button>
            </div>
            <button
              onClick={() => setShowAddWidget(false)}
              className="mt-4 w-full py-2 text-sm text-[var(--color-muted)] hover:text-[var(--color-foreground)]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
