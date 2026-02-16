import { QrCode, Dog, Trophy, Image, Shield, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { useCampusStats } from "@/hooks/useCampusStats";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import Page from "@/components/layout/Page";
import ResponsiveCard from "@/components/ui/ResponsiveCard";
import HomeHero from "@/components/home/HomeHero";
import { useLiveActivity } from "@/hooks/useLiveActivity";

const Index = () => {
  const { data: stats, isLoading } = useCampusStats();
  const { isPresident, profileLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const activities = useLiveActivity();

  return (
    <Page>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img
            src="/logo.png"
            alt="Logo"
            className="w-10 h-10 object-contain select-none"
            draggable={false}
          />

          <div>
            <span className="text-xl font-semibold tracking-tight text-foreground block">
              CampusPaws
            </span>
            <p className="text-muted-foreground text-xs">
              Sharing Care & Comfort
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="p-2 rounded-full hover:bg-muted transition-colors text-foreground"
            title="Toggle Theme"
          >
            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <NotificationBell />
        </div>
      </header>

      {/* Hero Activity Feed */}
      <HomeHero
        stats={{
          dogsFed: stats?.dogsFed ?? 0,
          photos: stats?.totalPhotos ?? 0,
          members: stats?.totalMembers ?? 0,
          todayPoints: stats?.actionsToday ?? 0
        }}
        activities={activities}
      />

      {/* Username Status Banner (hidden for president) */}
      <UsernameStatusBanner className="mt-6" />

      {/* President Dashboard Button */}
      {!profileLoading && isPresident && (
        <Link
          to="/admin"
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 
            text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-warm transition-all 
            duration-200 hover:opacity-90 active:scale-[0.98] mt-6"
        >
          <Shield className="w-6 h-6" />
          President Dashboard
        </Link>
      )}

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-3 gap-3 mt-6">
        <Link to="/dogs" className="block">
          <ResponsiveCard className="flex flex-col items-center justify-center py-5 gap-2 transition-all hover:scale-[1.02] h-full">
            <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center">
              <Dog className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Our Dogs</span>
          </ResponsiveCard>
        </Link>

        <Link to="/gallery" className="block">
          <ResponsiveCard className="flex flex-col items-center justify-center py-5 gap-2 transition-all hover:scale-[1.02] h-full">
            <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center">
              <Image className="w-5 h-5 text-secondary-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">Gallery</span>
          </ResponsiveCard>
        </Link>

        <Link to="/leaderboard" className="block">
          <ResponsiveCard className="flex flex-col items-center justify-center py-5 gap-2 transition-all hover:scale-[1.02] h-full">
            <div className="w-11 h-11 rounded-full bg-primary/20 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Leaders</span>
          </ResponsiveCard>
        </Link>
      </div>
    </Page>
  );
};

export default Index;
