import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export function useRecentNotifications() {
  const { authUser } = useAuth();

  return useQuery({
    queryKey: ["recent-notifications", authUser?.id],
    queryFn: async () => {
      if (!authUser) return [];

      const { data, error } = await supabase
        .from("user_notifications")
        .select(`
                  id,
                  is_read,
                  created_at,
                  announcements!user_notifications_announcement_id_fkey (
                    id,
                    title,
                    content,
                    created_at
                  )
                `)
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;

      // Flatten the structure for UI
      return data.map((n: any) => ({
        id: n.id,
        is_read: n.is_read,
        created_at: n.created_at,
        title: n.announcements?.title,
        message: n.announcements?.content,
        type: 'announcement',
      }));
    },
    enabled: !!authUser,
  });
}
