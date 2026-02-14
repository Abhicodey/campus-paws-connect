import { Home, Dog, Trophy, Image, User, Shield, Heart } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const BottomNav = () => {
  const location = useLocation();
  const { authUser: user } = useAuth();

  const isAdmin = user?.role === 'president' || user?.role === 'admin';

  // Build nav items based on user role
  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Dog, label: "Dogs", path: "/dogs" },
    // Show leaderboard for regular users, admin panel for admins
    isAdmin
      ? { icon: Shield, label: "Admin", path: "/admin" }
      : { icon: Trophy, label: "Board", path: "/leaderboard" },
    { icon: Heart, label: "Community", path: "/community" },
    { icon: Image, label: "Gallery", path: "/gallery" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <nav className="
      fixed bottom-0 left-0 right-0 bg-surface border-t border-border px-2 py-2 z-50
      md:top-0 md:bottom-0 md:w-64 md:left-0 md:right-auto md:border-t-0 md:border-r md:px-4 md:py-6
    ">
      <div className="
        max-w-md mx-auto flex justify-around items-center
        md:flex-col md:justify-start md:items-stretch md:h-full md:gap-2 md:max-w-none
      ">

        {/* Logo area for desktop */}
        <div className="hidden md:flex items-center gap-3 px-4 mb-8">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <img src="/campuspaws-logo.png" alt="Logo" className="w-5 h-5 object-contain" />
          </div>
          <span className="font-bold text-lg tracking-tight">CampusPaws</span>
        </div>

        {navItems.map(({ icon: Icon, label, path }) => {
          const isActive = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`
                flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200
                md:flex-row md:gap-3 md:px-4 md:py-3
                ${isActive
                  ? "bg-elevated text-primary shadow-sm font-medium"
                  : "text-muted hover:bg-elevated hover:text-primary"
                }
              `}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-scale-in" : ""}`} />
              <span className="text-xs font-medium md:text-sm">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
