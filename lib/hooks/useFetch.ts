import { useState, useEffect, useRef } from 'react';
import { logError } from '../utils/logger';

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: HeadersInit;
  body?: BodyInit;
  timeout?: number;
}

/**
 * Custom hook for fetching data with loading, error states, and request cancellation
 * @param url - The URL to fetch from
 * @param options - Fetch options
 * @param deps - Dependency array to trigger refetch
 */
export function useFetch<T = unknown>(
  url: string,
  options: FetchOptions = {},
  deps: React.DependencyList = []
): FetchState<T> & { refetch: () => void } {
  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: true,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Set up timeout
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, options.timeout || 10000); // Default 10 second timeout

      const response = await fetch(url, {
        ...options,
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      setState({
        data: data as T,
        loading: false,
        error: null,
      });
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Request was cancelled, don't update state
          return;
        }

        logError('useFetch error', error, { url });
        setState({
          data: null,
          loading: false,
          error,
        });
      } else {
        logError('useFetch unknown error', undefined, { url });
        setState({
          data: null,
          loading: false,
          error: new Error('An unknown error occurred'),
        });
      }
    }
  };

  useEffect(() => {
    fetchData();

    // Cleanup: abort request on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [url, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    ...state,
    refetch: fetchData,
  };
}
