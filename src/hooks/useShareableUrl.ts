'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo, useCallback } from 'react';
import {
  decodeShareableState,
  getShareableUrl,
  type DecodedDashboard,
} from '../utils/urlState';
import type { Dashboard } from '../types';

export interface UseShareableUrlReturn {
  /** Decoded dashboard state from URL (null if no valid state in URL) */
  urlState: DecodedDashboard | null;
  /** Whether the current page was loaded from a shared URL */
  isFromSharedUrl: boolean;
  /** Generate a shareable URL for the given dashboard */
  getShareUrl: (dashboard: Dashboard) => string;
  /** Copy shareable URL to clipboard, returns true if successful */
  copyShareUrl: (dashboard: Dashboard) => Promise<boolean>;
}

/**
 * Hook for managing shareable dashboard URLs
 * Reads state from URL on mount and provides methods to generate share URLs
 */
export function useShareableUrl(): UseShareableUrlReturn {
  const searchParams = useSearchParams();

  // Decode URL state (memoized)
  const urlState = useMemo(() => {
    const encoded = searchParams.get('d');
    if (!encoded) return null;
    return decodeShareableState(encoded);
  }, [searchParams]);

  // Generate shareable URL
  const getShareUrl = useCallback((dashboard: Dashboard): string => {
    return getShareableUrl(dashboard);
  }, []);

  // Copy share URL to clipboard
  const copyShareUrl = useCallback(async (dashboard: Dashboard): Promise<boolean> => {
    try {
      const url = getShareUrl(dashboard);
      await navigator.clipboard.writeText(url);
      return true;
    } catch (error) {
      console.error('[useShareableUrl] Failed to copy to clipboard:', error);
      return false;
    }
  }, [getShareUrl]);

  return {
    urlState,
    isFromSharedUrl: urlState !== null,
    getShareUrl,
    copyShareUrl,
  };
}
