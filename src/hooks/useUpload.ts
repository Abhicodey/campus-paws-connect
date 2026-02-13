import { useState } from 'react';
import { supabase } from '@/lib/supabase';

type BucketType = 'avatars' | 'dogs' | 'gallery';

interface UploadResult {
    path: string | null;
    url: string | null;
    error: string | null;
}

export function useUpload() {
    const [uploading, setUploading] = useState(false);

    const uploadFile = async (
        file: File,
        bucket: BucketType,
        path: string
    ): Promise<UploadResult> => {
        setUploading(true);

        try {
            // Upload file
            const { data, error: uploadError } = await supabase.storage
                .from(bucket)
                .upload(path, file, {
                    contentType: file.type,
                    cacheControl: '3600',
                    upsert: false,
                });

            if (uploadError) {
                setUploading(false);
                return { path: null, url: null, error: uploadError.message };
            }

            // Get public URL
            const { data: urlData } = supabase.storage
                .from(bucket)
                .getPublicUrl(data.path);

            setUploading(false);
            return { path: data.path, url: urlData.publicUrl, error: null };
        } catch (err) {
            setUploading(false);
            return { path: null, url: null, error: 'Upload failed' };
        }
    };

    // Upload user avatar
    const uploadAvatar = async (file: File, userId: string): Promise<UploadResult> => {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${userId}/avatar.${ext}`;
        return uploadFile(file, 'avatars', path);
    };

    // Upload dog profile image
    const uploadDogImage = async (file: File, dogId: string): Promise<UploadResult> => {
        const ext = file.name.split('.').pop() || 'jpg';
        const path = `${dogId}/image.${ext}`;
        return uploadFile(file, 'dogs', path);
    };

    // Upload gallery image — president goes to approved/, students to pending/
    const uploadGalleryImage = async (file: File, userRole?: string): Promise<UploadResult> => {
        const ext = file.name.split('.').pop() || 'jpg';
        const uniqueId = crypto.randomUUID();
        const folder = (userRole === 'president' || userRole === 'admin') ? 'approved' : 'pending';
        const path = `${folder}/${uniqueId}.${ext}`;
        return uploadFile(file, 'gallery', path);
    };

    return {
        uploading,
        uploadAvatar,
        uploadDogImage,
        uploadGalleryImage,
    };
}
