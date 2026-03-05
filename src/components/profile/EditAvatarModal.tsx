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
            const filePath = `${user.id}.${fileExt}`;

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
            const { error } = await (supabase.from("users") as any)
                .update({
                    avatar_url: publicUrl,
                    avatar_updated_at: new Date().toISOString()
                })
                .eq("id", user.id);

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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">

                <div className="p-5 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">Change Photo</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Profile Picture</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-95">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-7 space-y-7">
                    <div className="flex flex-col items-center gap-5">
                        <div className="relative group cursor-pointer w-40 h-40">
                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-100 shadow-xl relative ring-4 ring-primary/5 transition-all group-hover:ring-primary/20">
                                {previewUrl ? (
                                    <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                        <User className="w-16 h-16 text-gray-300" />
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
                        <p className="text-xs text-gray-500 font-medium text-center leading-relaxed">
                            Tap the photo to upload a new one. <br />
                            Try to use a square image!
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.97]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !avatar}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Photo"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
