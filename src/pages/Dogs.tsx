import { useNavigate } from "react-router-dom";
import DogCard from "@/components/DogCard";
import BottomNav from "@/components/BottomNav";
import { Plus, Search, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useDogs } from "@/hooks/useDogs";
import { getBehaviourLabel, getBehaviourDisplay } from "@/types/database.types";
import { LayoutContainer } from "@/components/layout-container"; // Added import

const Dogs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: dogs, isLoading, error } = useDogs(searchQuery);

  // Map behaviour score to status for DogCard
  const getStatusFromBehaviourScore = (score: number = 0): "friendly" | "shy" | "care" | "avoid" => {
    const label = getBehaviourLabel(score);
    switch (label) {
      case 'generally_friendly':
        return 'friendly';
      case 'usually_calm':
        return 'friendly';
      case 'shy_cautious':
        return 'shy';
      case 'needs_space':
        return 'avoid';
      default:
        return 'friendly';
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <LayoutContainer>
        {/* Header */}
        <header className="pt-6 px-6">
          <h1 className="text-2xl font-bold text-foreground">Campus Dogs</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isLoading ? '...' : `${dogs?.length || 0} friends registered`}
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground text-sm">Loading dogs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : dogs && dogs.length > 0 ? (
            dogs.map((dog) => (
              <DogCard
                key={dog.id}
                id={dog.id}
                name={dog.name}
                image={dog.profile_image || "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400"}
                location={dog.soft_locations?.[0] || "Campus"}
                status={getStatusFromBehaviourScore(0)} // Will be updated when we fetch summary
                onClick={() => navigate(`/dog/${dog.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              {searchQuery ? (
                <p>No dogs found matching "{searchQuery}"</p>
              ) : (
                <p>No dogs registered yet. Be the first to add one!</p>
              )}
            </div>
          )}
        </div>
      </LayoutContainer>

      {/* Add Dog FAB */}
      <Link
        to="/add-dog"
        className="fixed bottom-24 right-6 w-14 h-14 bg-primary text-primary-foreground 
          rounded-full shadow-warm flex items-center justify-center transition-all 
          hover:opacity-90 active:scale-95 z-50"
      >
        <Plus className="w-6 h-6" />
      </Link>

      <BottomNav />
    </div>
  );
};

export default Dogs;
