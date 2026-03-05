import { cn } from "@/lib/utils";
import { User } from "lucide-react";
import { LeaderboardUser } from "@/hooks/useLeaderboard";

interface LeaderboardPodiumProps {
    topThree: LeaderboardUser[];
}

const LeaderboardPodium = ({ topThree }: LeaderboardPodiumProps) => {
    // Sort into order: [2, 1, 3] for podium visual layout
    const ordered = [topThree[1], topThree[0], topThree[2]];

    const getRankStyles = (rank: number) => {
        switch (rank) {
            case 1:
                return "h-48 bg-gradient-to-t from-amber-500/20 to-amber-500/5 border-amber-500/30";
            case 2:
                return "h-40 bg-gradient-to-t from-slate-400/20 to-slate-400/5 border-slate-400/30";
            case 3:
                return "h-36 bg-gradient-to-t from-orange-400/20 to-orange-400/5 border-orange-400/30";
            default:
                return "";
        }
    };

    const getMedalEmoji = (rank: number) => {
        switch (rank) {
            case 1: return "🥇";
            case 2: return "🥈";
            case 3: return "🥉";
            default: return "";
        }
    };

    return (
        <div className="flex items-end justify-center gap-2 mb-10 mt-4 px-2">
            {ordered.map((user, idx) => {
                if (!user) return <div key={idx} className="flex-1" />;

                // The index in 'topThree' is the actual rank (0=1st, 1=2nd, 2=3rd)
                const rank = idx === 0 ? 2 : idx === 1 ? 1 : 3;

                return (
                    <div
                        key={user.id}
                        className={cn(
                            "flex-1 flex flex-col items-center group transition-all duration-500 animate-in fade-in slide-in-from-bottom-5",
                            rank === 1 ? "z-10 -mt-8" : "z-0"
                        )}
                    >
                        {/* Avatar Circle */}
                        <div className={cn(
                            "relative mb-3",
                            rank === 1 ? "w-20 h-20" : "w-16 h-16"
                        )}>
                            <div className={cn(
                                "w-full h-full rounded-full overflow-hidden border-2 shadow-lg group-hover:scale-110 transition-transform duration-300",
                                rank === 1 ? "border-amber-400 ring-4 ring-amber-400/10" :
                                    rank === 2 ? "border-slate-300 ring-4 ring-slate-300/10" :
                                        "border-orange-300 ring-4 ring-orange-300/10"
                            )}>
                                {user.avatar_url ? (
                                    <img
                                        src={`${user.avatar_url}${user.avatar_url.includes("?") ? "&" : "?"}t=${user.avatar_updated_at ?? ""}`}
                                        alt={user.username}
                                        referrerPolicy="no-referrer"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-secondary flex items-center justify-center">
                                        <span className="text-xl font-bold text-secondary-foreground">
                                            {(user.username || "A").charAt(0).toUpperCase()}
                                        </span>
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white dark:bg-slate-900 shadow-md flex items-center justify-center text-xl">
                                {getMedalEmoji(rank)}
                            </div>
                        </div>

                        {/* Podium Base */}
                        <div className={cn(
                            "w-full rounded-2xl border-x border-t flex flex-col items-center justify-center p-4 backdrop-blur-sm",
                            getRankStyles(rank)
                        )}>
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/70 mb-1">
                                {rank === 1 ? "Champion" : rank === 2 ? "Kind heart" : "Helper"}
                            </span>
                            <span className="font-bold text-foreground text-center truncate w-full px-1 mb-1">
                                {user.username || "Anonymous"}
                            </span>
                            <div className="flex items-center gap-1">
                                <span className={cn(
                                    "font-black text-lg",
                                    rank === 1 ? "text-amber-500" : rank === 2 ? "text-slate-500" : "text-orange-500"
                                )}>
                                    {user.total_points}
                                </span>
                                <span className="text-[10px] font-medium text-muted-foreground uppercase">pts</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LeaderboardPodium;
