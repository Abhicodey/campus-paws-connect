import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface LeaderboardUser {
    id: string;
    username: string;
    avatar_url: string | null;
    avatar_updated_at?: string | null;
    total_points: number;
}

export function useLeaderboard() {
    const queryClient = useQueryClient();

    // Realtime subscription for leaderboard updates (listen to actions)
    useEffect(() => {
        const channel = supabase
            .channel('leaderboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'kindness_actions'
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: ['leaderboard'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('leaderboard')
                .select('*')
                .order('total_points', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Leaderboard fetch error:', error);
                return [];
            }

            return data as LeaderboardUser[];
        },
        staleTime: 1000 * 30, // 30 seconds - realtime subscription handles live updates
    });
}
