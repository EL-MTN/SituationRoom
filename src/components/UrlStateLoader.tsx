'use client';

import { useEffect, useRef } from 'react';
import { useShareableUrl } from '../hooks';
import { useDashboard } from '../stores';

/**
 * Headless component that loads dashboard state from URL on mount.
 * Must be rendered within DashboardProvider and wrapped in Suspense.
 */
export function UrlStateLoader() {
  const { urlState } = useShareableUrl();
  const { loadSharedState } = useDashboard();
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Only load once and only if there's valid URL state
    if (urlState && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      loadSharedState(urlState);
    }
  }, [urlState, loadSharedState]);

  // Render nothing - this is a headless component
  return null;
}
