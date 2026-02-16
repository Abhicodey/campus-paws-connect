import { useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Mail, Lock, User, Eye, EyeOff } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const Login = () => {
    const { isLoggedIn, authLoading, profileLoading, signInWithGoogle, signInWithEmail, signUp } = useAuth();
    const location = useLocation();
    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/';

    const [mode, setMode] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // If already logged in, redirect
    if (!authLoading && !profileLoading && isLoggedIn) {
        return <Navigate to={from} replace />;
    }

    const handleGoogleLogin = async () => {
        setSubmitting(true);
        const { error } = await signInWithGoogle();
        if (error) {
            toast({
                title: 'Login failed',
                description: error.message,
                variant: 'destructive',
            });
        }
        setSubmitting(false);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        if (mode === 'login') {
            const { error } = await signInWithEmail(email, password);
            if (error) {
                toast({
                    title: 'Login failed',
                    description: error.message,
                    variant: 'destructive',
                });
            }
        } else {
            if (!fullName.trim()) {
                toast({
                    title: 'Name required',
                    description: 'Please enter your full name',
                    variant: 'destructive',
                });
                setSubmitting(false);
                return;
            }
            const { error } = await signUp(email, password, fullName);
            if (error) {
                toast({
                    title: 'Sign up failed',
                    description: error.message,
                    variant: 'destructive',
                });
            } else {
                toast({
                    title: 'Check your email 📧',
                    description: 'We sent you a confirmation link to complete your registration.',
                });
            }
        }

        setSubmitting(false);
    };

    if (authLoading) {
        return (
            <div className="min-h-dvh bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-brand" />
            </div>
        );
    }

    return (
        <div className="min-h-dvh bg-background flex flex-col">
            {/* Header */}
            <div className="pt-12 px-6 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <img
                        src="/logo.png"
                        alt="CampusPaws Official Logo"
                        className="w-12 h-12 object-contain select-none"
                        draggable={false}
                    />
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                        CampusPaws
                    </span>
                </div>
                <p className="text-muted-foreground text-sm mt-1">
                    {mode === 'login' ? 'Welcome back! 🐾' : 'Join the community 🐾'}
                </p>
            </div>

            {/* Form */}
            <div className="flex-1 px-6 mt-8">
                <div className="card-elevated p-6 max-w-sm mx-auto">
                    {/* Google Login */}
                    <button
                        onClick={handleGoogleLogin}
                        disabled={submitting}
                        className="w-full flex items-center justify-center gap-3 bg-card border border-border 
              py-3 px-4 rounded-xl font-medium text-foreground transition-all 
              hover:bg-muted active:scale-[0.98] disabled:opacity-50"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path
                                fill="#4285F4"
                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                                fill="#34A853"
                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                                fill="#FBBC05"
                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            />
                            <path
                                fill="#EA4335"
                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            />
                        </svg>
                        Continue with Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-6">
                        <div className="flex-1 h-px bg-border" />
                        <span className="text-muted-foreground text-sm">or</span>
                        <div className="flex-1 h-px bg-border" />
                    </div>

                    {/* Email Form */}
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        {mode === 'signup' && (
                            <div>
                                <label className="block text-sm font-medium text-foreground mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        placeholder="Your name"
                                        className="w-full bg-muted rounded-xl py-3 pl-10 pr-4 text-foreground 
                      placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-brand/30"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@university.edu"
                                    required
                                    className="w-full bg-muted rounded-xl py-3 pl-10 pr-4 text-foreground 
                    placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-foreground mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                    className="w-full bg-muted rounded-xl py-3 pl-10 pr-10 text-foreground 
                    placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-brand text-white py-3 rounded-xl font-semibold 
                transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {mode === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    </form>

                    {/* Toggle Mode */}
                    <p className="text-center text-sm text-muted-foreground mt-6">
                        {mode === 'login' ? (
                            <>
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setMode('signup')}
                                    className="text-brand font-medium hover:underline"
                                >
                                    Sign up
                                </button>
                            </>
                        ) : (
                            <>
                                Already have an account?{' '}
                                <button
                                    onClick={() => setMode('login')}
                                    className="text-primary font-medium hover:underline"
                                >
                                    Sign in
                                </button>
                            </>
                        )}
                    </p>
                </div>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-muted-foreground py-8 px-6">
                By continuing, you agree to care for campus dogs responsibly 💚
            </p>
        </div>
    );
};

export default Login;
