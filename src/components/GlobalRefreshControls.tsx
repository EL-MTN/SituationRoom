'use client'

import { RefreshCw, Play, Pause, Circle, Loader2, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { usePolling, type ConnectionStatus } from '@/stores';

function ConnectionStatusIndicator({ status }: { status: ConnectionStatus }) {
  const config: Record<ConnectionStatus, { color: string; Icon: typeof Circle; label: string }> = {
    idle: { color: 'text-(--color-muted)', Icon: Circle, label: 'No active widgets' },
    loading: { color: 'text-blue-500', Icon: Loader2, label: 'Loading...' },
    connected: { color: 'text-green-500', Icon: CheckCircle, label: 'All connected' },
    partial: { color: 'text-amber-500', Icon: AlertTriangle, label: 'Some errors' },
    error: { color: 'text-red-500', Icon: XCircle, label: 'Connection error' },
  };

  const { color, Icon, label } = config[status];

  return (
    <div className="flex items-center gap-1.5" title={label}>
      <Icon className={`w-4 h-4 ${color} ${status === 'loading' ? 'animate-spin' : ''}`} />
      <span className="text-xs text-(--color-muted) hidden sm:inline">{label}</span>
    </div>
  );
}

export function GlobalRefreshControls() {
  const { isPaused, isRefreshing, togglePause, refreshAll, connectionStatus } = usePolling();

  return (
    <div className="flex items-center gap-2">
      {/* Connection Status Indicator */}
      <ConnectionStatusIndicator status={connectionStatus} />

      {/* Divider */}
      <div className="w-px h-5 bg-(--color-border)" />

      {/* Refresh All Button */}
      <button
        onClick={refreshAll}
        disabled={isRefreshing}
        className="flex items-center gap-2 px-3 py-1.5 text-sm border border-(--color-border) rounded-lg hover:bg-(--color-accent) transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Refresh all widgets"
      >
        <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        <span className="hidden sm:inline">Refresh</span>
      </button>

      {/* Pause/Resume Toggle */}
      <button
        onClick={togglePause}
        className={`flex items-center gap-2 px-3 py-1.5 text-sm border rounded-lg transition-colors ${
          isPaused
            ? 'border-amber-500 bg-amber-500/10 text-amber-600 hover:bg-amber-500/20'
            : 'border-(--color-border) hover:bg-(--color-accent)'
        }`}
        title={isPaused ? 'Resume polling' : 'Pause polling'}
      >
        {isPaused ? (
          <>
            <Play className="w-4 h-4" />
            <span className="hidden sm:inline">Resume</span>
          </>
        ) : (
          <>
            <Pause className="w-4 h-4" />
            <span className="hidden sm:inline">Pause</span>
          </>
        )}
      </button>
    </div>
  );
}
