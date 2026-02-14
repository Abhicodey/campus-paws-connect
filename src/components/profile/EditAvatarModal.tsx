import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, Upload, User } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { useAuth } from "@/contexts/AuthContext";

interface EditAvatarModalProps {
    user: SupabaseUser;
    profile: any;
    onClose: () => void;
}

export default function EditAvatarModal({ user, profile, onClose }: EditAvatarModalProps) {
    const { refreshProfile } = useAuth();
    const [avatar, setAvatar] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile.avatar_url || null);
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatar(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    async function handleSubmit() {
        if (!avatar) return;
        setLoading(true);
        try {
            const fileExt = avatar.name.split(".").pop();
            // CORRECT PATH: userId/avatar.ext (Overwrite same file)
            const filePath = `${user.id}/avatar.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from("avatars")
                .upload(filePath, avatar, { upsert: true });

            if (uploadError) throw uploadError;

            // get public url
            const { data: publicUrlData } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            const publicUrl = publicUrlData.publicUrl;

            // Update directly
            const { error, data: updateData } = await supabase
                .from("users")
                .update({
                    avatar_url: publicUrl,
                    avatar_status: profile.role === 'president' ? 'approved' : 'pending',
                    avatar_updated_at: new Date().toISOString()
                })
                .eq("id", user.id)
                .select();

            console.log("DB UPDATE RESULT:", updateData, error);

            if (error) throw error;

            toast.success("Avatar updated successfully!");

            // Refresh profile to update UI immediately
            await refreshProfile();

            // Invalidate queries to refresh UI immediately
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });
            await supabase.auth.refreshSession();

            onClose();
        } catch (error: any) {
            console.error("Error updating avatar:", error);
            toast.error(error.message || "Failed to update avatar");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-lg">Change Profile Photo</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    <div className="flex flex-col items-center gap-4">
                        <div className="relative group cursor-pointer w-32 h-32">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-sm relative">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                        <User className="w-12 h-12 text-gray-400" />
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                                    <Upload className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                            />
                        </div>
                        <p className="text-sm text-muted-foreground">Tap photo to select new image</p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 border py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !avatar}
                            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Photo"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
