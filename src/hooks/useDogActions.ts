import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { ActionType } from '@/types/database.types';

interface LogActionParams {
    dogId: string;
    actionType: 'feeding' | 'petting' | 'location_update';
    moodRating?: number; // 1-5
    latitude?: number;
    longitude?: number;
    notes?: string;
}

export function useDogActions() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dogId, actionType, moodRating, latitude, longitude, notes }: LogActionParams) => {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                throw new Error('You must be logged in to perform actions');
            }

            const { data, error } = await supabase
                .from('dog_interactions') // Updated table name
                .insert({
                    dog_id: dogId,
                    user_id: user.id,
                    interaction_type: actionType,
                    mood_rating: moodRating || null,
                    latitude: latitude || null,
                    longitude: longitude || null,
                    // notes is not in the schema provided by user for dog_interactions, assuming we drop it or it exists?
                    // User said: id, dog_id, user_id, mood_rating, latitude, longitude, interaction_type, created_at.
                    // Notes was not mentioned. I will omit notes to be safe, or add it if allowed.
                    // I'll assume notes might be useful but sticking to schema strictly first.
                } as any)
                .select()
                .single();

            if (error) {
                throw new Error(error.message);
            }

            // Award points (Field-Workflow System)
            // Feed: 5, Pet: 2, Location: 3
            const pointsMap: Record<string, number> = {
                'feeding': 5,
                'petting': 2,
                'location_update': 3
            };
            const pointsToAward = pointsMap[actionType] || 2;

            try {
                // @ts-ignore - RPC not in types yet
                await supabase.rpc('add_points', {
                    user_id: user.id,
                    points_to_add: pointsToAward
                });
            } catch (err) {
                console.error("Points award failed", err);
                // Don't block flow if points fail
            }

            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['dog', variables.dogId] }); // Refresh profile
            queryClient.invalidateQueries({ queryKey: ['dog-stats', variables.dogId] }); // Refresh stats
            queryClient.invalidateQueries({ queryKey: ['user-profile'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
}
