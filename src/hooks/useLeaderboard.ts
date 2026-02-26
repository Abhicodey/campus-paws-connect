import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { withTimeout, DEFAULT_QUERY_TIMEOUT_MS } from '@/lib/queryTimeout';

interface LeaderboardUser {
    id: string;
    username: string;
    points: number;
    avatar_url: string | null;
    avatar_updated_at?: string | null;
}

export function useLeaderboard(limit: number = 20) {
    const queryClient = useQueryClient();

    // Realtime subscription for leaderboard updates
    useEffect(() => {
        const channel = supabase
            .channel('leaderboard-updates')
            .on(
                'postgres_changes',
                {
                    event: '*', // Listen for inserts/updates/deletes
                    schema: 'public',
                    table: 'users'
                },
                () => {
                    console.log('Leaderboard updated, invalidating query...');
                    queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    return useQuery({
        queryKey: ['leaderboard', limit],
        queryFn: async () => {
            const { data, error } = await withTimeout(
                (async () => supabase
                    .from('users')
                    .select('id, username, points, avatar_url, role, avatar_updated_at')
                    .eq('username_status', 'approved')
                    .eq('is_hidden', false)
                    .eq('is_active', true)
                    .neq('role', 'president')
                    .neq('role', 'admin')
                    .eq('is_super_admin', false)
                    .not('username', 'is', null)
                    .gt('points', 0)
                    .order('points', { ascending: false })
                    .limit(limit))(),
                DEFAULT_QUERY_TIMEOUT_MS,
                'Loading leaderboard timed out'
            ) as { data: LeaderboardUser[] | null; error: unknown };

            if (error) {
                console.error('Leaderboard fetch error:', error);
                return [];
            }

            return (data || []) as LeaderboardUser[];
        },
        staleTime: 1000 * 60,
        retry: 1,
        retryDelay: 2000,
    });
}
