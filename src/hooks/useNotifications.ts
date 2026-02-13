import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface Notification {
    id: string;
    user_id: string;
    type: 'announcement' | 'approval' | 'achievement' | 'moderation' | 'system';
    title: string;
    content: string;
    action_url: string | null;
    reference_id: string | null;
    is_read: boolean;
    created_at: string;
}

export function useNotifications(userId: string | undefined) {
    return useQuery({
        queryKey: ['notifications', userId],
        queryFn: async (): Promise<Notification[]> => {
            if (!userId) return [];

            const now = new Date().toISOString();

            // Fetch notifications with joined announcement data
            const { data, error } = await supabase
                .from('user_notifications')
                .select(`
                    id,
                    is_read,
                    created_at,
                    announcements!user_notifications_announcement_id_fkey (
                        title,
                        content
                    )
                `)
                .eq('user_id', userId)
                .or(`expires_at.is.null,expires_at.gt.${now}`)
                .order('created_at', { ascending: false })
                .limit(50);

            if (error) {
                console.error('Error fetching notifications:', error);
                return [];
            }

            // Transform data to match Notification interface
            return (data || []).map((item: any) => ({
                id: item.id,
                user_id: item.user_id || userId,
                type: 'announcement',
                title: item.announcements?.title || 'Notification',
                content: item.announcements?.content || '',
                action_url: null,
                reference_id: null,
                is_read: item.is_read,
                created_at: item.created_at
            }));
        },
        enabled: !!userId,
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useUnreadCount(userId: string | undefined) {
    return useQuery({
        queryKey: ['notifications-unread', userId],
        queryFn: async (): Promise<number> => {
            if (!userId) return 0;

            const { count, error } = await supabase
                .from('user_notifications')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) {
                console.error('Error fetching unread count:', error);
                return 0;
            }

            return count || 0;
        },
        enabled: !!userId,
        staleTime: 1000 * 30, // 30 seconds
    });
}

export function useMarkAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (notificationId: string) => {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('id', notificationId);

            if (error) throw error;
        },
        onSuccess: () => {
            // Invalidate both queries to refresh data
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        },
    });
}

export function useMarkAllAsRead() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from('user_notifications')
                .update({ is_read: true })
                .eq('user_id', userId)
                .eq('is_read', false);

            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            queryClient.invalidateQueries({ queryKey: ['notifications-unread'] });
        },
    });
}
