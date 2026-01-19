import type { BaseWidgetConfig } from '@/widgets/registry/types';
import type { LocationContext } from './pin.types';

/**
 * Position and state for a floating widget panel
 */
export interface FloatingWidgetPosition {
  id: string;
  x: number; // absolute pixels
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  pinnedToPin?: string; // pin ID if widget was opened from a pin
}

/**
 * Floating widget instance combines config with position
 */
export interface FloatingWidgetInstance<T extends BaseWidgetConfig = BaseWidgetConfig> {
  config: T;
  position: FloatingWidgetPosition;
  locationContext?: LocationContext;
}
