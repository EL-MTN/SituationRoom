import { FileText } from 'lucide-react';
import { WidgetRegistry } from '../registry';
import { NotesWidget } from './NotesWidget';
import type { NotesWidgetConfig } from './NotesWidget.types';

WidgetRegistry.register<NotesWidgetConfig>({
  metadata: {
    type: 'notes',
    displayName: 'Notes',
    description: 'Quick notes and scratchpad',
    icon: FileText,
  },
  defaults: {
    config: {
      type: 'notes',
      title: 'Notes',
      content: '',
    },
    layout: { w: 4, h: 5, minW: 2, minH: 3 },
  },
  component: NotesWidget,
});

export { NotesWidget } from './NotesWidget';
export type { NotesWidgetConfig } from './NotesWidget.types';
