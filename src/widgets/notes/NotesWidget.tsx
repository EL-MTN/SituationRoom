'use client';

import type { WidgetProps } from '../registry';
import type { NotesWidgetConfig } from './types';

export function NotesWidget({ config, onConfigChange }: WidgetProps<NotesWidgetConfig>) {
  return (
    <div className="h-full w-full p-2">
      <textarea
        value={config.content}
        onChange={(e) => onConfigChange({ content: e.target.value })}
        placeholder="Write your notes here..."
        className="w-full h-full bg-transparent text-[var(--color-foreground)] placeholder-[var(--color-muted)] border border-[var(--color-border)] rounded-md p-3 resize-none font-mono text-sm focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
      />
    </div>
  );
}
