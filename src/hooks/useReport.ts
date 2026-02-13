import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface ReportParams {
    reported_by: string;
    reported_user: string;
    target_type: 'user' | 'image' | 'dog';
    target_id: string;
    reason: string;
}

export function useReportContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (params: ReportParams) => {
            const { error } = await supabase
                .from('user_reports')
                .insert({
                    reported_by: params.reported_by,
                    reported_user: params.reported_user,
                    target_type: params.target_type,
                    // Critical Fix: For user reports, target_id MUST equal reported_user
                    // This prevents the "invisible report" bug in President Console
                    target_id: params.target_type === 'user' ? params.reported_user : params.target_id,
                    reason: params.reason,
                    status: 'pending',
                } as any);

            if (error) {
                // Handle rate-limit (unique constraint on reported_by + date)
                if (error.code === '23505') {
                    throw new Error('RATE_LIMITED');
                }
                throw new Error(error.message);
            }

            // 2. Hide content immediately (Frontend-side enforcement)
            if (params.target_type === 'image') {
                await supabase
                    .from('gallery_images')
                    .update({ is_hidden: true })
                    .eq('id', params.target_id);
            } else if (params.target_type === 'dog') {
                await supabase
                    .from('dogs')
                    .update({ is_hidden: true })
                    .eq('id', params.target_id);
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'user-reports'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            queryClient.invalidateQueries({ queryKey: ['dogs'] }); // Invalidate dogs too
            toast({
                title: "Report submitted 🚩",
                description: "Thank you. This content has been hiddden and flagged for review.",
            });
        },
        onError: (err: Error) => {
            if (err.message === 'RATE_LIMITED') {
                toast({
                    title: "Already reported today",
                    description: "You can submit one report per day. Thank you for helping keep the community safe.",
                    variant: "destructive",
                });
            } else if (err.message.includes('row-level security') || err.message.includes('permission denied')) {
                toast({
                    title: "Cannot report this content",
                    description: "This content is protected and cannot be reported.",
                    variant: "destructive",
                });
            } else {
                toast({
                    title: "Report failed",
                    description: err.message,
                    variant: "destructive",
                });
            }
        },
    });
}
