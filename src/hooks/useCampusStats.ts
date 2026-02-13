import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CampusStats {
    totalDogs: number;
    actionsToday: number;
    totalMembers: number;
}

export function useCampusStats() {
    return useQuery({
        queryKey: ['campus-stats'],
        queryFn: async (): Promise<CampusStats> => {
            // Count verified dogs
            const { count: totalDogs, error: dogsError } = await supabase
                .from('dogs')
                .select('*', { count: 'exact', head: true })
                .eq('verified', true)
                .eq('is_active', true);

            if (dogsError) {
                console.error('Error counting dogs:', dogsError);
            }

            // Count actions today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { count: actionsToday, error: actionsError } = await supabase
                .from('dog_actions')
                .select('*', { count: 'exact', head: true })
                .gte('created_at', today.toISOString());

            if (actionsError) {
                console.error('Error counting actions:', actionsError);
            }

            // Count active members
            const { count: totalMembers, error: membersError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            if (membersError) {
                console.error('Error counting members:', membersError);
            }

            return {
                totalDogs: totalDogs || 0,
                actionsToday: actionsToday || 0,
                totalMembers: totalMembers || 0,
            };
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
