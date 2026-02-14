import { motion } from "framer-motion";
import { PawPrint, Camera, QrCode, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface HomeHeroProps {
    stats: {
        dogsFed: number;
        photos: number;
        members: number;
        todayPoints: number;
    };
    activities: {
        user: string;
        action: string;
        time: string;
    }[];
}

export default function HomeHero({ stats, activities }: HomeHeroProps) {
    const navigate = useNavigate();

    return (
        <section className="card-auto p-6 md:p-8 space-y-6">

            {/* HEADER */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold">
                        CampusPaws Today 🐾
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Live activity from your campus community
                    </p>
                </div>

                <div className="hidden md:flex items-center gap-2 text-orange-400 bg-orange-400/10 px-3 py-1.5 rounded-full">
                    <Flame className="w-5 h-5" />
                    <span className="font-semibold text-sm">{stats.todayPoints} kindness points today</span>
                </div>
            </div>

            {/* LIVE STATS */}
            <div className="grid grid-cols-3 gap-4">
                <Stat label="Dogs Fed" value={stats.dogsFed} emoji="🐶" />
                <Stat label="Photos" value={stats.photos} emoji="📸" />
                <Stat label="Members" value={stats.members} emoji="👥" />
            </div>

            {/* LIVE FEED */}
            <div className="space-y-3 max-h-56 overflow-auto pr-1">
                {activities.length > 0 ? (
                    activities.map((a, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-muted/40 rounded-xl px-4 py-3 text-sm flex items-center justify-between"
                        >
                            <div>
                                <span className="font-medium text-foreground">{a.user}</span> <span className="text-muted-foreground">{a.action}</span>
                            </div>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">{a.time}</span>
                        </motion.div>
                    ))
                ) : (
                    <div className="text-center py-4 text-muted-foreground text-sm italic">
                        No activity yet today. Be the first!
                    </div>
                )}
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-3 gap-3">
                <HeroBtn icon={PawPrint} label="Feed" onClick={() => navigate('/dogs')} />
                <HeroBtn icon={Camera} label="Upload" onClick={() => navigate('/gallery')} />
                <HeroBtn icon={QrCode} label="Scan QR" onClick={() => navigate('/scan')} />
            </div>

        </section>
    );
}

function Stat({ label, value, emoji }: { label: string, value: number, emoji: string }) {
    return (
        <div className="bg-muted/30 hover:bg-muted/50 transition-colors rounded-xl p-4 text-center cursor-default border border-transparent hover:border-border/50">
            <div className="text-2xl mb-1">{emoji}</div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wide font-medium">{label}</div>
        </div>
    );
}

function HeroBtn({ icon: Icon, label, onClick }: { icon: any, label: string, onClick?: () => void }) {
    return (
        <button
            onClick={onClick}
            className="interactive rounded-xl bg-primary text-primary-foreground py-3 flex flex-col md:flex-row items-center justify-center gap-1 md:gap-2 font-medium text-sm md:text-base shadow-sm hover:shadow-md transition-all"
        >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
        </button>
    );
}
