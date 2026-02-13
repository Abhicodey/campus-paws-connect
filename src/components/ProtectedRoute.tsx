import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
    children: ReactNode;
    requirePresident?: boolean;
}

/**
 * ProtectedRoute - guards routes based on auth and role
 *
 * Usage:
 *   <ProtectedRoute>...</ProtectedRoute>                    // Requires login only
 *   <ProtectedRoute requirePresident>...</ProtectedRoute>   // Requires president/admin role
 */
export default function ProtectedRoute({
    children,
    requirePresident = false,
}: ProtectedRouteProps) {
    const { authLoading, profileLoading, isLoggedIn, isPresident } = useAuth();
    const location = useLocation();

    // Wait for both auth and profile to load
    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Loading...</p>
                </div>
            </div>
        );
    }

    // Not logged in - redirect to login
    if (!isLoggedIn) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // President-only route check
    if (requirePresident && !isPresident) {
        return <Navigate to="/" replace />;
    }

    // Allow access - president bypasses ALL other checks
    return <>{children}</>;
}
