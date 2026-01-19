'use client';

import { useState, useCallback, useMemo } from 'react';
import { Plus, MapPin as MapPinIcon, Share2, Pause, Play, RefreshCw } from 'lucide-react';
import type L from 'leaflet';
import { useMapDashboard } from '@/stores/MapDashboardContext';
import { usePolling } from '@/stores/PollingContext';
import { BackgroundMap } from './BackgroundMapDynamic';
import { PinMarkers } from './PinMarkers';
import { PinEditPopover } from './PinEditPopover';
import { WidgetLinkingDialog } from './WidgetLinkingDialog';
import { FloatingWidgetContainer } from './FloatingWidgetContainer';
import { AddWidgetMenu } from './AddWidgetMenu';
import type { MapState } from './BackgroundMap';
import type { MapPin, LinkedWidgetConfig } from '@/types/pin.types';

type Mode = 'normal' | 'add-pin';

// Safe window access for SSR
function getDefaultPopoverPosition() {
  if (typeof window === 'undefined') return { x: 200, y: 100 };
  return { x: Math.max(200, window.innerWidth / 2 - 130), y: 100 };
}

export function MapDashboard() {
  const {
    state,
    setMapState,
    addPin,
    updatePin,
    deletePin,
    linkWidgetToPin,
    updateLinkedWidget,
    unlinkWidgetFromPin,
    openPinWidgets,
    addFloatingWidget,
    removeFloatingWidget,
    updateWidgetPosition,
    updateWidgetConfig,
    bringToFront,
    restoreWidget,
  } = useMapDashboard();

  const { isPaused, togglePause, refreshAll, connectionStatus } = usePolling();

  const [mode, setMode] = useState<Mode>('normal');
  const [newPinCoordinates, setNewPinCoordinates] = useState<[number, number] | null>(null);
  const [showAddWidgetMenu, setShowAddWidgetMenu] = useState(false);
  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [editPopoverPosition, setEditPopoverPosition] = useState({ x: 0, y: 0 });
  const [linkingPin, setLinkingPin] = useState<MapPin | null>(null);

  // Calculate default position only on client
  const defaultPopoverPosition = useMemo(() => getDefaultPopoverPosition(), []);

  // Handle map click
  const handleMapClick = useCallback(
    (coordinates: [number, number]) => {
      if (mode === 'add-pin') {
        setNewPinCoordinates(coordinates);
        setMode('normal');
      }
    },
    [mode]
  );

  // Handle map state change
  const handleMapStateChange = useCallback(
    (newState: MapState) => {
      setMapState(newState);
    },
    [setMapState]
  );

  // Handle pin click - open linked widgets
  const handlePinClick = useCallback(
    (pin: MapPin) => {
      if (pin.linkedWidgetConfigs.length > 0) {
        openPinWidgets(pin.id);
      } else {
        // If no linked widgets, show edit popover to encourage linking
        setEditingPin(pin);
        setEditPopoverPosition(getDefaultPopoverPosition());
      }
    },
    [openPinWidgets]
  );

  // Handle pin context menu - show edit popover
  const handlePinContextMenu = useCallback((pin: MapPin, e: L.LeafletMouseEvent) => {
    setEditingPin(pin);
    setEditPopoverPosition({
      x: e.originalEvent.clientX,
      y: e.originalEvent.clientY,
    });
  }, []);

  // Handle creating new pin
  const handleCreatePin = useCallback(
    (data: { label: string; color: string }) => {
      if (newPinCoordinates) {
        addPin(newPinCoordinates, data.label, data.color);
        setNewPinCoordinates(null);
      }
    },
    [newPinCoordinates, addPin]
  );

  // Handle saving pin edits
  const handleSavePin = useCallback(
    (data: { label: string; color: string }) => {
      if (editingPin) {
        updatePin(editingPin.id, data);
        setEditingPin(null);
      }
    },
    [editingPin, updatePin]
  );

  // Handle deleting pin
  const handleDeletePin = useCallback(() => {
    if (editingPin) {
      deletePin(editingPin.id);
      setEditingPin(null);
    }
  }, [editingPin, deletePin]);

  // Handle opening widget linking dialog
  const handleOpenLinkingDialog = useCallback(() => {
    if (editingPin) {
      setLinkingPin(editingPin);
      setEditingPin(null);
    }
  }, [editingPin]);

  // Handle linking widget to pin
  const handleLinkWidget = useCallback(
    (linkedConfig: LinkedWidgetConfig) => {
      if (linkingPin) {
        linkWidgetToPin(linkingPin.id, linkedConfig);
      }
    },
    [linkingPin, linkWidgetToPin]
  );

  // Handle updating linked widget settings
  const handleUpdateLinkedWidget = useCallback(
    (widgetType: string, updates: Partial<LinkedWidgetConfig>) => {
      if (linkingPin) {
        updateLinkedWidget(linkingPin.id, widgetType, updates);
      }
    },
    [linkingPin, updateLinkedWidget]
  );

  // Handle unlinking widget from pin
  const handleUnlinkWidget = useCallback(
    (widgetType: string) => {
      if (linkingPin) {
        unlinkWidgetFromPin(linkingPin.id, widgetType);
      }
    },
    [linkingPin, unlinkWidgetFromPin]
  );

  // Handle add widget
  const handleAddWidget = useCallback(
    (type: string) => {
      addFloatingWidget(type);
      setShowAddWidgetMenu(false);
    },
    [addFloatingWidget]
  );

  // Get status indicator color
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'loading':
        return 'bg-yellow-500 animate-pulse';
      case 'partial':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div className="h-screen w-screen relative overflow-hidden">
      {/* Background Map */}
      <BackgroundMap
        mapState={state.mapState}
        onMapStateChange={handleMapStateChange}
        onMapClick={handleMapClick}
      >
        {/* Only pin markers inside the map */}
        <PinMarkers
          onPinClick={handlePinClick}
          onPinContextMenu={handlePinContextMenu}
        />
      </BackgroundMap>

      {/* Floating Widgets Layer */}
      <FloatingWidgetContainer
        widgets={state.floatingWidgets}
        onPositionChange={updateWidgetPosition}
        onConfigChange={updateWidgetConfig}
        onRemove={removeFloatingWidget}
        onFocus={bringToFront}
        onRestore={restoreWidget}
      />

      {/* Top toolbar */}
      <div className="absolute top-4 left-4 z-30 flex items-center gap-2">
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg px-4 py-2 flex items-center gap-3">
          <h1 className="font-semibold text-lg">Situation Room</h1>
          <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} title={connectionStatus} />
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
        {/* Polling controls */}
        <div className="bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg flex">
          <button
            onClick={togglePause}
            className="p-2 hover:bg-[var(--color-accent)] transition-colors"
            title={isPaused ? 'Resume updates' : 'Pause updates'}
          >
            {isPaused ? (
              <Play className="w-4 h-4 text-[var(--color-muted)]" />
            ) : (
              <Pause className="w-4 h-4 text-[var(--color-muted)]" />
            )}
          </button>
          <button
            onClick={() => refreshAll()}
            className="p-2 hover:bg-[var(--color-accent)] transition-colors border-l border-[var(--color-border)]"
            title="Refresh all"
          >
            <RefreshCw className="w-4 h-4 text-[var(--color-muted)]" />
          </button>
        </div>

        {/* Add Pin button */}
        <button
          onClick={() => setMode(mode === 'add-pin' ? 'normal' : 'add-pin')}
          className={`p-2 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg hover:bg-[var(--color-accent)] transition-colors ${
            mode === 'add-pin' ? 'ring-2 ring-[var(--color-primary)]' : ''
          }`}
          title={mode === 'add-pin' ? 'Cancel adding pin' : 'Add pin to map'}
        >
          <MapPinIcon className="w-4 h-4 text-[var(--color-muted)]" />
        </button>

        {/* Add Widget button */}
        <button
          onClick={() => setShowAddWidgetMenu(!showAddWidgetMenu)}
          className="p-2 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg hover:bg-[var(--color-accent)] transition-colors"
          title="Add widget"
        >
          <Plus className="w-4 h-4 text-[var(--color-muted)]" />
        </button>

        {/* Share button (placeholder) */}
        <button
          className="p-2 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg hover:bg-[var(--color-accent)] transition-colors opacity-50"
          title="Share dashboard (coming soon)"
          disabled
        >
          <Share2 className="w-4 h-4 text-[var(--color-muted)]" />
        </button>
      </div>

      {/* Add Widget Menu */}
      {showAddWidgetMenu && (
        <AddWidgetMenu
          onSelect={handleAddWidget}
          onClose={() => setShowAddWidgetMenu(false)}
        />
      )}

      {/* Mode indicator */}
      {mode === 'add-pin' && (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-[var(--color-primary)] text-white px-4 py-2 shadow-lg">
          Click on the map to add a pin
        </div>
      )}

      {/* New pin popover - rendered outside the map */}
      {newPinCoordinates && (
        <PinEditPopover
          coordinates={newPinCoordinates}
          position={defaultPopoverPosition}
          onSave={handleCreatePin}
          onClose={() => setNewPinCoordinates(null)}
          isNew
        />
      )}

      {/* Edit pin popover - rendered outside the map */}
      {editingPin && (
        <PinEditPopover
          pin={editingPin}
          position={editPopoverPosition}
          onSave={handleSavePin}
          onDelete={handleDeletePin}
          onLinkWidgets={handleOpenLinkingDialog}
          onClose={() => setEditingPin(null)}
        />
      )}

      {/* Widget linking dialog - rendered outside the map */}
      {linkingPin && (
        <WidgetLinkingDialog
          pin={linkingPin}
          onLink={handleLinkWidget}
          onUpdate={handleUpdateLinkedWidget}
          onUnlink={handleUnlinkWidget}
          onClose={() => setLinkingPin(null)}
        />
      )}
    </div>
  );
}
