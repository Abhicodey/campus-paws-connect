import { MapPin } from "lucide-react";
import StatusTag from "./StatusTag";

interface DogCardProps {
  id: string;
  name: string;
  image: string;
  location: string;
  status: "friendly" | "shy" | "care" | "avoid";
  onClick?: () => void;
}

const DogCard = ({ name, image, location, status, onClick }: DogCardProps) => {
  const statusLabels = {
    friendly: "Friendly",
    shy: "Shy",
    care: "Needs Care",
    avoid: "Avoid Feeding",
  };

  return (
    <button
      onClick={onClick}
      className="bg-card border border-border/50 rounded-2xl p-4 flex gap-4 w-full text-left transition-all duration-200 
        hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5 active:scale-[0.99] group shadow-sm"
    >
      <div className="relative overflow-hidden rounded-xl w-24 h-24 shrink-0">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors" />
      </div>

      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
        <div>
          <h3 className="font-bold text-lg text-foreground truncate pr-2 group-hover:text-primary transition-colors">{name}</h3>
          <div className="flex items-center gap-1.5 text-muted-foreground text-sm mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{location}</span>
          </div>
        </div>
        <div className="mt-3">
          <StatusTag type={status} label={statusLabels[status]} />
        </div>
      </div>
    </button>
  );
};

export default DogCard;
