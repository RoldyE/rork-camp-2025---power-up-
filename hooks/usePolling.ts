import { useEffect, useRef } from "react";

interface PollingOptions {
  enabled?: boolean;
  interval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

/**
 * Custom hook for polling a function at regular intervals
 * @param fn Function to poll
 * @param options Polling options
 */
export function usePolling(
  fn: () => Promise<any> | void,
  options: PollingOptions = {}
) {
  const {
    enabled = true,
    interval = 5000,
    onSuccess,
    onError,
  } = options;

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const poll = async () => {
      if (!enabled || !isMountedRef.current) return;

      try {
        const result = await fn();
        if (onSuccess && isMountedRef.current) {
          onSuccess(result);
        }
      } catch (error) {
        if (onError && isMountedRef.current) {
          onError(error);
        }
      }

      // Schedule next poll if component is still mounted
      if (isMountedRef.current) {
        timeoutRef.current = setTimeout(poll, interval);
      }
    };

    // Start polling
    poll();

    // Cleanup on unmount or when dependencies change
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fn, enabled, interval, onSuccess, onError]);
}