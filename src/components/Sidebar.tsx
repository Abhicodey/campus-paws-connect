import { Home, Dog, Trophy, Image, User, Shield, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Sidebar = () => {
    const location = useLocation();
    const { authUser: user } = useAuth();

    const isAdmin = user?.role === 'president' || user?.role === 'admin';

    const navItems = [
        { icon: Home, label: "Home", path: "/" },
        { icon: Dog, label: "Dogs", path: "/dogs" },
        isAdmin
            ? { icon: Shield, label: "Admin", path: "/admin" }
            : { icon: Trophy, label: "Board", path: "/leaderboard" },
        { icon: Heart, label: "Community", path: "/community" },
        { icon: Image, label: "Gallery", path: "/gallery" },
        { icon: User, label: "Profile", path: "/profile" },
    ];

    return (
        <div className="flex flex-col h-full bg-surface">
            {/* Logo Area */}
            <div className="p-6 border-b border-border flex items-center gap-3">
                <img
                    src="/logo.png"
                    alt="CampusPaws"
                    className="w-10 h-10 object-contain select-none"
                    draggable={false}
                />
                <span className="font-bold text-lg tracking-tight text-foreground">CampusPaws</span>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                {navItems.map(({ icon: Icon, label, path }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`
                flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group
                ${isActive
                                    ? "bg-elevated text-primary shadow-sm font-medium"
                                    : "text-muted-foreground hover:bg-elevated hover:text-foreground"
                                }
              `}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"}`} />
                            <span className="text-sm">{label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User Mini Profile (Optional, nice for sidebar) */}
            {user && (
                <div className="p-4 border-t border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-elevated/50 flex items-center justify-center overflow-hidden">
                            {/* Simplified avatar fallback */}
                            <User className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{user.email?.split('@')[0]}</p>
                            <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
