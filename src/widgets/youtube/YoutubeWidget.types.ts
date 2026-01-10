import type { BaseWidgetConfig } from '../registry';

export interface YoutubePreset {
  label: string;
  url: string;
}

export interface YoutubeWidgetConfig extends BaseWidgetConfig {
  type: 'youtube';
  videoUrl: string;
}

export const YOUTUBE_PRESETS: YoutubePreset[] = [
	{
		label: 'Subway Surfer Gameplay',
		url: 'https://www.youtube.com/watch?v=L_fcrOyoWZ8',
	},
	{ label: 'Clash Royale Gameplay', url: 'https://www.youtube.com/watch?v=-IzN0I9NBQE' },
	{ label: 'NGGYU', url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
	{ label: 'Lofi Pop', url: 'https://www.youtube.com/watch?v=awi74O_6VHk' },
];
