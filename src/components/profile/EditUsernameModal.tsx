import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, AlertTriangle } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditUsernameModalProps {
    user: SupabaseUser;
    profile: any;
    onClose: () => void;
}

export default function EditUsernameModal({ user, profile, onClose }: EditUsernameModalProps) {
    const [username, setUsername] = useState(profile.username_pending || profile.username || "");
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Cooldown calculation
    const nextChange = profile.next_username_change ? new Date(profile.next_username_change) : null;
    const inCooldown = nextChange && nextChange > new Date();
    const cooldownDays = inCooldown ? Math.ceil((nextChange!.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

    async function handleSubmit() {
        if (inCooldown && username !== (profile.username_pending || profile.username)) {
            toast.error("Cooldown active.");
            return;
        }

        setLoading(true);
        try {
            const isPresident = profile.role === 'president';
            const updates: any = {};

            if (isPresident) {
                // President Bypass: Direct Update
                updates.username = username;
                updates.username_status = 'approved';
                updates.username_pending = null;
                // updates.username_updated_at = new Date().toISOString(); // Optional if needed
            } else {
                // Normal User: Request Change
                updates.username_pending = username !== profile.username ? username : null;

                if (updates.username_pending) {
                    updates.username_status = "pending";
                } else if (username === profile.username) {
                    // Reverting request
                    updates.username_pending = null;
                    updates.username_status = "approved";
                }
            }

            const { error } = await (supabase.from("users") as any)
                .update(updates)
                .eq("id", user.id);

            if (error) throw error;

            // Refresh session to update metadata
            const { error: sessionError } = await supabase.auth.refreshSession();
            if (sessionError) console.error("Session refresh error:", sessionError);
            await supabase.auth.getUser(); // Force update user object

            if (profile.role === 'president') {
                toast.success("Username updated successfully! 🛡️");
            } else {
                toast.success("Username request sent!");
            }

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });

            onClose();
        } catch (error: any) {
            console.error("Error updating username:", error);
            toast.error(error.message || "Failed to update username");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-lg">Change Username</h2>
                    <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {inCooldown && (
                        <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-3 rounded-lg text-sm flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                            <div>
                                <p className="font-medium">Cooldown Active</p>
                                <p className="text-xs opacity-90">You can change your username again in {cooldownDays} days.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">New Username</label>
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter username"
                            disabled={!!inCooldown}
                            className="w-full border border-gray-300 p-2.5 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500"
                            maxLength={20}
                        />
                        <p className="text-xs text-muted-foreground">
                            3-20 characters. Requires approval.
                        </p>
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
                            disabled={loading || !!inCooldown || !username.trim()}
                            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Request Change"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
