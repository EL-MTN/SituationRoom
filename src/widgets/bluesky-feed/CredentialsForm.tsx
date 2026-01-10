'use client';

import { useState } from 'react';
import { CloudSun } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { saveCredentials } from '../../services/bluesky';

export function CredentialsForm() {
  const [handle, setHandle] = useState('');
  const [appPassword, setAppPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Test the credentials by attempting to create a session
      const response = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: handle, password: appPassword }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Invalid credentials');
      }

      // Credentials are valid, save them
      saveCredentials({ handle, appPassword });
      queryClient.invalidateQueries({ queryKey: ['bluesky-feed'] });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4">
      <CloudSun className="w-8 h-8 mb-3 opacity-50 text-[var(--color-muted)]" />
      <h3 className="text-sm font-medium mb-3">Connect to Bluesky</h3>

      <form onSubmit={handleSubmit} className="w-full max-w-[240px] flex flex-col gap-2">
        <input
          type="text"
          value={handle}
          onChange={(e) => setHandle(e.target.value)}
          placeholder="handle.bsky.social"
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />
        <input
          type="password"
          value={appPassword}
          onChange={(e) => setAppPassword(e.target.value)}
          placeholder="App Password"
          className="w-full px-2 py-1.5 text-sm border border-[var(--color-border)] bg-[var(--color-background)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
          disabled={isLoading}
        />

        {error && (
          <p className="text-xs text-[var(--color-destructive)]">{error}</p>
        )}

        <button
          type="submit"
          disabled={!handle || !appPassword || isLoading}
          className="w-full px-3 py-1.5 text-sm bg-[var(--color-primary)] text-white hover:opacity-90 disabled:opacity-50"
        >
          {isLoading ? 'Connecting...' : 'Connect'}
        </button>

        <a
          href="https://bsky.app/settings/app-passwords"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-[var(--color-muted)] hover:underline text-center"
        >
          Create an App Password →
        </a>
      </form>
    </div>
  );
}
