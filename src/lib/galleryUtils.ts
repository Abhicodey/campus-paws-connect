import { supabase } from '@/lib/supabase';

/**
 * Generate a public URL from a gallery file path.
 * Handles both relative paths (pending/uuid.png) and full URLs (backwards compat).
 */
export function getGalleryImageUrl(filePathOrUrl: string): string {
    // If it's already a full URL, return as-is (backwards compatibility)
    if (filePathOrUrl.startsWith('http://') || filePathOrUrl.startsWith('https://')) {
        return filePathOrUrl;
    }

    // Generate public URL from relative path
    const { data } = supabase.storage
        .from('gallery')
        .getPublicUrl(filePathOrUrl);

    return data.publicUrl;
}
