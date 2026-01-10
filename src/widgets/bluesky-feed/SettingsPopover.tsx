'use client';

import { useRef, useState, useEffect } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';
import { BLUESKY_CONFIG, BLUESKY_POLL_INTERVAL_OPTIONS } from '../../constants';
import {
  getCredentials,
  saveCredentials,
  clearCredentials,
} from '../../services/bluesky';
import type { BlueskyFeedWidgetConfig } from './BlueskyFeedWidget.types';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  config: BlueskyFeedWidgetConfig;
  onConfigChange: (config: Partial<BlueskyFeedWidgetConfig>) => void;
  onCredentialsChange?: () => void;
}

export function SettingsPopover({
  isOpen,
  onClose,
  config,
  onConfigChange,
  onCredentialsChange,
}: SettingsPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [handle, setHandle] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [savedHandle, setSavedHandle] = useState<string | null>(null);

  useClickOutside(popoverRef, isOpen, onClose);

  useEffect(() => {
    if (isOpen) {
      const creds = getCredentials();
      if (creds) {
        setSavedHandle(creds.handle);
        setHandle(creds.handle);
      } else {
        setSavedHandle(null);
        setHandle('');
      }
      setAppPassword('');
    }
  }, [isOpen]);

  const handleSaveCredentials = () => {
    if (handle && appPassword) {
      saveCredentials({ handle, appPassword });
      setSavedHandle(handle);
      setAppPassword('');
      onCredentialsChange?.();
    }
  };

  const handleClearCredentials = () => {
    clearCredentials();
    setSavedHandle(null);
    setHandle('');
    setAppPassword('');
    onCredentialsChange?.();
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute top-full right-0 mt-1 z-50 bg-[var(--color-background)] border border-[var(--color-border)] shadow-lg p-3 min-w-[250px]"
    >
      <div className="flex flex-col gap-3">
        {/* Bluesky Account Section */}
        <div className="flex flex-col gap-2">
          <div className="text-xs font-medium text-[var(--color-muted)]">
            Bluesky Account
          </div>
          {savedHandle ? (
            <div className="flex items-center justify-between">
              <span className="text-sm text-green-600">@{savedHandle}</span>
              <button
                type="button"
                onClick={handleClearCredentials}
                className="text-xs text-[var(--color-destructive)] hover:underline"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="handle.bsky.social"
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <input
                type="password"
                value={appPassword}
                onChange={(e) => setAppPassword(e.target.value)}
                placeholder="App Password"
                className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
              <button
                type="button"
                onClick={handleSaveCredentials}
                disabled={!handle || !appPassword}
                className="w-full px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
              >
                Connect
              </button>
              <a
                href="https://bsky.app/settings/app-passwords"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] text-[var(--color-muted)] hover:underline"
              >
                Create an App Password →
              </a>
            </>
          )}
        </div>

        <div className="border-t border-[var(--color-border)] pt-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-[var(--color-muted)]">
              Max Posts
            </label>
            <select
              value={config.maxResults}
              onChange={(e) => onConfigChange({ maxResults: Number(e.target.value) })}
              className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
            >
              {BLUESKY_CONFIG.maxResultsOptions.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-[var(--color-muted)]">
            Refresh Interval
          </label>
          <select
            value={config.pollIntervalMs}
            onChange={(e) =>
              onConfigChange({ pollIntervalMs: Number(e.target.value) })
            }
            className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          >
            {BLUESKY_POLL_INTERVAL_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-2 pt-2 border-t border-[var(--color-border)]">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={config.showMedia}
              onChange={(e) => onConfigChange({ showMedia: e.target.checked })}
              className="w-4 h-4"
            />
            Show media
          </label>
        </div>
      </div>
    </div>
  );
}
