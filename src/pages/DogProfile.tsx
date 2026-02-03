import { useState } from "react";
import { ArrowLeft, MapPin, Clock, Bone, Heart, Navigation, Edit } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import StatusTag from "@/components/StatusTag";
import ActionButton from "@/components/ActionButton";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

// Mock data - would come from backend
const mockDogs: Record<string, {
  name: string;
  image: string;
  status: "friendly" | "shy" | "care" | "avoid";
  location: string;
  lastFed: string;
  lastPet: string;
}> = {
  "1": {
    name: "Buddy",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800",
    status: "friendly",
    location: "Near Library",
    lastFed: "2 hours ago",
    lastPet: "30 minutes ago",
  },
  "2": {
    name: "Brownie",
    image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=800",
    status: "shy",
    location: "Food Court Area",
    lastFed: "5 hours ago",
    lastPet: "1 hour ago",
  },
};

const DogProfile = () => {
  const { id } = useParams();
  const dog = mockDogs[id || "1"] || mockDogs["1"];
  const [isActioning, setIsActioning] = useState(false);

  const handleAction = (action: string, emoji: string) => {
    setIsActioning(true);
    setTimeout(() => {
      setIsActioning(false);
      toast({
        title: `Thanks for caring! ${emoji}`,
        description: `+10 kindness points for ${action.toLowerCase()}ing ${dog.name}!`,
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header with image */}
      <div className="relative">
        <img
          src={dog.image}
          alt={dog.name}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
        
        <Link
          to="/dogs"
          className="absolute top-4 left-4 p-2 rounded-full bg-card/80 backdrop-blur-sm 
            text-foreground hover:bg-card transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
      </div>

      {/* Content */}
      <div className="px-6 -mt-8 relative">
        <div className="card-elevated p-5">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{dog.name}</h1>
              <div className="flex items-center gap-1 text-muted-foreground mt-1">
                <MapPin className="w-4 h-4" />
                <span className="text-sm">Usually seen near: {dog.location}</span>
              </div>
            </div>
          </div>

          {/* Status Tags */}
          <div className="flex flex-wrap gap-2 mt-4">
            <StatusTag type={dog.status} label={
              dog.status === "friendly" ? "Friendly" :
              dog.status === "shy" ? "Shy" :
              dog.status === "care" ? "Needs Care" : "Avoid Feeding"
            } />
          </div>

          {/* Last Actions */}
          <div className="mt-5 pt-4 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last fed: {dog.lastFed}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
              <Clock className="w-4 h-4" />
              <span>Last pet: {dog.lastPet}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-5">
          <ActionButton
            icon={<Bone className="w-6 h-6" />}
            label="Feed"
            variant="secondary"
            onClick={() => handleAction("Feed", "🦴")}
            disabled={isActioning}
          />
          <ActionButton
            icon={<Heart className="w-6 h-6" />}
            label="Pet"
            variant="coral"
            onClick={() => handleAction("Pet", "🐾")}
            disabled={isActioning}
          />
          <ActionButton
            icon={<Navigation className="w-6 h-6" />}
            label="Update Location"
            variant="soft"
            onClick={() => handleAction("Update location for", "📍")}
            disabled={isActioning}
          />
          <ActionButton
            icon={<Edit className="w-6 h-6" />}
            label="Update Details"
            variant="soft"
            onClick={() => handleAction("Update", "✏️")}
            disabled={isActioning}
          />
        </div>

        {/* Note */}
        <p className="text-center text-xs text-muted-foreground mt-6 px-4">
          Actions are available once every 12 hours to ensure fair caring opportunities for everyone 💚
        </p>
      </div>

      <BottomNav />
    </div>
  );
};

export default DogProfile;
