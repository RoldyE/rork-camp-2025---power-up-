import { useEffect, useRef, useCallback } from 'react';

interface PollingOptions {
  interval?: number;
  immediate?: boolean;
  enabled?: boolean;
}

export function usePolling(
  callback: () => Promise<void> | void,
  options: PollingOptions = {}
) {
  const { 
    interval = 60000, // Default to 60 seconds
    immediate = true,
    enabled = true
  } = options;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const callbackRef = useRef(callback);
  
  // Update the callback ref when the callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);
  
  const poll = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      console.error('Polling error:', error);
    }
    
    // Only set up the next poll if enabled
    if (enabled) {
      timeoutRef.current = setTimeout(poll, interval);
    }
  }, [interval, enabled]);
  
  // Manual polling function that can be called from outside
  const manualPoll = useCallback(async () => {
    try {
      await callbackRef.current();
    } catch (error) {
      console.error('Manual polling error:', error);
    }
  }, []);
  
  useEffect(() => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    // Start polling if enabled
    if (enabled) {
      if (immediate) {
        poll();
      } else {
        timeoutRef.current = setTimeout(poll, interval);
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [poll, interval, immediate, enabled]);
  
  return { poll: manualPoll };
}