import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2, X, Cake, AlertTriangle, Calendar } from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface EditBirthdayModalProps {
    user: SupabaseUser;
    profile: any;
    onClose: () => void;
}

export default function EditBirthdayModal({ user, profile, onClose }: EditBirthdayModalProps) {
    // Initialize with existing birthdate or empty
    const [birthdate, setBirthdate] = useState(profile.birthdate || "");
    const [loading, setLoading] = useState(false);
    const queryClient = useQueryClient();

    // Cooldown calculation
    const lastUpdate = profile.birthdate_updated_at ? new Date(profile.birthdate_updated_at) : null;

    // Check if cooldown applies (7 days)
    // Cooldown applies ONLY if:
    // 1. Birthdate is already set (not null)
    // 2. Last update was within 7 days
    const isFirstTime = !profile.birthdate;
    const daysSinceUpdate = lastUpdate ? (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24) : 999;
    const inCooldown = !isFirstTime && daysSinceUpdate < 7;
    const cooldownDaysLeft = Math.ceil(7 - daysSinceUpdate);

    async function handleSubmit() {
        if (inCooldown) {
            toast.error(`You can change your birthday again in ${cooldownDaysLeft} days.`);
            return;
        }

        setLoading(true);
        try {
            const { error } = await (supabase.from("users") as any)
                .update({
                    birthdate: birthdate,
                    // birthdate_updated_at is handled by DB trigger
                })
                .eq("id", user.id);

            if (error) throw error;

            toast.success("Birthday updated successfully! 🎂");

            // Invalidate queries
            queryClient.invalidateQueries({ queryKey: ['profile'] });
            queryClient.invalidateQueries({ queryKey: ['user'] });

            onClose();
        } catch (error: any) {
            console.error("Error updating birthday:", error);
            // Handle trigger error message specifically if needed, though toast shows error.message usually
            if (error.message?.includes('every 7 days')) {
                toast.error("You can change your birthday only once every 7 days.");
            } else {
                toast.error(error.message || "Failed to update birthday");
            }
        } finally {
            setLoading(false);
        }
    }

    // Get max date (today) to prevent future birthdays
    const maxDate = new Date().toISOString().split("T")[0];

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200 border border-white/20">

                <div className="p-5 border-b flex justify-between items-center bg-gray-50/80 backdrop-blur-sm">
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                            <Cake className="w-5 h-5 text-primary" />
                            {isFirstTime ? "Add Birthday" : "Edit Birthday"}
                        </h2>
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mt-0.5">Special Celebration</p>
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
                                <p className="text-xs opacity-80 leading-relaxed">
                                    Patience is a virtue! You can update your celebration date again in {cooldownDaysLeft} days.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2.5">
                        <label className="text-sm font-semibold text-gray-700 ml-1">Your Birthday</label>
                        <div className="relative group">
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={maxDate}
                                disabled={inCooldown}
                                className="w-full border border-gray-200 bg-gray-50/50 pl-11 pr-4 py-3.5 rounded-xl 
                                    text-gray-900 font-medium cursor-pointer
                                    focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white
                                    outline-none transition-all disabled:opacity-50 disabled:bg-gray-100 disabled:text-gray-400"
                            />
                            <Calendar className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-primary transition-colors pointer-events-none" />
                        </div>
                        <p className="text-[11px] text-gray-500 flex items-center gap-1 ml-1">
                            <span className="w-1 h-1 rounded-full bg-primary" />
                            We use this to send you a surprise on your special day! 🎁
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
                            disabled={loading || inCooldown || !birthdate}
                            className="flex-1 bg-primary text-white py-3 rounded-xl font-bold hover:shadow-lg hover:shadow-primary/30 transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Date"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
