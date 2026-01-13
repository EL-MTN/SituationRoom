import type { BaseWidgetConfig } from '../../registry';

export interface YoutubePreset {
  label: string;
  url: string;
}

export interface YoutubeWidgetConfig extends BaseWidgetConfig {
  type: 'youtube';
  videoUrl: string;
}
