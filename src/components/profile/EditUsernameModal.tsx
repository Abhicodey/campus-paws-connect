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
                // President Bypass: Direct Update (Atomic)
                updates.username = username;
                updates.username_status = 'approved';
                updates.username_pending = null;
                updates.username_last_changed = new Date().toISOString();
                updates.next_username_change = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
            } else {
                // Normal User: Just set pending
                // The trigger 'prevent_early_username_change' will auto-set status to 'pending'
                updates.username_pending = username;
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">

                {/* Header with Glassmorphism feel */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">Change Username</h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Community Identity</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-all active:scale-95">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <div className="p-7 space-y-5">
                    {inCooldown && (
                        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm flex items-start gap-3 animate-in slide-in-from-top-2">
                            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-amber-500" />
                            <div>
                                <p className="font-bold">Cooldown Active</p>
                                <p className="text-xs opacity-80 leading-relaxed">Safety first! You can update your identity again in {cooldownDays} days.</p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">New Username</label>
                        <div className="relative group">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium group-focus-within:text-primary transition-colors">@</span>
                            <input
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                disabled={!!inCooldown}
                                className="w-full border border-gray-200 bg-gray-50/50 pl-9 pr-4 py-3.5 rounded-xl 
                                    text-gray-900 font-medium placeholder:text-gray-400
                                    focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white
                                    outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                                maxLength={20}
                            />
                        </div>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 ml-1">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            Requires approval by the president.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-3">
                        <button
                            onClick={onClose}
                            className="flex-1 border-2 border-gray-100 py-3 rounded-xl font-bold text-gray-600 hover:bg-gray-50 hover:border-gray-200 transition-all active:scale-[0.97]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !!inCooldown || !username.trim()}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Request Change"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
