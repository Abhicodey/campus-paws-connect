import { Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useUsernameStatus } from '@/hooks/useUsernameStatus';
import { useAuth } from '@/contexts/AuthContext';

interface UsernameStatusBannerProps {
    className?: string;
}

/**
 * Banner component that shows username verification status.
 * - Hidden for guests, presidents, and verified users
 * - Shows "Choose a username" for users without username
 * - Shows "Under review" for users with pending username
 */
export function UsernameStatusBanner({ className = '' }: UsernameStatusBannerProps) {
    const { user } = useAuth();
    const { loading, isPresident, canParticipate, usernameVerified, role } = useUsernameStatus();

    // Don't show while loading
    if (loading) return null;

    // Don't show for guests
    if (!user) return null;

    // PRESIDENT BYPASSES ALL - never show banner
    if (isPresident) return null;

    // Verified users don't need banner
    if (canParticipate) return null;

    // Check if user needs to set username (no requested_username in profile)
    // For now, show pending state if not verified
    if (!usernameVerified) {
        return (
            <div className={`bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 ${className}`}>
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800/30 flex items-center justify-center flex-shrink-0">
                        <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">
                            Username approval required
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Set up your username to participate. Browsing is open to everyone! 🐾
                        </p>
                        <Link
                            to="/setup-username"
                            className="inline-block mt-2 text-xs font-medium text-primary underline"
                        >
                            Set up username →
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return null;
}
