/**
 * Wraps a promise to reject after `ms` milliseconds.
 * Prevents queries from hanging forever (e.g. slow network or Supabase unresponsive).
 */
export function withTimeout<T>(promise: Promise<T>, ms: number, message = 'Request timeout'): Promise<T> {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(message)), ms)
        ),
    ]);
}

export const DEFAULT_QUERY_TIMEOUT_MS = 12_000; // 12 seconds
