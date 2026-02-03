import { useNavigate } from "react-router-dom";
import DogCard from "@/components/DogCard";
import BottomNav from "@/components/BottomNav";
import { Plus, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

const mockDogs = [
  { id: "1", name: "Buddy", image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", location: "Near Library", status: "friendly" as const },
  { id: "2", name: "Brownie", image: "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400", location: "Food Court Area", status: "shy" as const },
  { id: "3", name: "Max", image: "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400", location: "Hostel Area", status: "care" as const },
  { id: "4", name: "Luna", image: "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400", location: "Sports Ground", status: "friendly" as const },
  { id: "5", name: "Charlie", image: "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400", location: "Admin Block", status: "avoid" as const },
];

const Dogs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDogs = mockDogs.filter(dog =>
    dog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dog.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-6 px-6">
        <h1 className="text-2xl font-bold text-foreground">Campus Dogs</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {mockDogs.length} friends registered
        </p>
      </header>

      {/* Search */}
      <div className="px-6 mt-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted rounded-xl py-3 pl-11 pr-4 text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
      </div>

      {/* Dogs List */}
      <div className="px-6 mt-6 space-y-3">
        {filteredDogs.map((dog) => (
          <DogCard
            key={dog.id}
            {...dog}
            onClick={() => navigate(`/dog/${dog.id}`)}
          />
        ))}

        {filteredDogs.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No dogs found matching "{searchQuery}"</p>
          </div>
        )}
      </div>

      {/* Add Dog FAB */}
      <Link
        to="/add-dog"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground 
          rounded-full shadow-warm flex items-center justify-center transition-all 
          hover:opacity-90 active:scale-95"
      >
        <Plus className="w-6 h-6" />
      </Link>

      <BottomNav />
    </div>
  );
};

export default Dogs;
