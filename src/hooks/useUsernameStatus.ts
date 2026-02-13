// This hook is now DEPRECATED
// All functionality has been moved to AuthContext
// Use: const { isPresident, canParticipate, profile } = useAuth();

import { useAuth } from "@/contexts/AuthContext";

/**
 * @deprecated Use useAuth() directly instead
 * This hook is kept for backwards compatibility only
 */
export function useUsernameStatus() {
    const { authLoading, profileLoading, isLoggedIn, isPresident, canParticipate, profile } = useAuth();

    return {
        loading: authLoading || profileLoading,
        role: profile?.role ?? null,
        usernameVerified: profile?.username_verified ?? false,
        isPresident,
        canParticipate,
        // Legacy compatibility
        isLoggedIn,
        needsUsername: isLoggedIn && profile && !profile.username && !profile.username_verified,
        isPending: isLoggedIn && profile && profile.username && !profile.username_verified,
        isVerified: profile?.username_verified ?? false,
        isAdminRole: isPresident,
        user: profile,
    };
}
