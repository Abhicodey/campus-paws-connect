import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface LeaderboardUser {
    id: string;
    username: string;
    points: number;
    avatar_url: string | null;
    avatar_updated_at?: string | null;
}

export function useLeaderboard(limit: number = 20) {
    return useQuery({
        queryKey: ['leaderboard', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('id, username, points, avatar_url, role, avatar_updated_at')
                .eq('username_verified', true)
                .eq('is_hidden', false)
                .eq('is_active', true)
                .neq('role', 'president') // Exclude president
                .neq('role', 'admin')     // Exclude admin
                .eq('is_super_admin', false) // Exclude superadmins
                .not('username', 'is', null)
                .order('points', { ascending: false })
                .limit(limit);

            if (error) {
                console.error('Leaderboard fetch error:', error);
                return [];
            }

            return (data || []) as LeaderboardUser[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });
}
