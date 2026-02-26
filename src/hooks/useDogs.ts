import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, DEFAULT_QUERY_TIMEOUT_MS } from '@/lib/queryTimeout';
import type { Dog } from '@/types/database.types';

export function useDogs(searchQuery?: string) {
    return useQuery({
        queryKey: ['dogs', searchQuery],
        queryFn: async () => {
            let query = supabase
                .from('dogs')
                .select('*')
                .eq('verified', true)
                .eq('is_active', true)
                .neq('is_hidden', true)
                .order('name', { ascending: true });

            if (searchQuery) {
                query = query.or(`name.ilike.%${searchQuery}%`);
            }

            const { data, error } = await withTimeout(
                query,
                DEFAULT_QUERY_TIMEOUT_MS,
                'Loading dogs timed out'
            );

            if (error) {
                throw new Error(error.message);
            }

            if (searchQuery && data) {
                const lowerQuery = searchQuery.toLowerCase();
                return data.filter(
                    (dog) =>
                        dog.name.toLowerCase().includes(lowerQuery) ||
                        dog.soft_locations?.some((loc: string) => loc.toLowerCase().includes(lowerQuery))
                ) as Dog[];
            }

            return (data ?? []) as Dog[];
        },
        staleTime: 1000 * 60 * 5,
        retry: 1,
        retryDelay: 2000,
    });
}
