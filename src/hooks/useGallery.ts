import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { getGalleryImageUrl } from '@/lib/galleryUtils';

export interface GalleryImageRow {
    id: string;
    user_id: string;
    file_path: string;
    status: 'pending' | 'approved';
    is_hidden?: boolean;
    created_at: string;
}

export interface UserInfo {
    id: string;
    username: string | null;
    avatar_url: string | null;
}

export interface GalleryImageWithUrl extends GalleryImageRow {
    display_url: string;
    users: UserInfo | null;
}

export function useGallery() {
    return useQuery({
        queryKey: ['gallery'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_images')
                .select(`
                    *,
                    users (
                        id,
                        username,
                        avatar_url
                    )
                `)
                .eq('status', 'approved')
                .neq('is_hidden', true)
                .order('created_at', { ascending: false });

            if (error) {
                throw new Error(error.message);
            }

            // Generate display URLs from file paths
            const images = (data ?? []) as any[];
            return images.map((img) => ({
                ...img,
                display_url: getGalleryImageUrl(img.file_path),
            })) as GalleryImageWithUrl[];
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}
