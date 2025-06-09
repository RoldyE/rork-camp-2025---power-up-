import { useEffect, useRef, useState } from "react";

interface PollingOptions {
  interval?: number;
  enabled?: boolean;
  onError?: (error: any) => void;
  immediate?: boolean;
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
  const { 
    interval = 60000, // Reduced to 1 minute to balance freshness and performance
    enabled = true, 
    onError,
    immediate = true 
  } = options;
  
  const [isPolling, setIsPolling] = useState(enabled);
  const [lastPolled, setLastPolled] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const isPollingRef = useRef(isPolling);
  const lastFetchTimeRef = useRef<number>(0);

  const startPolling = () => {
    setIsPolling(true);
    isPollingRef.current = true;
  };

  const stopPolling = () => {
    setIsPolling(false);
    isPollingRef.current = false;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const poll = async () => {
    if (!isPollingRef.current || !isMountedRef.current) return;
    
    // Throttle fetching to prevent excessive calls
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 10000) { // Minimum 10 seconds between fetches
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(poll, 10000);
      return;
    }
    
    lastFetchTimeRef.current = now;
    
    try {
      await fetchFn();
      if (isMountedRef.current) {
        setLastPolled(new Date());
        setError(null);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err as Error);
        if (onError) {
          onError(err);
        }
      }
    }

    if (isPollingRef.current && isMountedRef.current) {
      timeoutRef.current = setTimeout(poll, interval);
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    isPollingRef.current = isPolling;
    
    if (isPolling && immediate) {
      // Call immediately on mount or when isPolling changes to true
      poll();
    } else if (isPolling) {
      // If not immediate, set up the first poll after the interval
      timeoutRef.current = setTimeout(poll, interval);
    }

    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isPolling, immediate]);

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
    poll, // Expose poll function to allow manual polling
  };
}