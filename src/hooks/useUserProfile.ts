import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { User, DogAction } from '@/types/database.types';

interface UserProfileData {
    user: User;
    rank: number;
    streak: number;
    recentActions: (DogAction & { dog_name?: string })[];
}

export function useUserProfile() {
    const { profile: contextUser, authUser } = useAuth();
    const queryClient = useQueryClient();

    // Realtime: refresh profile whenever the user earns a new kindness action
    useEffect(() => {
        if (!authUser?.id) return;
        const channel = supabase
            .channel(`profile-points-${authUser.id}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'kindness_actions',
                    filter: `user_id=eq.${authUser.id}`,
                },
                () => {
                    queryClient.invalidateQueries({ queryKey: ['user-profile', authUser.id] });
                }
            )
            .subscribe();

        return () => { supabase.removeChannel(channel); };
    }, [authUser?.id, queryClient]);

    return useQuery({
        queryKey: ['user-profile', authUser?.id],
        queryFn: async (): Promise<UserProfileData | null> => {
            if (!authUser?.id) return null;

            // If we already have user from context, use it as fallback
            let user: User | null = null;

            // Fetch user profile from database
            const { data, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('id', authUser.id)
                .single();

            if (userError) {
                console.error('Error fetching user:', userError);
                // Use context user as fallback if available
                if (contextUser) {
                    user = contextUser;
                } else {
                    return null;
                }
            } else {
                user = data as User;
            }

            if (!user) return null;

            // Calculate rank and get points from unified views
            let rank = 0;
            let points = 0;
            let streak = 0;
            try {
                // 1. Fetch points from our single source of truth view
                const { data: pointsData } = await (supabase
                    .from('user_points')
                    .select('total_points')
                    .eq('user_id', authUser.id) as any)
                    .maybeSingle();

                if (pointsData) {
                    points = (pointsData as any).total_points || 0;
                    user = { ...user, points };
                }

                // 2. Fetch Streak from RPC (graceful fallback if function not yet deployed)
                try {
                    const { data: streakCount } = await (supabase as any)
                        .rpc('calculate_feeding_streak', { uid: authUser.id });
                    streak = (streakCount as number) || 0;
                } catch (_streakErr) {
                    // Streak function may not be deployed yet — silently default to 0
                    streak = 0;
                }

                // 3. Calculate rank by counting users with more points in the leaderboard
                const { count } = await (supabase
                    .from('leaderboard')
                    .select('*', { count: 'exact', head: true })
                    .gt('total_points', points) as any);

                rank = (count || 0) + 1;
            } catch (err) {
                console.error('Error calculating rank or points:', err);
            }

            // Fetch recent actions by this user (from new kindness_actions ledger)
            let recentActions: any[] = [];
            try {
                const { data: actions } = await supabase
                    .from('kindness_actions')
                    .select(`
                        *,
                        dogs:dog_id (name)
                    `)
                    .eq('user_id', authUser.id)
                    .order('created_at', { ascending: false })
                    .limit(10);

                recentActions = (actions || []).map((action: any) => ({
                    ...action,
                    dog_name: action.dogs?.name,
                    points_given: action.points // compatibility with UI
                }));
            } catch (err) {
                console.error('Error fetching actions from ledger:', err);
            }

            return {
                user,
                rank,
                streak,
                recentActions,
            };
        },
        enabled: !!authUser?.id,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: 1, // Only retry once to avoid infinite loops
        retryDelay: 1000,
    });
}
