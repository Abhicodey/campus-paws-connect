import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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
                // Search by name or location (soft_locations is an array)
                query = query.or(`name.ilike.%${searchQuery}%`);
            }

            const { data, error } = await query;

            if (error) {
                throw new Error(error.message);
            }

            // If there's a search query, also filter by location on client side
            // since Supabase doesn't support ilike on array fields easily
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
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
