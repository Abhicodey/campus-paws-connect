// @refresh reset
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { AuthError } from "@supabase/supabase-js";

// Profile type from public.users (NOT auth.users)
interface UserProfile {
    id: string;
    role: "student" | "president" | "admin";
    username: string | null;
    username_verified: boolean;
    avatar_url: string | null;
    points: number;
    created_at?: string;
    requested_username?: string | null;
    is_super_admin?: boolean;
    is_suspended?: boolean;
    suspended_until?: string | null;
    suspended_reason?: string | null;
    username_status?: 'approved' | 'pending' | 'rejected';
    avatar_status?: 'approved' | 'pending' | 'rejected';
    username_pending?: string | null;
    avatar_pending?: string | null;
    next_username_change?: string | null;
    avatar_updated_at?: string | null;
    birthdate?: string | null;
    birth_month?: number | null;
    birth_day?: number | null;
    birthdate_updated_at?: string | null;
}

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
    const fetchedRef = useRef(false);

    // Generate temporary username from email
    const generateTempUsername = (email: string): string => {
        const base = email.split("@")[0].replace(/[^a-zA-Z0-9]/g, "").toLowerCase();
        const suffix = Math.floor(1000 + Math.random() * 9000);
        return `${base}_${suffix}`;
    };

    // Fetch profile from public.users
    const fetchProfile = async (userId: string, userEmail?: string) => {
        const { data, error } = await supabase
            .from("users")
            .select(`
                id,
                role,
                username,
                username_verified,
                avatar_url,
                points,
                requested_username,
                is_super_admin,
                is_suspended,
                suspended_until,
                suspended_reason,
                username_status,
                avatar_status,
                username_pending,
                avatar_pending,
                next_username_change,
                avatar_updated_at,
                birthdate,
                birth_month,
                birth_day,
                birthdate_updated_at
            `)
            .eq("id", userId)
            .single();

        if (error || !data) {
            console.error("Profile fetch failed:", error);
            setProfileLoading(false);
            return;
        }

        let profileData = data as UserProfile;
        console.log("ROLE FROM DB:", profileData.role);

        // Check if user is suspended
        if (profileData.is_suspended) {
            // Check if suspension has expired
            if (profileData.suspended_until && new Date(profileData.suspended_until) < new Date()) {
                // Auto-remove expired suspension
                await supabase
                    .from("users")
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

        // Auto-generate username for students without one
        if (
            profileData.role === "student" &&
            !profileData.username &&
            !profileData.requested_username &&
            userEmail
        ) {
            const tempUsername = generateTempUsername(userEmail);
            console.log("Auto-generating username:", tempUsername);

            const { error: updateError } = await supabase
                .from("users")
                .update({ requested_username: tempUsername } as any)
                .eq("id", userId);

            if (!updateError) {
                profileData = { ...profileData, requested_username: tempUsername };
            }
        }

        setProfile(profileData);
        setProfileLoading(false);
    };

    // Refresh profile (for manual refresh after updates)
    const refreshProfile = async () => {
        if (authUser?.id) {
            // Do not set loading state to avoid flicker
            const { data } = await supabase
                .from("users")
                .select(`
                    id,
                    role,
                    username,
                    username_verified,
                    avatar_url,
                    points,
                    requested_username,
                    is_super_admin,
                    is_suspended,
                    suspended_until,
                    suspended_reason,
                    username_status,
                    avatar_status,
                    username_pending,
                    avatar_pending,
                    next_username_change,
                    avatar_updated_at,
                    birthdate,
                    birth_month,
                    birth_day,
                    birthdate_updated_at
                `)
                .eq("id", authUser.id)
                .single();

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
        // Get initial session
        supabase.auth.getSession().then(({ data }) => {
            const user = data.session?.user ?? null;
            setAuthUser(user);
            setAuthLoading(false);

            if (user && !fetchedRef.current) {
                fetchedRef.current = true;
                fetchProfile(user.id, user.email);
            } else {
                setProfileLoading(false);
            }
        });

        // Listen for auth changes
        const { data: listener } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                const user = session?.user ?? null;
                setAuthUser(user);
                setAuthLoading(false);

                if (user && !fetchedRef.current) {
                    fetchedRef.current = true;
                    fetchProfile(user.id, user.email);
                } else if (!user) {
                    setProfile(null);
                    setProfileLoading(false);
                    fetchedRef.current = false;
                }
            }
        );

        return () => {
            listener.subscription.unsubscribe();
        };
    }, []);

    // Auth actions
    const signInWithGoogle = async () => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: `${window.location.origin}/` },
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
        fetchedRef.current = false;
    };

    // Computed states
    const isLoggedIn = !!authUser;
    const isPresident = profile?.role === "president" || profile?.role === "admin";
    const canParticipate = isPresident || profile?.username_verified === true;

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
