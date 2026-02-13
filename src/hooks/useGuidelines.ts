import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface Guideline {
    id: string;
    title: string;
    content: string;
    icon: string;
    order_index: number;
    is_active: boolean;
    created_at: string;
}

export function useGuidelines() {
    return useQuery({
        queryKey: ['guidelines'],
        queryFn: async (): Promise<Guideline[]> => {
            const { data, error } = await supabase
                .from('guidelines')
                .select('*')
                .eq('is_active', true)
                .order('order_index', { ascending: true });

            if (error) throw error;
            return data || [];
        },
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

export function useCreateGuideline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (guideline: { title: string; content: string; icon: string; order_index: number }) => {
            const { data: user } = await supabase.auth.getUser();

            const { data, error } = await supabase
                .from('guidelines')
                .insert({
                    ...guideline,
                    created_by: user.user?.id,
                })
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
        },
    });
}

export function useUpdateGuideline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<Guideline> }) => {
            const { data, error } = await supabase
                .from('guidelines')
                .update({ ...updates, updated_at: new Date().toISOString() })
                .eq('id', id)
                .select()
                .single();

            if (error) throw error;
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
        },
    });
}

export function useDeleteGuideline() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: string) => {
            // Soft delete by setting is_active to false
            const { error } = await supabase
                .from('guidelines')
                .update({ is_active: false })
                .eq('id', id);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guidelines'] });
        },
    });
}
