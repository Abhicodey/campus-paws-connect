import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

interface LeaderboardCardProps {
  rank: number;
  name: string;
  points: number;
  avatarUrl?: string | null;
  avatarUpdatedAt?: string | null;
}

const LeaderboardCard = ({ rank, name, points, avatarUrl, avatarUpdatedAt }: LeaderboardCardProps) => {
  const isTop3 = rank <= 3;
  const rankColors = {
    1: "bg-amber-100 text-amber-700 border-amber-300",
    2: "bg-slate-100 text-slate-600 border-slate-300",
    3: "bg-orange-100 text-orange-700 border-orange-300",
  };

  return (
    <div
      className={cn(
        "bg-card border border-border rounded-2xl p-4 flex items-center gap-4 transition-all duration-200",
        isTop3 ? "border-primary/30 shadow-md bg-gradient-to-r from-card to-primary/5" : "shadow-sm hover:shadow-md"
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
          rank === 1 && "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
          rank === 2 && "bg-slate-100 text-slate-600 dark:bg-slate-500/20 dark:text-slate-400",
          rank === 3 && "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
          !isTop3 && "bg-muted text-muted-foreground"
        )}
      >
        {rank === 1 ? <Trophy className="w-5 h-5" /> : rank}
      </div>

      <div className="w-10 h-10 rounded-full bg-secondary/30 overflow-hidden flex items-center justify-center shrink-0 border border-border/50">
        {avatarUrl ? (
          <img
            key={avatarUpdatedAt || 'avatar'}
            src={(() => {
              const separator = avatarUrl.includes('?') ? '&' : '?';
              return `${avatarUrl}${separator}t=${avatarUpdatedAt || Date.now()}`;
            })()}
            alt={name}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-lg font-medium text-secondary-foreground">
            {name.charAt(0)}
          </span>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground truncate">Kindness Champion</p>
      </div>

      <div className="text-right shrink-0">
        <p className="font-bold text-primary text-lg">{points}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
};

export default LeaderboardCard;
