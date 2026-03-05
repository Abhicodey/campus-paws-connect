import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import type { Dog, DogSummary, DogAction } from '@/types/database.types';

interface DogProfileData {
    dog: Dog;
    summary: DogSummary | null;
    recentActions: DogAction[];
}

export function useDogProfile(dogId: string | undefined) {
    return useQuery({
        queryKey: ['dog', dogId],
        queryFn: async (): Promise<DogProfileData | null> => {
            if (!dogId) return null;

            // Fetch dog details
            const { data: dog, error: dogError } = await supabase
                .from('dogs')
                .select('*')
                .eq('id', dogId)
                .eq('verified', true)
                .eq('is_active', true)
                .single();

            if (dogError || !dog) {
                console.error('Error fetching dog:', dogError);
                return null;
            }

            // Fetch dog summary from view
            const { data: summary, error: summaryError } = await supabase
                .from('dog_summary')
                .select('*')
                .eq('dog_id', dogId)
                .single();

            if (summaryError) {
                console.error('Error fetching dog summary:', summaryError);
            }

            // Fetch recent actions for this dog (from interactions log)
            const { data: recentActions, error: actionsError } = await supabase
                .from('dog_interactions')
                .select('*')
                .eq('dog_id', dogId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (actionsError) {
                console.error('Error fetching dog interactions:', actionsError);
            }

            return {
                dog: dog as Dog,
                summary: summary as DogSummary | null,
                recentActions: (recentActions || []) as any[],
            };
        },
        enabled: !!dogId,
        staleTime: 1000 * 60 * 2, // 2 minutes
    });
}

// Hook to find a dog by QR code
export function useDogByQRCode(qrCode: string | undefined) {
    return useQuery<{ id: string; name: string } | null>({
        queryKey: ['dog-qr', qrCode],
        queryFn: async () => {
            if (!qrCode) return null;

            const { data, error } = await supabase
                .from('dogs')
                .select('id, name')
                .eq('qr_code', qrCode)
                .eq('verified', true)
                .eq('is_active', true)
                .single();

            if (error) {
                console.error('Error finding dog by QR:', error);
                return null;
            }

            return data;
        },
        enabled: !!qrCode,
    });
}

export function useUpdateDogLocation() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            dogId,
            lat,
            lng,
        }: {
            dogId: string;
            lat: number;
            lng: number;
        }) => {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) throw new Error("Authentication required");

            // Simply insert into the interactions log
            // The DB trigger handle_point_award will:
            // 1. Update public.dogs with the new lat/lng
            // 2. Award 5 points to the user
            const { error } = await supabase.from("dog_interactions").insert({
                dog_id: dogId,
                user_id: user.id,
                interaction_type: "location_update",
                latitude: lat,
                longitude: lng,
            } as any);

            if (error) throw new Error(error.message);

            return dogId;
        },
        onSuccess: (dogId) => {
            queryClient.invalidateQueries({ queryKey: ["dog", dogId] });
            queryClient.invalidateQueries({ queryKey: ["dog-stats", dogId] });
            queryClient.invalidateQueries({ queryKey: ["leaderboard"] });
            queryClient.invalidateQueries({ queryKey: ["user-profile"] });
            toast({
                title: "Location Updated",
                description: "GPS coordinates recorded! 📍",
            });
        },
    });
}
