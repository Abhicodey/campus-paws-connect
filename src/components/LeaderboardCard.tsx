import { Trophy } from "lucide-react";
import { supabase } from "@/lib/supabase";

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
      className={`card-warm p-4 flex items-center gap-4 transition-all duration-200 ${isTop3 ? "border-2 shadow-warm" : ""
        } ${isTop3 ? rankColors[rank as 1 | 2 | 3]?.split(" ")[2] : ""}`}
    >
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${isTop3
          ? rankColors[rank as 1 | 2 | 3]
          : "bg-muted text-muted-foreground"
          }`}
      >
        {rank === 1 ? <Trophy className="w-5 h-5" /> : rank}
      </div>

      <div className="w-10 h-10 rounded-full bg-secondary/30 overflow-hidden flex items-center justify-center">
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

      <div className="flex-1">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-sm text-muted-foreground">Kindness Champion</p>
      </div>

      <div className="text-right">
        <p className="font-bold text-primary text-lg">{points}</p>
        <p className="text-xs text-muted-foreground">points</p>
      </div>
    </div>
  );
};

export default LeaderboardCard;
