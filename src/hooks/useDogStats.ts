import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DogStats } from '@/types/database.types';

export function useDogStats(dogId: string | undefined) {
    return useQuery({
        queryKey: ['dog-stats', dogId],
        queryFn: async () => {
            if (!dogId) return null;

            const { data, error } = await supabase
                .from('dog_stats')
                .select('*')
                .eq('id', dogId)
                .single();

            if (error) {
                console.error('Error fetching dog stats:', error);
                // Return null on error (e.g. view not created yet) to allow UI to fallback
                return null;
            }

            return data as DogStats;
        },
        enabled: !!dogId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
