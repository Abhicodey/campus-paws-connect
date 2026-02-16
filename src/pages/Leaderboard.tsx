import LeaderboardCard from "@/components/LeaderboardCard";
import { Info, Loader2 } from "lucide-react";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import Page from "@/components/layout/Page";

const Leaderboard = () => {
  const { data: leaderboard, isLoading, error } = useLeaderboard();

  return (
    <Page>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Kindness Board</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Top caring members this month
        </p>
      </header>

      {/* Info Note */}
      <div className="mb-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            Points reset monthly to encourage fairness and give everyone a chance to shine ✨
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Loading leaderboard...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Something went wrong. Please try again.</p>
          </div>
        ) : leaderboard && leaderboard.length > 0 ? (
          leaderboard.map((user, index) => (
            <LeaderboardCard
              key={user.id}
              rank={index + 1}
              name={user.username || 'Anonymous'}
              points={user.points}
              avatarUrl={user.avatar_url}
              avatarUpdatedAt={user.avatar_updated_at}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No kindness champions yet. Be the first! 🏆</p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Leaderboard;
