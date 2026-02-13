import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getGalleryImageUrl } from '@/lib/galleryUtils';
import type { Dog, GalleryImage, User, UserReport } from '@/types/database.types';

// ============================================================================
// DEV HELPERS - Debug logging for admin queries
// ============================================================================

const isDev = import.meta.env.DEV;

function logAdminQuery(queryName: string, data: any, error: any) {
    if (isDev) {
        console.log(`[ADMIN QUERY] ${queryName}:`, {
            count: data?.length ?? 0,
            data,
            error,
            timestamp: new Date().toISOString()
        });
    }
}

function assertAdminData(queryName: string, data: any[], role: string | undefined) {
    if (isDev && role === 'president' && data.length === 0) {
        console.warn(`[ADMIN WARNING] ${queryName}: Empty data for president. Verify RLS if data expected.`);
    }
}

// ============================================================================
// PENDING USERNAME REQUESTS (Centralized - Most Important)
// ============================================================================

export interface UsernameRequest {
    id: string;
    requested_username: string | null;
    username: string | null;
    username_verified: boolean;
    role: string;
    created_at: string;
}

export function usePendingUsernames() {
    const { isPresident, profile } = useAuth();

    return useQuery({
        queryKey: ['admin', 'pending-usernames'],
        queryFn: async () => {
            // DEBUG: First fetch ALL users to see the actual column structure
            const { data: allUsers, error: debugError } = await supabase
                .from('users')
                .select('*')
                .limit(10);

            if (isDev) {
                console.log('[DEBUG] ALL USERS (first 10):', allUsers);
                console.log('[DEBUG] Sample user structure:', allUsers?.[0]);
                console.log('[DEBUG] Error:', debugError);
            }

            // Now try the actual query with only requested_username filter
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .not('requested_username', 'is', null)
                .order('created_at', { ascending: true });

            // DEV: Log query result
            logAdminQuery('usePendingUsernames', data, error);

            if (error) {
                console.error('[ADMIN ERROR] usePendingUsernames:', error);
                throw new Error(`Permission denied or query failed: ${error.message}`);
            }

            // DEV: Warn if empty for president
            assertAdminData('usePendingUsernames', data || [], profile?.role);

            return (data || []) as UsernameRequest[];
        },
        enabled: isPresident,
        retry: 1,
    });
}

// ============================================================================
// PENDING DOGS
// ============================================================================

export function usePendingDogs() {
    const { isPresident, profile } = useAuth();

    return useQuery({
        queryKey: ['admin', 'pending-dogs'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dogs')
                .select(`
                    *,
                    creator:created_by (username)
                `)
                .eq('verified', false)
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            logAdminQuery('usePendingDogs', data, error);

            if (error) {
                console.error('[ADMIN ERROR] usePendingDogs:', error);
                throw new Error(`Permission denied or query failed: ${error.message}`);
            }

            assertAdminData('usePendingDogs', data || [], profile?.role);

            return (data || []) as (Dog & { creator: { username: string | null } | null })[];
        },
        enabled: isPresident,
        retry: 1,
    });
}

// ============================================================================
// PENDING GALLERY IMAGES
// ============================================================================

export function usePendingImages() {
    const { isPresident, profile } = useAuth();

    return useQuery({
        queryKey: ['admin', 'pending-images'],
        queryFn: async () => {
            const { data, error, count } = await supabase
                .from('gallery_images')
                .select('*', { count: 'exact' })
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            console.log('[ADMIN][PENDING IMAGES RAW]', { data, error, count });

            logAdminQuery('usePendingImages', data, error);

            if (error) {
                console.error('[ADMIN ERROR] usePendingImages:', error);
                throw new Error(`Permission denied or query failed: ${error.message}`);
            }

            assertAdminData('usePendingImages', data || [], profile?.role);

            // Generate display URLs from file paths
            const images = (data || []) as any[];
            return images.map((img) => ({
                ...img,
                display_url: getGalleryImageUrl(img.file_path),
            }));
        },
        enabled: isPresident,
        retry: 1,
    });
}

// ============================================================================
// USER REPORTS
// ============================================================================

export function useUserReports() {
    const { isPresident, profile } = useAuth();

    return useQuery({
        queryKey: ['admin', 'user-reports'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('user_reports')
                .select('*')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            logAdminQuery('useUserReports', data, error);

            if (error) {
                console.error('[ADMIN ERROR] useUserReports:', error);
                throw new Error(`Permission denied or query failed: ${error.message}`);
            }

            assertAdminData('useUserReports', data || [], profile?.role);

            return (data || []) as any[];
        },
        enabled: isPresident,
        retry: 1,
    });
}

// ============================================================================
// MUTATIONS - Approve/Reject actions
// ============================================================================

export function useApproveDog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ dogId, name, qrCode }: { dogId: string; name: string; qrCode: string }) => {
            // Validate QR code is provided
            if (!qrCode || !qrCode.trim()) {
                throw new Error('QR code is required for verification');
            }

            const updateData: any = {
                verified: true,
                is_verified: true,
                status: 'approved',
                official_name: name,
                name: name,
                name_locked: true,
                qr_code: qrCode.trim(), // Physical collar QR code
            };

            const { error } = await supabase
                .from('dogs')
                .update(updateData)
                .eq('id', dogId);

            if (error) {
                // Handle unique constraint violation
                if (error.code === '23505') {
                    throw new Error('This QR code is already assigned to another dog');
                }
                throw new Error(error.message);
            }
            return dogId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-dogs'] });
            queryClient.invalidateQueries({ queryKey: ['dogs'] });
        },
    });
}

export function useRejectDog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (dogId: string) => {
            const { error } = await supabase
                .from('dogs')
                .update({ is_active: false } as any)
                .eq('id', dogId);

            if (error) throw new Error(error.message);
            return dogId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-dogs'] });
        },
    });
}

export function useApproveImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (imageId: string) => {
            // 1. Get current image data
            const { data: img, error: fetchError } = await supabase
                .from('gallery_images')
                .select('file_path')
                .eq('id', imageId)
                .single();

            if (fetchError || !img) throw new Error(fetchError?.message || 'Image not found');

            const oldPath = (img as any).file_path;
            let newPath = oldPath;

            // 2. Move file from pending/ to approved/ in storage
            if (oldPath && oldPath.startsWith('pending/')) {
                newPath = oldPath.replace('pending/', 'approved/');
                const { error: moveError } = await supabase.storage
                    .from('gallery')
                    .move(oldPath, newPath);

                if (moveError) {
                    console.error('[ADMIN] Move error:', moveError);
                    // Still approve in DB even if move fails
                }
            }

            // 3. Update DB: set status to approved, update file_path
            const { error } = await supabase
                .from('gallery_images')
                .update({
                    status: 'approved',
                    file_path: newPath,
                } as any)
                .eq('id', imageId);

            if (error) throw new Error(error.message);
            return imageId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-images'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
        },
    });
}

export function useRejectImage() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (imageId: string) => {
            // 1. Get current image data
            const { data: img, error: fetchError } = await supabase
                .from('gallery_images')
                .select('file_path')
                .eq('id', imageId)
                .single();

            if (fetchError || !img) throw new Error(fetchError?.message || 'Image not found');

            // 2. Delete file from storage
            const filePath = (img as any).file_path;
            if (filePath) {
                await supabase.storage
                    .from('gallery')
                    .remove([filePath]);
            }

            // 3. Delete DB row
            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', imageId);

            if (error) throw new Error(error.message);
            return imageId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-images'] });
        },
    });
}

export function useApproveUsername() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, username }: { userId: string; username: string }) => {
            if (isDev) {
                console.log('[ADMIN MUTATION] Approving username:', { userId, username });
            }

            // First get current user data
            const { data: userData, error: fetchError } = await supabase
                .from('users')
                .select('requested_username')
                .eq('id', userId)
                .single();

            if (fetchError) throw new Error(fetchError.message);
            if (!userData) throw new Error('User not found');

            // Approve: set username, clear requested_username, set verified
            const { error } = await supabase
                .from('users')
                .update({
                    username: userData.requested_username,
                    requested_username: null,
                    username_verified: true,
                } as any)
                .eq('id', userId);

            if (error) throw new Error(error.message);
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-usernames'] });
            queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
        },
    });
}

export function useRejectUsername() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            if (isDev) {
                console.log('[ADMIN MUTATION] Rejecting username:', userId);
            }

            const { error } = await supabase
                .from('users')
                .update({ requested_username: null } as any)
                .eq('id', userId);

            if (error) throw new Error(error.message);
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'pending-usernames'] });
        },
    });
}

export function useHideUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            const { error } = await supabase
                .from('users')
                .update({ is_hidden: true } as any)
                .eq('id', userId);

            if (error) throw new Error(error.message);
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin'] });
        },
    });
}

export function useDismissReport() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reportId: string) => {
            const { error } = await supabase
                .from('user_reports')
                .update({ status: 'dismissed' } as any)
                .eq('id', reportId);

            if (error) throw new Error(error.message);
            return reportId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'user-reports'] });
        },
    });
}

export function useMarkActionTaken() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (reportId: string) => {
            const { error } = await supabase
                .from('user_reports')
                .update({ status: 'action_taken' } as any)
                .eq('id', reportId);

            if (error) throw new Error(error.message);
            return reportId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'user-reports'] });
        },
    });
}

export function useRestoreContent() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ reportId, targetType, targetId }: { reportId: string; targetType: string; targetId: string }) => {
            // 1. Restore content by setting status back to approved
            if (targetType === 'image') {
                await supabase
                    .from('gallery_images')
                    .update({ status: 'approved', is_hidden: false } as any)
                    .eq('id', targetId);
            } else if (targetType === 'dog') {
                await supabase
                    .from('dogs')
                    .update({ status: 'approved', verified: true, is_hidden: false } as any)
                    .eq('id', targetId);
            }

            // 2. Dismiss the report (since content was restored, report was likely invalid)
            const { error } = await supabase
                .from('user_reports')
                .update({ status: 'dismissed' } as any)
                .eq('id', reportId);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'user-reports'] });
            queryClient.invalidateQueries({ queryKey: ['gallery'] });
            queryClient.invalidateQueries({ queryKey: ['dogs'] });
        },
    });
}
// ============================================================================
// SUPERADMIN - USER MANAGEMENT
// ============================================================================

export function useAllUsers() {
    const { profile } = useAuth();
    // Only fetch if super_admin
    const isSuperAdmin = profile?.is_super_admin;

    return useQuery({
        queryKey: ['admin', 'all-users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data as User[];
        },
        enabled: !!isSuperAdmin,
    });
}

export function useUpdateUserRole() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ userId, role }: { userId: string; role: 'student' | 'president' | 'admin' }) => {
            const { error } = await supabase
                .from('users')
                .update({ role } as any)
                .eq('id', userId);

            if (error) throw new Error(error.message);
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'all-users'] });
        },
    });
}

export function useDeleteUser() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (userId: string) => {
            // Note: This might fail if user has foreign key dependencies (dogs, images, etc.)
            // Ideal production system uses soft delete (is_active = false)
            // But user explicitly asked for "Delete" button and "delete()".
            // I will try delete, fallback to soft delete if FK error? 
            // User requested: await supabase.from('users').delete().eq('id', id);
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('id', userId);

            if (error) throw new Error(error.message);
            return userId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin', 'all-users'] });
        },
    });
}
