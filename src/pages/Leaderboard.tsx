import LeaderboardCard from "@/components/LeaderboardCard";
import BottomNav from "@/components/BottomNav";
import { Info } from "lucide-react";

const mockLeaderboard = [
  { rank: 1, name: "Priya", points: 450 },
  { rank: 2, name: "Arjun", points: 380 },
  { rank: 3, name: "Neha", points: 340 },
  { rank: 4, name: "Rahul", points: 290 },
  { rank: 5, name: "Ananya", points: 250 },
  { rank: 6, name: "Vikram", points: 210 },
  { rank: 7, name: "Meera", points: 180 },
  { rank: 8, name: "Sanjay", points: 150 },
];

const Leaderboard = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-6 px-6">
        <h1 className="text-2xl font-bold text-foreground">Kindness Board</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top caring members this month
        </p>
      </header>

      {/* Info Note */}
      <div className="px-6 mt-4">
        <div className="bg-accent/30 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent-foreground">
            Points reset monthly to encourage fairness and give everyone a chance to shine ✨
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="px-6 mt-6 space-y-3">
        {mockLeaderboard.map((user) => (
          <LeaderboardCard key={user.rank} {...user} />
        ))}
      </div>

      <BottomNav />
    </div>
  );
};

export default Leaderboard;
