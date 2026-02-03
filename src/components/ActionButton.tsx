import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "soft" | "coral";
  disabled?: boolean;
}

const ActionButton = ({ icon, label, onClick, variant = "soft", disabled }: ActionButtonProps) => {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:opacity-90",
    secondary: "bg-secondary text-secondary-foreground hover:opacity-90",
    soft: "bg-muted text-foreground hover:bg-muted/80",
    coral: "bg-coral/30 text-coral-foreground hover:bg-coral/40",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 
        active:scale-[0.97] ${variants[variant]} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <span className="text-2xl">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};

export default ActionButton;
