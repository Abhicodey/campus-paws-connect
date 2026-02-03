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
      className="card-warm p-3 flex gap-3 w-full text-left transition-all duration-200 
        hover:shadow-warm active:scale-[0.99]"
    >
      <img
        src={image}
        alt={name}
        className="w-20 h-20 rounded-xl object-cover"
      />
      <div className="flex-1 flex flex-col justify-between py-1">
        <div>
          <h3 className="font-semibold text-foreground">{name}</h3>
          <div className="flex items-center gap-1 text-muted-foreground text-sm mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{location}</span>
          </div>
        </div>
        <div className="mt-2">
          <StatusTag type={status} label={statusLabels[status]} />
        </div>
      </div>
    </button>
  );
};

export default DogCard;
