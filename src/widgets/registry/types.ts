import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Base configuration all widgets must have
 */
export interface BaseWidgetConfig {
  id: string;
  type: string;
  title: string;
}

/**
 * Layout properties for react-grid-layout
 */
export interface WidgetLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
  maxW?: number;
  maxH?: number;
}

/**
 * Widget instance with layout info
 */
export interface WidgetInstance<T extends BaseWidgetConfig = BaseWidgetConfig> {
  config: T;
  layout: WidgetLayout;
}

/**
 * Widget component props interface
 */
export interface WidgetProps<T extends BaseWidgetConfig = BaseWidgetConfig> {
  config: T;
  onConfigChange: (config: Partial<T>) => void;
}

/**
 * Props passed to widget header extension components
 */
export interface WidgetHeaderExtensionProps<T extends BaseWidgetConfig = BaseWidgetConfig> {
  config: T;
  onConfigChange: (config: Partial<T>) => void;
}

/**
 * Widget metadata for display and configuration UI
 */
export interface WidgetMetadata {
  type: string;
  displayName: string;
  description?: string;
  icon: LucideIcon;
  category?: string;
}

/**
 * Default layout and config for new widget instances
 */
export interface WidgetDefaults<T extends BaseWidgetConfig = BaseWidgetConfig> {
  config: Omit<T, 'id'>;
  layout: {
    w: number;
    h: number;
    minW: number;
    minH: number;
    maxW?: number;
    maxH?: number;
  };
}

/**
 * Complete widget definition for registration
 */
export interface WidgetDefinition<T extends BaseWidgetConfig = BaseWidgetConfig> {
  metadata: WidgetMetadata;
  defaults: WidgetDefaults<T>;

  /** The main widget component */
  component: ComponentType<WidgetProps<T>>;

  /** Optional custom header actions (search button, location button, etc.) */
  headerActions?: ComponentType<WidgetHeaderExtensionProps<T>>;

  /** Optional custom toolbar items (settings gear, etc.) */
  toolbarItems?: ComponentType<WidgetHeaderExtensionProps<T>>;
}
