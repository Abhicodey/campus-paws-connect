import { ReactNode } from "react";

interface BadgeProps {
  icon: ReactNode;
  label: string;
  earned?: boolean;
}

const Badge = ({ icon, label, earned = true }: BadgeProps) => {
  return (
    <div
      className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all ${
        earned
          ? "bg-secondary/20 text-secondary-foreground"
          : "bg-muted/50 text-muted-foreground opacity-50"
      }`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </div>
  );
};

export default Badge;
