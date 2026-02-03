interface StatusTagProps {
  type: "friendly" | "shy" | "care" | "avoid";
  label: string;
}

const StatusTag = ({ type, label }: StatusTagProps) => {
  const styles = {
    friendly: "bg-secondary/30 text-secondary-foreground",
    shy: "bg-accent/40 text-accent-foreground",
    care: "bg-coral/40 text-coral-foreground",
    avoid: "bg-destructive/40 text-destructive-foreground",
  };

  return (
    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${styles[type]}`}>
      {label}
    </span>
  );
};

export default StatusTag;
