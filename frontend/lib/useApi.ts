"use client";
import { useState, useEffect, useCallback, useRef } from "react";

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Lightweight data-fetching hook with:
 * - Automatic fetch on mount
 * - Retry on demand
 * - Stale-while-revalidate (keeps previous data while refetching)
 * - Cancellation on unmount
 */
export function useApi<T>(
  fetcher: (() => Promise<T>) | null,
  deps: unknown[] = [],
) {
  const [state, setState] = useState<State<T>>({
    data: null,
    loading: fetcher !== null,
    error: null,
  });

  const cancelled = useRef(false);

  const run = useCallback(async () => {
    if (!fetcher) return;
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const data = await fetcher();
      if (!cancelled.current) setState({ data, loading: false, error: null });
    } catch (err) {
      if (!cancelled.current) {
        setState(s => ({
          ...s,
          loading: false,
          error: err instanceof Error ? err.message : "Something went wrong.",
        }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher, ...deps]);

  useEffect(() => {
    cancelled.current = false;
    run();
    return () => { cancelled.current = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);

  return { ...state, refetch: run };
}

/**
 * Mutation hook — for POST / PATCH / DELETE.
 * Returns [mutate, { loading, error, success }]
 */
export function useMutation<TArgs extends unknown[], TResult>(
  mutator: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const mutate = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      setSuccess(false);
      try {
        const result = await mutator(...args);
        setSuccess(true);
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [mutator],
  );

  return [mutate, { loading, error, success }] as const;
}
