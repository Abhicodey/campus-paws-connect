import { useState } from "react";
import { cn } from "@/lib/utils";
import { X, Heart } from "lucide-react";

interface MoodRatingSheetProps {
    dogName: string;
    onConfirm: (moodRating: number) => void;
    onCancel: () => void;
    isPending: boolean;
}

const MOODS = [
    { value: 1, emoji: "😨", label: "Scared" },
    { value: 2, emoji: "😟", label: "Nervous" },
    { value: 3, emoji: "🙂", label: "Calm" },
    { value: 4, emoji: "😄", label: "Happy" },
    { value: 5, emoji: "🥰", label: "Loving it!" },
];

const MoodRatingSheet = ({ dogName, onConfirm, onCancel, isPending }: MoodRatingSheetProps) => {
    const [selected, setSelected] = useState<number | null>(null);

    return (
        // Backdrop
        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onCancel}
        >
            {/* Sheet */}
            <div
                className="w-full max-w-md bg-card border-t border-border rounded-t-3xl p-6 pb-10 shadow-2xl animate-in slide-in-from-bottom-5 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Handle + close */}
                <div className="flex items-center justify-between mb-5">
                    <div className="w-10 h-1.5 bg-border rounded-full mx-auto" />
                    <button onClick={onCancel} className="absolute right-5 top-5 p-1.5 rounded-full hover:bg-muted transition-colors">
                        <X className="w-4 h-4 text-muted-foreground" />
                    </button>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                    <div className="text-3xl mb-2">🐾</div>
                    <h2 className="text-lg font-bold text-foreground">How was {dogName}'s mood?</h2>
                    <p className="text-sm text-muted-foreground mt-1">Your rating helps the community understand this dog better</p>
                </div>

                {/* Mood Buttons */}
                <div className="grid grid-cols-5 gap-2 mb-6">
                    {MOODS.map((mood) => (
                        <button
                            key={mood.value}
                            onClick={() => setSelected(mood.value)}
                            className={cn(
                                "flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all duration-200 hover:scale-105 active:scale-95",
                                selected === mood.value
                                    ? "border-primary bg-primary/10 shadow-inner scale-105"
                                    : "border-border bg-muted/30 hover:border-primary/30"
                            )}
                        >
                            <span className="text-2xl">{mood.emoji}</span>
                            <span className={cn(
                                "text-[10px] font-medium leading-tight text-center",
                                selected === mood.value ? "text-primary" : "text-muted-foreground"
                            )}>
                                {mood.label}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Confirm Button */}
                <button
                    disabled={!selected || isPending}
                    onClick={() => selected && onConfirm(selected)}
                    className={cn(
                        "w-full py-4 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2",
                        selected && !isPending
                            ? "bg-primary text-primary-foreground hover:opacity-90 active:scale-[0.98] shadow-md shadow-primary/20"
                            : "bg-muted text-muted-foreground cursor-not-allowed"
                    )}
                >
                    <Heart className="w-4 h-4" />
                    {isPending ? "Recording..." : "Confirm & Earn +5 Points"}
                </button>
            </div>
        </div>
    );
};

export default MoodRatingSheet;
