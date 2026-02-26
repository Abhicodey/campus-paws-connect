// @refresh reset
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";
import { withTimeout, DEFAULT_QUERY_TIMEOUT_MS } from "@/lib/queryTimeout";

import { User } from "@/types/database.types";

const PROFILE_LOAD_MAX_MS = 12_000; // Safety: stop showing profile loading after 12s

// UserProfile alias for backward compatibility or clarity
type UserProfile = User;

type AuthContextType = {
    authUser: any;
    profile: UserProfile | null;
    authLoading: boolean;
    profileLoading: boolean;
    isLoggedIn: boolean;
    isPresident: boolean;
    canParticipate: boolean;
    signInWithGoogle: () => Promise<{ error: AuthError | null }>;
    signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>;
    signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    authUser: null,
    profile: null,
    authLoading: true,
    profileLoading: true,
    isLoggedIn: false,
    isPresident: false,
    canParticipate: false,
    signInWithGoogle: async () => ({ error: null }),
    signInWithEmail: async () => ({ error: null }),
    signUp: async () => ({ error: null }),
    signOut: async () => { },
    refreshProfile: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authUser, setAuthUser] = useState<any>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [profileLoading, setProfileLoading] = useState(true);
    // fetchedRef removed as per new hydration logic

    // Generate temporary username from email
    const generateTempUsername = (email: string): string => {
        const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const suffix = Math.floor(1000 + Math.random() * 9000);
        return `${base}_${suffix}`;
    };

    // Fetch profile from public.users (always clears profileLoading when done)
    const fetchProfile = async (userId: string, userEmail?: string) => {
        try {
            const { data, error } = await supabase
                .from("users")
                .select("*")
                .eq("id", userId)
                .maybeSingle();

            if (error || !data) {
                console.error("Profile fetch failed:", error);
                // New users: DB trigger may not have created public.users yet — ensure row, then retry
                await (supabase as any).rpc("ensure_public_user", { user_email: userEmail ?? null });
                await new Promise((r) => setTimeout(r, 800));
                const { data: retryData, error: retryError } = await supabase
                    .from("users")
                    .select("*")
                    .eq("id", userId)
                    .maybeSingle();
                if (!retryError && retryData) {
                    let profileData = retryData as UserProfile;
                    if (profileData.role === "student" && !profileData.username && !profileData.username_pending && userEmail) {
                        const tempUsername = generateTempUsername(userEmail);
                        await (supabase.from("users") as any).update({ username_pending: tempUsername }).eq("id", userId);
                        profileData = { ...profileData, username_pending: tempUsername };
                    }
                    setProfile(profileData);
                    setProfileLoading(false);
                    return;
                }
                setProfileLoading(false);
                return;
            }

            let profileData = data as UserProfile;

            // Check if user is suspended
            if (profileData.is_suspended) {
                // Check if suspension has expired
                if (profileData.suspended_until && new Date(profileData.suspended_until) < new Date()) {
                    // Auto-remove expired suspension
                    await supabase
                        .from("users")
                        // @ts-ignore
                        .update({ is_suspended: false, suspended_until: null, suspended_reason: null } as any)
                        .eq("id", userId);
                    profileData = { ...profileData, is_suspended: false, suspended_until: null, suspended_reason: null };
                } else {
                    // User is still suspended - force logout
                    await supabase.auth.signOut();
                    const reason = profileData.suspended_reason || "Please contact support for details.";
                    alert(`Your account has been suspended.\n\nReason: ${reason}`);
                    setProfileLoading(false);
                    return;
                }
            }

            // Auto-generate username for students without one (only if none set)
            if (
                profileData.role === "student" &&
                !profileData.username &&
                !profileData.username_pending &&
                userEmail
            ) {
                const tempUsername = generateTempUsername(userEmail);

                const { error: updateError } = await supabase
                    .from("users")
                    // @ts-ignore
                    .update({ username_pending: tempUsername } as any)
                    .eq("id", userId);

                if (!updateError) {
                    profileData = { ...profileData, username_pending: tempUsername };
                }
            }

            setProfile(profileData);
        } finally {
            setProfileLoading(false);
        }
    };

    // Refresh profile (for manual refresh after updates)
    const refreshProfile = async () => {
        if (authUser?.id) {
            // Do not set loading state to avoid flicker
            const { data } = await supabase
                .from("users")
                .select("*")
                .eq("id", authUser.id)
                .maybeSingle();

            if (data) {
                // IMPORTANT: Clone the object to force React to detect a state change
                // even if the content is similar. This fixes the avatar not updating.
                const freshProfile = { ...(data as any) } as UserProfile;
                console.log("PROFILE FROM DB:", data);
                console.log("AVATAR PATH:", (data as any)?.avatar_url);
                console.log("NEW PROFILE REF:", freshProfile.avatar_updated_at);
                setProfile(freshProfile);
            }
        }
    };

    useEffect(() => {
        let mounted = true;

        // ── DIAGNOSTIC: check session immediately on mount ──
        supabase.auth.getSession().then(({ data }) => {
            console.log("[AUTH] getSession on mount:", data.session);
        });

        // onAuthStateChange is the SINGLE source of truth for all auth state.
        // This fires INITIAL_SESSION on mount (including after OAuth callback),
        // SIGNED_IN after login, SIGNED_OUT after logout, TOKEN_REFRESHED, etc.
        const { data: listener } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                console.log("[AUTH] Auth event:", event, "| user:", session?.user?.email ?? null);
                if (!mounted) return;

                // INITIAL_SESSION fires on mount — this is what resolves after OAuth.
                // SIGNED_IN fires on explicit login. Both need the same handling.
                if (
                    event === 'INITIAL_SESSION' ||
                    event === 'SIGNED_IN' ||
                    event === 'TOKEN_REFRESHED'
                ) {
                    try {
                        if (session?.user) {
                            setAuthUser(session.user);
                            setProfileLoading(true);
                            await fetchProfile(session.user.id, session.user.email ?? undefined);
                        } else {
                            // No session = definitely not logged in
                            setAuthUser(null);
                            setProfile(null);
                            setProfileLoading(false);
                        }
                    } catch (err) {
                        console.error("[AUTH] Error in auth handler:", err);
                        setProfileLoading(false);
                    } finally {
                        setAuthLoading(false);
                    }
                    return;
                }

                if (event === 'SIGNED_OUT') {
                    setAuthUser(null);
                    setProfile(null);
                    setProfileLoading(false);
                    setAuthLoading(false);
                    return;
                }
            }
        );

        // Safety: if profile is still loading after PROFILE_LOAD_MAX_MS, stop so UI can render
        const safetyTimer = setTimeout(() => {
            setProfileLoading((prev) => (prev ? false : prev));
        }, PROFILE_LOAD_MAX_MS);

        return () => {
            mounted = false;
            clearTimeout(safetyTimer);
            listener.subscription.unsubscribe();
        };
    }, []);


    // Auth actions
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: window.location.origin,
                queryParams: {
                    prompt: "select_account", // Always show Google account picker
                },
            },
        });
        return { error };
    };

    const signInWithEmail = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return { error };
    };

    const signUp = async (email: string, password: string, fullName: string) => {
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
        });
        return { error };
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setAuthUser(null);
        setProfile(null);
        // fetchedRef cleanup removed
    };

    // Computed states
    const isLoggedIn = !!authUser;
    const isPresident = profile?.role === "president" || profile?.role === "admin";
    const canParticipate = isPresident || profile?.username_status === 'approved';

    return (
        <AuthContext.Provider
            value={{
                authUser,
                profile,
                authLoading,
                profileLoading,
                isLoggedIn,
                isPresident,
                canParticipate,
                signInWithGoogle,
                signInWithEmail,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}
