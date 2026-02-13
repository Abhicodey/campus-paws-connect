import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Badge {
    id: string;
    code: string;
    name: string;
    description: string | null;
    icon: string | null;
}

interface UserBadge {
    id: string;
    user_id: string;
    badge_id: string;
    awarded_at: string;
    badges: Badge;
}

export function useUserBadges(userId: string | undefined) {
    return useQuery({
        queryKey: ['user-badges', userId],
        queryFn: async (): Promise<Badge[]> => {
            if (!userId) return [];

            const { data, error } = await supabase
                .from('user_badges')
                .select(`
                    id,
                    user_id,
                    badge_id,
                    awarded_at,
                    badges:badge_id (
                        id,
                        code,
                        name,
                        description,
                        icon
                    )
                `)
                .eq('user_id', userId)
                .order('awarded_at', { ascending: false });

            if (error) {
                console.error('Error fetching user badges:', error);
                return [];
            }

            // Extract badges from the join result
            return (data || [])
                .map((ub: any) => ub.badges)
                .filter((badge): badge is Badge => badge !== null);
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

// Hook to get all available badges (for showing progress)
export function useAllBadges() {
    return useQuery({
        queryKey: ['all-badges'],
        queryFn: async (): Promise<Badge[]> => {
            const { data, error } = await supabase
                .from('badges')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching badges:', error);
                return [];
            }

            return data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes (badges rarely change)
    });
}
