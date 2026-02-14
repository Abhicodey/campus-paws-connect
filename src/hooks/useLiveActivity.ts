import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export interface ActivityItem {
    user: string;
    action: string;
    time: string;
}

export function useLiveActivity() {
    const [activities, setActivities] = useState<ActivityItem[]>([]);

    useEffect(() => {
        // Initial fetch of recent activities
        const fetchRecent = async () => {
            const { data, error } = await supabase
                .from('dog_actions')
                .select(`
          created_at,
          action_type,
          users (username),
          dogs (name)
        `)
                .order('created_at', { ascending: false })
                .limit(5);

            if (data) {
                const formatted = data.map((item: any) => ({
                    user: item.users?.username || 'Someone',
                    action: formatAction(item.action_type, item.dogs?.name),
                    time: formatTime(item.created_at)
                }));
                setActivities(formatted);
            }
        };

        fetchRecent();

        // Subscribe to new activities
        const channel = supabase
            .channel("live-activity")
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "dog_actions" },
                async (payload) => {
                    // On insert, payloads only have IDs. We fetch details for the new ID.
                    const { new: newRecord } = payload;
                    const { data } = await supabase
                        .from('dog_actions')
                        .select(`
                created_at,
                action_type,
                users (username),
                dogs (name)
             `)
                        .eq('id', newRecord.id)
                        .single();

                    if (data) {
                        const newItem = {
                            user: (data as any).users?.username || 'Someone',
                            action: formatAction(data.action_type, (data as any).dogs?.name),
                            time: 'Just now'
                        };
                        setActivities(prev => [newItem, ...prev].slice(0, 10));
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return activities;
}

function formatAction(type: string, dogName?: string) {
    const dog = dogName || 'a dog';
    switch (type) {
        case 'feed': return `fed ${dog}`;
        case 'pet': return `petted ${dog}`;
        case 'location_update': return `spotted ${dog}`;
        default: return `helped ${dog}`;
    }
}

function formatTime(isoString: string) {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}
