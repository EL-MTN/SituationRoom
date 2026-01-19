'use client';

import { useState, useCallback, useMemo } from 'react';
import type L from 'leaflet';
import type { MapPin, LinkedWidgetConfig } from '@/types/pin.types';
import { PinMarker } from './PinMarker';
import { PinEditPopover } from './PinEditPopover';
import { WidgetLinkingDialog } from './WidgetLinkingDialog';
import { useMapDashboard } from '@/stores/MapDashboardContext';

interface PinManagerProps {
  newPinCoordinates?: [number, number] | null;
  onNewPinCreated: () => void;
  onNewPinCancelled: () => void;
}

// Safe window access for SSR
function getDefaultPopoverPosition() {
  if (typeof window === 'undefined') return { x: 200, y: 100 };
  return { x: Math.max(200, window.innerWidth / 2 - 130), y: 100 };
}

export function PinManager({
  newPinCoordinates,
  onNewPinCreated,
  onNewPinCancelled,
}: PinManagerProps) {
  const {
    state,
    addPin,
    updatePin,
    deletePin,
    linkWidgetToPin,
    updateLinkedWidget,
    unlinkWidgetFromPin,
    openPinWidgets,
  } = useMapDashboard();

  const [editingPin, setEditingPin] = useState<MapPin | null>(null);
  const [editPopoverPosition, setEditPopoverPosition] = useState({ x: 0, y: 0 });
  const [linkingPin, setLinkingPin] = useState<MapPin | null>(null);

  // Calculate default position only on client
  const defaultPopoverPosition = useMemo(() => getDefaultPopoverPosition(), []);

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
        onNewPinCreated();
      }
    },
    [newPinCoordinates, addPin, onNewPinCreated]
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

  return (
    <>
      {/* Render existing pins */}
      {state.pins.map((pin) => (
        <PinMarker
          key={pin.id}
          pin={pin}
          onClick={handlePinClick}
          onContextMenu={handlePinContextMenu}
        />
      ))}

      {/* New pin popover */}
      {newPinCoordinates && (
        <PinEditPopover
          coordinates={newPinCoordinates}
          position={defaultPopoverPosition}
          onSave={handleCreatePin}
          onClose={onNewPinCancelled}
          isNew
        />
      )}

      {/* Edit pin popover */}
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

      {/* Widget linking dialog */}
      {linkingPin && (
        <WidgetLinkingDialog
          pin={linkingPin}
          onLink={handleLinkWidget}
          onUpdate={handleUpdateLinkedWidget}
          onUnlink={handleUnlinkWidget}
          onClose={() => {
            // Refresh the pin state after linking changes
            const updatedPin = state.pins.find((p) => p.id === linkingPin.id);
            setLinkingPin(updatedPin ?? null);
            if (!updatedPin) {
              setLinkingPin(null);
            }
          }}
        />
      )}
    </>
  );
}
