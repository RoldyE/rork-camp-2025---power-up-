import { useEffect, useRef } from 'react';

export interface PollingOptions {
  enabled?: boolean;
  interval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function usePolling(
  callback: () => Promise<any> | void,
  options: PollingOptions = {}
) {
  const {
    enabled = true,
    interval = 5000,
    onSuccess,
    onError,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);

  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Setup polling
  useEffect(() => {
    // Skip if polling is disabled
    if (!enabled) return;

    // Function to execute the callback and schedule the next poll
    const executePoll = async () => {
      try {
        const result = await callbackRef.current();
        if (onSuccess) onSuccess(result);
      } catch (error) {
        if (onError) onError(error);
      } finally {
        // Schedule next poll if component is still mounted and polling is enabled
        if (enabled) {
          timeoutRef.current = setTimeout(executePoll, interval);
        }
      }
    };

    // Start polling
    executePoll();

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, interval, onSuccess, onError]);

  // Return a function to manually trigger the callback
  return {
    trigger: async () => {
      try {
        const result = await callbackRef.current();
        if (onSuccess) onSuccess(result);
        return result;
      } catch (error) {
        if (onError) onError(error);
        throw error;
      }
    },
  };
}