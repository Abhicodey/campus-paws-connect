import { QrCode, Dog, Trophy, Image } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import heroIllustration from "@/assets/hero-illustration.png";
import dogBuddy from "@/assets/dog-buddy.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <img src={dogBuddy} alt="CampusPaws mascot" className="w-12 h-12 animate-float" />
          <h1 className="text-2xl font-bold text-foreground">CampusPaws</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Sharing Care, Comfort & Connection
        </p>
      </header>

      {/* Hero Illustration */}
      <div className="px-4 mt-6">
        <div className="relative rounded-3xl overflow-hidden shadow-warm">
          <img
            src={heroIllustration}
            alt="Students with campus dogs"
            className="w-full h-48 object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-card">
            <p className="text-sm font-medium">A compassionate community for our campus friends 🐾</p>
          </div>
        </div>
      </div>

      {/* Primary Action */}
      <div className="px-6 mt-8">
        <Link
          to="/scan"
          className="flex items-center justify-center gap-3 w-full bg-primary text-primary-foreground 
            py-4 px-6 rounded-2xl font-semibold text-lg shadow-warm transition-all 
            duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          <QrCode className="w-6 h-6" />
          Scan Dog QR
        </Link>
      </div>

      {/* Secondary Actions */}
      <div className="grid grid-cols-3 gap-3 px-6 mt-6">
        <Link
          to="/dogs"
          className="card-warm flex flex-col items-center gap-2 py-5 px-3 transition-all 
            hover:shadow-warm active:scale-[0.97]"
        >
          <Dog className="w-7 h-7 text-primary" />
          <span className="text-sm font-medium text-foreground">View Dogs</span>
        </Link>

        <Link
          to="/leaderboard"
          className="card-warm flex flex-col items-center gap-2 py-5 px-3 transition-all 
            hover:shadow-warm active:scale-[0.97]"
        >
          <Trophy className="w-7 h-7 text-amber-600" />
          <span className="text-sm font-medium text-foreground">Leaderboard</span>
        </Link>

        <Link
          to="/gallery"
          className="card-warm flex flex-col items-center gap-2 py-5 px-3 transition-all 
            hover:shadow-warm active:scale-[0.97]"
        >
          <Image className="w-7 h-7 text-secondary" />
          <span className="text-sm font-medium text-foreground">Gallery</span>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="px-6 mt-8">
        <div className="card-elevated p-5">
          <h2 className="font-semibold text-foreground mb-4">Campus at a Glance</h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-primary">12</p>
              <p className="text-xs text-muted-foreground">Dogs Registered</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-secondary">48</p>
              <p className="text-xs text-muted-foreground">Care Actions Today</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-coral">156</p>
              <p className="text-xs text-muted-foreground">Community Members</p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Dog CTA */}
      <div className="px-6 mt-6">
        <Link
          to="/add-dog"
          className="block text-center bg-muted text-muted-foreground py-3 px-6 rounded-2xl 
            font-medium transition-all hover:bg-muted/80 active:scale-[0.98]"
        >
          + Register a New Campus Friend
        </Link>
      </div>

      {/* Footer Note */}
      <p className="text-center text-xs text-muted-foreground mt-8 px-6">
        A student-driven initiative for campus animal welfare ❤️
      </p>

      <BottomNav />
    </div>
  );
};

export default Index;
