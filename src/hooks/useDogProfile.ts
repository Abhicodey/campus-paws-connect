import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
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

            // Fetch recent actions for this dog
            const { data: recentActions, error: actionsError } = await supabase
                .from('dog_actions')
                .select('*')
                .eq('dog_id', dogId)
                .order('created_at', { ascending: false })
                .limit(10);

            if (actionsError) {
                console.error('Error fetching dog actions:', actionsError);
            }

            return {
                dog: dog as Dog,
                summary: summary as DogSummary | null,
                recentActions: (recentActions || []) as DogAction[],
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
