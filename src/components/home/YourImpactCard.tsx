import { Flame } from "lucide-react";

interface YourImpactCardProps {
    user: {
        dogsFed: number;
        streak: number;
        points: number;
    };
    isLoading?: boolean;
}

export default function YourImpactCard({ user, isLoading }: YourImpactCardProps) {
    if (isLoading) {
        return (
            <div className="card-auto p-5 animate-pulse flex justify-between items-center h-24">
                <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-48 bg-muted rounded"></div>
                </div>
                <div className="h-10 w-10 bg-muted rounded"></div>
            </div>
        );
    }

    return (
        <div className="card-auto p-5 flex justify-between items-center bg-gradient-to-r from-card to-card/50 border-orange-500/10 hover:border-orange-500/20">
            <div>
                <h2 className="font-semibold text-lg flex items-center gap-2">
                    Your Impact 🌱
                </h2>
                <p className="text-sm text-muted-foreground">
                    You helped <span className="font-bold text-foreground">{user.dogsFed}</span> dogs this month & earned <span className="font-bold text-foreground">{user.points}</span> points.
                </p>
            </div>

            <div className="text-right flex flex-col items-end">
                <div className="flex items-center gap-1 text-orange-500">
                    <Flame className="w-5 h-5 fill-current" />
                    <div className="text-2xl font-bold">{user.streak}</div>
                </div>
                <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">day streak</div>
            </div>
        </div>
    );
}
