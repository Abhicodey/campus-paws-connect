import Badge from "@/components/Badge";
import BottomNav from "@/components/BottomNav";
import { Dog, Heart, Award, Star, Settings, LogOut, Clock, Bone } from "lucide-react";

const mockUser = {
  name: "Priya Sharma",
  points: 450,
  rank: 1,
  joinedDate: "October 2024",
  recentActions: [
    { action: "Fed Buddy", time: "2 hours ago", icon: <Bone className="w-4 h-4" /> },
    { action: "Pet Luna", time: "Yesterday", icon: <Heart className="w-4 h-4" /> },
    { action: "Updated Brownie's location", time: "2 days ago", icon: <Dog className="w-4 h-4" /> },
  ],
  badges: [
    { icon: "🐕", label: "Dog Friend", earned: true },
    { icon: "💚", label: "Care Giver", earned: true },
    { icon: "👑", label: "Kindness Champion", earned: true },
    { icon: "⭐", label: "Early Adopter", earned: true },
    { icon: "🌟", label: "Super Helper", earned: false },
    { icon: "🏆", label: "Monthly Top", earned: false },
  ],
};

const Profile = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="bg-primary pt-8 pb-16 px-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">{mockUser.name}</h1>
            <p className="text-primary-foreground/80 text-sm mt-1">
              Member since {mockUser.joinedDate}
            </p>
          </div>
          <button className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Stats Card */}
      <div className="px-6 -mt-10">
        <div className="card-elevated p-5">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-primary">{mockUser.points}</p>
              <p className="text-xs text-muted-foreground">Kindness Points</p>
            </div>
            <div className="w-px h-12 bg-border" />
            <div className="text-center flex-1">
              <p className="text-3xl font-bold text-secondary">#{mockUser.rank}</p>
              <p className="text-xs text-muted-foreground">Leaderboard Rank</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="px-6 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Your Badges</h2>
        <div className="grid grid-cols-3 gap-3">
          {mockUser.badges.map((badge, index) => (
            <Badge key={index} icon={badge.icon} label={badge.label} earned={badge.earned} />
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="px-6 mt-6">
        <h2 className="font-semibold text-foreground mb-3">Recent Activity</h2>
        <div className="card-warm p-4 space-y-3">
          {mockUser.recentActions.map((item, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                {item.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{item.action}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {item.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <div className="px-6 mt-6">
        <button className="w-full flex items-center justify-center gap-2 text-destructive py-3 rounded-xl 
          font-medium transition-all hover:bg-destructive/10 active:scale-[0.98]">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
