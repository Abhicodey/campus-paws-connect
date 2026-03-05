import LeaderboardCard from "@/components/LeaderboardCard";
import LeaderboardPodium from "@/components/LeaderboardPodium";
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
          Top kindness champions of CampusPaws 🐾
        </p>
      </header>

      {/* Info Note */}
      <div className="mb-6">
        <div className="bg-primary/5 border border-primary/10 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-sm text-foreground/80 leading-relaxed">
            Points accumulate as you care for campus dogs and help the community grow ✨
          </p>
        </div>
      </div>

      {/* Leaderboard Content */}
      <div className="pb-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground font-medium">Fetching champions...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-6 bg-destructive/5 rounded-3xl border border-destructive/10">
            <p className="text-destructive font-medium">Leaderboard currently unavailable</p>
            <p className="text-xs text-muted-foreground mt-1">Please check your connection and try again</p>
          </div>
        ) : Array.isArray(leaderboard) && leaderboard.length > 0 ? (
          <>
            {/* Top 3 Podium */}
            {leaderboard.length >= 3 && (
              <LeaderboardPodium topThree={leaderboard.slice(0, 3)} />
            )}

            {/* List for the rest (or all if < 3) */}
            <div className="space-y-3">
              {(leaderboard.length >= 3 ? leaderboard.slice(3) : leaderboard).map((user, index) => (
                <LeaderboardCard
                  key={user.id}
                  rank={(leaderboard.length >= 3 ? index + 4 : index + 1)}
                  name={user.username || 'Anonymous'}
                  points={user.total_points}
                  avatarUrl={user.avatar_url}
                  avatarUpdatedAt={user.avatar_updated_at}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-3xl border border-dashed border-border">
            <div className="text-4xl mb-4">🏆</div>
            <p className="text-foreground font-semibold">No kindness champions yet</p>
            <p className="text-sm text-muted-foreground mt-1">Be the first to help a campus dog! 🐾</p>
          </div>
        )}
      </div>
    </Page>
  );
};

export default Leaderboard;
