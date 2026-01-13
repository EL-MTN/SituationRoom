import { Youtube } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { YoutubeWidget } from './YoutubeWidget';
import { YoutubeWidgetHeader } from './YoutubeWidgetHeader';
import type { YoutubeWidgetConfig } from './types';

WidgetRegistry.register<YoutubeWidgetConfig>({
  metadata: {
    type: 'youtube',
    displayName: 'YouTube',
    description: 'Embedded YouTube video player',
    icon: Youtube,
  },
  defaults: {
    config: {
      type: 'youtube',
      title: 'YouTube',
      videoUrl: '',
    },
    layout: { w: 6, h: 8, minW: 3, minH: 4 },
  },
  component: YoutubeWidget,
  headerActions: YoutubeWidgetHeader,
});

export { YoutubeWidget } from './YoutubeWidget';
export { YoutubeWidgetHeader } from './YoutubeWidgetHeader';
export type { YoutubeWidgetConfig } from './types';
