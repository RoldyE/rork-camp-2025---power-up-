import { useEffect, useRef } from 'react';

interface PollingOptions {
  enabled?: boolean;
  interval?: number;
  onError?: (error: Error) => void;
}

/**
 * A hook that polls a function at a specified interval
 * @param fn The function to poll
 * @param options Polling options
 */
export function usePolling(
  fn: () => Promise<void>,
  options: PollingOptions = {}
) {
  const { 
    enabled = true, 
    interval = 5000, 
    onError 
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    
    const execute = async () => {
      if (!enabled || !mountedRef.current) return;
      
      try {
        await fn();
      } catch (error) {
        if (onError && error instanceof Error) {
          onError(error);
        } else {
          console.error('Polling error:', error);
        }
      }
      
      if (mountedRef.current) {
        timeoutRef.current = setTimeout(execute, interval);
      }
    };
    
    execute();
    
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fn, enabled, interval, onError]);
}