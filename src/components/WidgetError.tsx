'use client'

import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface WidgetErrorProps {
  error: Error | null;
  onRetry?: () => void;
  message?: string;
}

function getErrorDetails(error: Error | null): { message: string; isNetworkError: boolean } {
  if (!error) {
    return { message: 'An unknown error occurred', isNetworkError: false };
  }

  const errorMessage = error.message.toLowerCase();

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    error.name === 'TypeError'
  ) {
    return {
      message: 'Unable to connect. Check your internet connection.',
      isNetworkError: true,
    };
  }

  // Rate limiting
  if (errorMessage.includes('429') || errorMessage.includes('rate limit')) {
    return {
      message: 'Too many requests. Please wait a moment.',
      isNetworkError: false,
    };
  }

  // Not found
  if (errorMessage.includes('404') || errorMessage.includes('not found')) {
    return {
      message: 'The requested data was not found.',
      isNetworkError: false,
    };
  }

  // Server errors
  if (errorMessage.includes('500') || errorMessage.includes('server error')) {
    return {
      message: 'Server error. Please try again later.',
      isNetworkError: false,
    };
  }

  // Timeout
  if (errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
    return {
      message: 'Request timed out. Please try again.',
      isNetworkError: false,
    };
  }

  // Default to showing the actual error message
  return {
    message: error.message || 'Failed to load data',
    isNetworkError: false,
  };
}

export function WidgetError({ error, onRetry, message }: WidgetErrorProps) {
  const errorDetails = getErrorDetails(error);
  const displayMessage = message || errorDetails.message;
  const Icon = errorDetails.isNetworkError ? WifiOff : AlertCircle;

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 text-center">
      <Icon className="w-6 h-6 text-[var(--color-destructive)] mb-2" />
      <p className="text-sm text-[var(--color-muted)] mb-3 max-w-[200px]">
        {displayMessage}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[var(--color-accent)] hover:bg-[var(--color-border)] rounded transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
