'use client';

import { useState, useRef } from 'react';
import { Youtube } from 'lucide-react';
import { VideoSelectPopover } from './VideoSelectPopover';
import type { WidgetHeaderExtensionProps } from '../registry';
import type { YoutubeWidgetConfig } from './YoutubeWidget.types';

export function YoutubeWidgetHeader({
  config,
  onConfigChange,
}: WidgetHeaderExtensionProps<YoutubeWidgetConfig>) {
  const [showPopover, setShowPopover] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const hasVideo = Boolean(config.videoUrl);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowPopover(!showPopover);
        }}
        className={`flex items-center gap-1.5 px-2 py-1 text-sm transition-colors ${
          hasVideo
            ? 'bg-[var(--color-primary)]/10 text-[var(--color-primary)]'
            : 'hover:bg-[var(--color-accent)] text-[var(--color-muted)]'
        }`}
        title="Select video"
      >
        <Youtube className="w-4 h-4" />
        <span className="font-medium">{hasVideo ? 'Change' : 'Select'}</span>
      </button>

      <VideoSelectPopover
        isOpen={showPopover}
        onClose={() => setShowPopover(false)}
        buttonRef={buttonRef}
        videoUrl={config.videoUrl}
        onVideoChange={(videoUrl) => onConfigChange({ videoUrl })}
      />
    </>
  );
}
