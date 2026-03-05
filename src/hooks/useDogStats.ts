import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { DogStats } from '@/types/database.types';

export function useDogStats(dogId: string | undefined) {
    const queryClient = useQueryClient();

    // Realtime: refresh when any interaction is added for this dog
    useEffect(() => {
        if (!dogId) return;
        const channel = supabase
            .channel(`dog-stats-${dogId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'dog_interactions',
                    filter: `dog_id=eq.${dogId}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['dog-stats', dogId] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [dogId, queryClient]);

    return useQuery({
        queryKey: ['dog-stats', dogId],
        queryFn: async () => {
            if (!dogId) return null;

            const { data, error } = await (supabase
                .from('dog_stats')
                .select('*')
                .eq('id', dogId) as any)
                .maybeSingle();

            if (error) {
                console.error('Error fetching dog stats:', error);
                return null;
            }

            return data as DogStats | null;
        },
        enabled: !!dogId,
        staleTime: 1000 * 60 * 2, // 2 minutes — realtime handles instant updates
    });
}
