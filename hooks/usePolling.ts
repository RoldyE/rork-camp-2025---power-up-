import { useEffect, useRef, useState } from "react";

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: any) => void;
}

/**
 * A hook for polling data at regular intervals
 * @param fetchFn The function to call for fetching data
 * @param options Polling options
 * @returns Object with polling state and control functions
 */
export function usePolling(
  fetchFn: () => Promise<any>,
  options: PollingOptions = {}
) {
  const { interval = 5000, enabled = true, onError } = options;
  const [isPolling, setIsPolling] = useState(enabled);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const startPolling = () => {
    setIsPolling(true);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const poll = async () => {
    try {
      await fetchFn();
      setLastPolled(new Date());
      setError(null);
    } catch (err) {
      setError(err as Error);
      if (onError) {
        onError(err);
      }
    }

    if (isPolling) {
      timeoutRef.current = setTimeout(poll, interval);
    }
  };

  useEffect(() => {
    if (isPolling) {
      poll();
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPolling]);

  // Update polling state when enabled option changes
  useEffect(() => {
    if (enabled && !isPolling) {
      startPolling();
    } else if (!enabled && isPolling) {
      stopPolling();
    }
  }, [enabled]);

  return {
    isPolling,
    lastPolled,
    error,
    startPolling,
    stopPolling,
  };
}