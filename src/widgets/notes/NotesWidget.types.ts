import type { BaseWidgetConfig } from '../registry';

export interface NotesWidgetConfig extends BaseWidgetConfig {
  type: 'notes';
  content: string;
}
