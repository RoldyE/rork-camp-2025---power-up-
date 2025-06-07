import { useEffect, useRef } from 'react';

export interface PollingOptions {
  interval: number;
  enabled?: boolean;
}

/**
 * Custom hook for polling an API at regular intervals
 * @param callback Function to call on each interval
 * @param options Polling options (interval in ms, enabled flag)
 */
export function usePolling(callback: () => Promise<void> | void, options: PollingOptions | number) {
  // Handle both object options and direct interval number
  const resolvedOptions: PollingOptions = typeof options === 'number' 
    ? { interval: options, enabled: true }
    : { interval: 5000, enabled: true, ...options };
  
  const { interval, enabled = true } = resolvedOptions;
  const savedCallback = useRef<() => Promise<void> | void>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (!enabled) return;

    const tick = async () => {
      try {
        await savedCallback.current();
      } catch (error) {
        console.error('Error in polling callback:', error);
      }
    };

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, enabled]);
}