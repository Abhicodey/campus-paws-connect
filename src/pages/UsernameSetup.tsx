import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Loader2, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const UsernameSetup = () => {
    const { authUser, profile, authLoading, profileLoading, isPresident, canParticipate, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [submitting, setSubmitting] = useState(false);

    // Not logged in - redirect to login
    if (!authLoading && !profileLoading && !authUser) {
        return <Navigate to="/login" replace />;
    }

    // Show loading
    if (authLoading || profileLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Presidents and admins should go to home
    if (isPresident) {
        return <Navigate to="/" replace />;
    }

    // Username already verified - redirect to home
    if (canParticipate) {
        return <Navigate to="/" replace />;
    }

    // If user already requested a username, show pending state
    if (profile?.requested_username && !profile?.username_verified) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <div className="flex-1 flex flex-col items-center justify-center px-6">
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-16 h-16 rounded-full bg-card flex items-center justify-center overflow-hidden border border-border shadow-sm">
                            <img
                                src="/logo.png"
                                alt="CampusPaws Official Logo"
                                className="w-10 h-10 object-contain"
                            />
                        </div>
                    </div>

                    <div className="card-elevated p-6 max-w-sm w-full text-center">
                        <div className="w-14 h-14 rounded-full bg-accent/30 flex items-center justify-center mx-auto mb-4">
                            <Clock className="w-7 h-7 text-accent-foreground" />
                        </div>

                        <h1 className="text-xl font-bold text-foreground mb-2">
                            Pending Approval
                        </h1>

                        <p className="text-muted-foreground text-sm mb-4">
                            Your username request <span className="font-medium text-foreground">@{profile.requested_username}</span> is
                            being reviewed by the community president.
                        </p>

                        <p className="text-muted-foreground text-xs">
                            You'll be able to use the app once your username is approved. This helps keep our community safe! 🐾
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const trimmedUsername = username.trim().toLowerCase();

        // Validate username
        if (trimmedUsername.length < 3) {
            toast({
                title: 'Username too short',
                description: 'Username must be at least 3 characters',
                variant: 'destructive',
            });
            return;
        }

        if (!/^[a-z0-9_]+$/.test(trimmedUsername)) {
            toast({
                title: 'Invalid characters',
                description: 'Username can only contain letters, numbers, and underscores',
                variant: 'destructive',
            });
            return;
        }

        if (!authUser?.id) return;

        setSubmitting(true);

        try {
            const { data, error } = await supabase.rpc('request_username_change', {
                new_username: trimmedUsername
            });

            if (error) {
                toast({
                    title: 'Request failed',
                    description: error.message,
                    variant: 'destructive',
                });
                setSubmitting(false);
                return;
            }

            toast({
                title: 'Request submitted! 🎉',
                description: 'Your username is being reviewed by the president.',
            });

            // Refresh profile to show pending state
            await refreshProfile();
        } catch (err: any) {
            toast({
                title: 'Request failed',
                description: err.message || 'Something went wrong',
                variant: 'destructive',
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center px-6">
                <div className="flex items-center justify-center gap-2 mb-6">
                    <img
                        src="/campuspaws-logo.png"
                        alt="CampusPaws Official Logo"
                        className="h-16 w-16 object-contain"
                    />
                </div>

                <div className="card-elevated p-6 max-w-sm w-full">
                    <h1 className="text-xl font-bold text-foreground text-center mb-2">
                        Choose Your Username
                    </h1>

                    <p className="text-muted-foreground text-sm text-center mb-6">
                        Pick a fun username to join the CampusPaws community! 🐕
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="your_username"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background 
                                        text-foreground placeholder:text-muted-foreground
                                        focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                                    maxLength={20}
                                    disabled={submitting}
                                />
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                3-20 characters. Letters, numbers, underscores only.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting || username.trim().length < 3}
                            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold
                                transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed
                                flex items-center justify-center gap-2"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Submitting...
                                </>
                            ) : (
                                'Request Username'
                            )}
                        </button>
                    </form>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Your username will be reviewed by the president before approval.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsernameSetup;
