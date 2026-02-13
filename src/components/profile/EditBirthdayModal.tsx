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
            const { error } = await supabase
                .from("users")
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in duration-200">

                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <h2 className="font-semibold text-lg flex items-center gap-2">
                        <Cake className="w-5 h-5 text-primary" />
                        {isFirstTime ? "Add Birthday" : "Edit Birthday"}
                    </h2>
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
                                <p className="text-xs opacity-90">
                                    You can change your birthday again in {cooldownDaysLeft} days.
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">Your Birthday</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={birthdate}
                                onChange={(e) => setBirthdate(e.target.value)}
                                max={maxDate}
                                disabled={inCooldown}
                                className="w-full border border-gray-300 p-2.5 pl-10 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all disabled:bg-gray-100 disabled:text-gray-500 cursor-pointer"
                            />
                            <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                        </div>
                        <p className="text-xs text-muted-foreground">
                            We use this to send you a surprise on your special day! 🎁
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
                            disabled={loading || inCooldown || !birthdate}
                            className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Date"}
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
