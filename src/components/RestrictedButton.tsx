import { ReactNode, useState } from 'react';
import { useUsernameStatus } from '@/hooks/useUsernameStatus';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface RestrictedButtonProps {
    children: ReactNode;
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    /** If true, bypasses restriction (for viewing actions) */
    allowUnverified?: boolean;
}

/**
 * A button wrapper that restricts actions for unverified users.
 * Shows the button as disabled with a tooltip when user cannot perform actions.
 */
export function RestrictedButton({
    children,
    className = '',
    onClick,
    disabled = false,
    allowUnverified = false,
}: RestrictedButtonProps) {
    const { canPerformActions, isLoggedIn, needsUsername, isPending } = useUsernameStatus();
    const navigate = useNavigate();
    const [showTooltip, setShowTooltip] = useState(false);

    const isRestricted = !allowUnverified && !canPerformActions && isLoggedIn;
    const isDisabled = disabled || isRestricted;

    const handleClick = () => {
        if (!isLoggedIn) {
            toast({
                title: "Login required",
                description: "Please log in to perform this action.",
                variant: "destructive",
            });
            navigate('/login');
            return;
        }

        if (isRestricted) {
            if (needsUsername) {
                toast({
                    title: "Username required",
                    description: "Please set up your username to participate.",
                    variant: "destructive",
                });
                navigate('/setup-username');
            } else if (isPending) {
                toast({
                    title: "Pending approval",
                    description: "Your username is being reviewed. Please wait for approval.",
                    variant: "destructive",
                });
            }
            return;
        }

        onClick?.();
    };

    return (
        <div
            className="relative"
            onMouseEnter={() => isRestricted && setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
        >
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`${className} ${isRestricted ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
                {children}
            </button>

            {/* Tooltip for restricted state */}
            {showTooltip && isRestricted && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 
                    bg-foreground text-background text-xs rounded-lg whitespace-nowrap z-50 
                    animate-fade-in shadow-lg">
                    {needsUsername
                        ? "Set up username to participate"
                        : "Username approval required"}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 
                        border-4 border-transparent border-t-foreground" />
                </div>
            )}
        </div>
    );
}
