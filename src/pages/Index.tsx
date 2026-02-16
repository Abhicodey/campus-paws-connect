import { QrCode, Dog, Trophy, Image, Shield, PawPrint, Moon, Sun } from "lucide-react";
import { Link } from "react-router-dom";
import NotificationBell from "@/components/NotificationBell";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { useCampusStats } from "@/hooks/useCampusStats";
import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/components/ThemeProvider";
import heroIllustration from "@/assets/hero-illustration.png";
import Page from "@/components/layout/Page";
import ResponsiveCard from "@/components/ui/ResponsiveCard";

const Index = () => {
  const { data: stats, isLoading } = useCampusStats();
  const { isPresident, profileLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  return (
    <Page>
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Logo"
              className="w-full h-full object-contain relative z-10"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
            <PawPrint className="w-6 h-6 text-brand absolute" />
          </div>

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

      {/* Hero Illustration */}
      <div className="
        relative
        w-full
        aspect-[16/9]
        sm:aspect-[18/7]
        lg:aspect-[21/7]
        overflow-hidden
        rounded-2xl
        shadow-sm
      ">
        <img
          src={heroIllustration}
          alt="Students with campus dogs"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 text-foreground">
          <p className="text-sm font-medium">A compassionate community for our campus friends 🐾</p>
        </div>
      </div>

      {/* Username Status Banner (hidden for president) */}
      <UsernameStatusBanner />

      {/* President Dashboard Button */}
      {!profileLoading && isPresident && (
        <Link
          to="/admin"
          className="flex items-center justify-center gap-3 w-full bg-gradient-to-r from-amber-500 to-orange-500 
            text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-warm transition-all 
            duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <Shield className="w-6 h-6" />
          President Dashboard
        </Link>
      )}

      {/* Primary Action */}
      <Link
        to="/scan"
        className="flex items-center justify-center gap-3 w-full bg-brand text-white 
          py-4 px-6 rounded-2xl font-semibold text-lg shadow-warm transition-all 
          duration-200 hover:opacity-90 active:scale-[0.98]"
      >
        <QrCode className="w-6 h-6" />
        Scan Dog QR
      </Link>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3">
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

      {/* Stats */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">Campus Stats 📊</h2>
        <ResponsiveCard className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">
                {isLoading ? (
                  <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.totalDogs ?? 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Dogs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary-foreground">
                {isLoading ? (
                  <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.totalMembers ?? 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Members</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-accent-foreground">
                {isLoading ? (
                  <span className="inline-block w-8 h-6 bg-muted animate-pulse rounded" />
                ) : (
                  stats?.actionsToday ?? 0
                )}
              </p>
              <p className="text-xs text-muted-foreground">Today</p>
            </div>
          </div>
        </ResponsiveCard>
      </div>
    </Page>
  );
};

export default Index;
