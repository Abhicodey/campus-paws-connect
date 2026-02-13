import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { User, DogAction } from '@/types/database.types';

interface UserProfileData {
    user: User;
    rank: number;
    recentActions: (DogAction & { dog_name?: string })[];
}

export function useUserProfile() {
    const { user: contextUser, authUser } = useAuth();

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

            // Calculate rank - only count verified, active users with higher points
            // Exclude presidents and superadmins from ranking
            let rank = 1;
            try {
                const { count: higherRanked } = await supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('username_verified', true)
                    .eq('is_hidden', false)
                    .eq('is_active', true)
                    .neq('role', 'president')      // Exclude presidents from ranking
                    .neq('role', 'admin')           // Exclude admins from ranking
                    .eq('is_super_admin', false)    // Exclude superadmins from ranking
                    .gt('points', user.points || 0);

                rank = (higherRanked || 0) + 1;
            } catch (err) {
                console.error('Error calculating rank:', err);
            }

            // Fetch recent actions by this user
            let recentActions: any[] = [];
            try {
                const { data: actions } = await supabase
                    .from('dog_actions')
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
                }));
            } catch (err) {
                console.error('Error fetching actions:', err);
            }

            return {
                user,
                rank,
                recentActions,
            };
        },
        enabled: !!authUser?.id,
        staleTime: 1000 * 60 * 2, // 2 minutes
        retry: 1, // Only retry once to avoid infinite loops
        retryDelay: 1000,
    });
}
