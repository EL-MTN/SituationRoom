'use client';

import { useMemo } from 'react';
import { Youtube } from 'lucide-react';
import type { WidgetProps } from '../registry';
import type { YoutubeWidgetConfig } from './YoutubeWidget.types';

function extractVideoId(url: string): string | null {
  if (!url) return null;

  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\s?]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }

  return null;
}

export function YoutubeWidget({ config }: WidgetProps<YoutubeWidgetConfig>) {
  const videoId = useMemo(() => extractVideoId(config.videoUrl), [config.videoUrl]);

  if (!config.videoUrl || !videoId) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[var(--color-muted)] p-4">
        <Youtube className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm text-center">
          No video selected.
          <br />
          Click the video icon to choose or enter a URL.
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
        title="YouTube video"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full border-0"
      />
    </div>
  );
}
