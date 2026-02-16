import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CampusStats {
    totalDogs: number;
    actionsToday: number;
    totalMembers: number;
    totalPhotos: number;
    totalFeeds: number;
}

export function useCampusStats() {
    return useQuery({
        queryKey: ['campus-stats'],
        queryFn: async (): Promise<CampusStats> => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Parallel execution for all stats
            const [
                { count: totalDogs },
                { count: actionsToday },
                { count: totalMembers },
                { count: totalPhotos },
                { count: totalFeeds }
            ] = await Promise.all([
                // 1. Total Verified Dogs
                supabase
                    .from('dogs')
                    .select('*', { count: 'exact', head: true })
                    .eq('verified', true)
                    .eq('is_active', true),

                // 2. Actions Today
                supabase
                    .from('dog_actions')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', today.toISOString()),

                // 3. Active Members
                supabase
                    .from('users')
                    .select('*', { count: 'exact', head: true })
                    .eq('is_active', true),

                // 4. Total Approved Photos
                supabase
                    .from('gallery_images')
                    .select('*', { count: 'exact', head: true })
                    .eq('status', 'approved')
                    .neq('is_hidden', true),

                // 5. Total Feeds (All time)
                supabase
                    .from('dog_actions')
                    .select('*', { count: 'exact', head: true })
                    .eq('action_type', 'feed')
            ]);

            return {
                totalDogs: totalDogs || 0,
                actionsToday: actionsToday || 0,
                totalMembers: totalMembers || 0,
                totalPhotos: totalPhotos || 0,
                totalFeeds: totalFeeds || 0,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

