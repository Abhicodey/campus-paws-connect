import { Home, Dog, Trophy, Image, User, Shield, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const MobileNav = () => {
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
        <nav className="bg-surface/90 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex justify-around items-center px-2 py-2">
                {navItems.map(({ icon: Icon, label, path }) => {
                    const isActive = location.pathname === path;
                    return (
                        <Link
                            key={path}
                            to={path}
                            className={`
                flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 min-w-[60px]
                ${isActive
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground"
                                }
              `}
                        >
                            <Icon
                                className={`w-5 h-5 transition-transform duration-200 ${isActive ? "scale-110" : "scale-100"}`}
                                strokeWidth={isActive ? 2.5 : 2}
                            />
                            <span className={`text-[10px] font-medium ${isActive ? "opacity-100" : "opacity-70"}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
};

export default MobileNav;
