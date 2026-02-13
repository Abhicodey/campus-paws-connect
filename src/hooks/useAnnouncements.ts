import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

interface CreateAnnouncementParams {
    title: string;
    content: string;
    sendEmail: boolean;
}

export function useCreateAnnouncement() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ title, content, sendEmail }: CreateAnnouncementParams) => {
            // Calculate default expiry (7 days) if needed, or send null and let backend handle
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            const { data: { session } } = await supabase.auth.getSession();

            if (!session) throw new Error("No session");

            const res = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-announcement-email`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${session.access_token}`,
                        "apikey": import.meta.env.VITE_SUPABASE_ANON_KEY,
                    },
                    body: JSON.stringify({
                        title,
                        content,
                    }),
                }
            );

            if (!res.ok) {
                const text = await res.text();
                console.error('Edge Function Error Body:', text); // DEBUG: See who is rejecting it
                throw new Error(text || res.statusText);
            }

            const data = await res.json();
            return data;
        },
        onSuccess: () => {
            // Refresh notifications for all users
            queryClient.invalidateQueries({ queryKey: ['notifications'] });
            // Also refresh announcements list if you have one
            queryClient.invalidateQueries({ queryKey: ['announcements'] });
        },
    });
}
