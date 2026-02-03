import { useState } from "react";
import { ArrowLeft, Check, X, Dog, Image, Users, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

const mockPendingDogs = [
  { id: "1", name: "Rocky", submittedBy: "Rahul", zone: "Library Area", image: "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400" },
  { id: "2", name: "Sheru", submittedBy: "Ananya", zone: "Food Court", image: "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400" },
];

const mockPendingImages = [
  { id: "1", submittedBy: "Priya", image: "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400" },
  { id: "2", submittedBy: "Vikram", image: "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400" },
];

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<"dogs" | "images">("dogs");
  const [pendingDogs, setPendingDogs] = useState(mockPendingDogs);
  const [pendingImages, setPendingImages] = useState(mockPendingImages);

  const handleApproveDog = (id: string) => {
    setPendingDogs((prev) => prev.filter((d) => d.id !== id));
    toast({
      title: "Dog profile approved! ✅",
      description: "The profile is now live on CampusPaws.",
    });
  };

  const handleRejectDog = (id: string) => {
    setPendingDogs((prev) => prev.filter((d) => d.id !== id));
    toast({
      title: "Profile rejected",
      description: "The submitter will be notified.",
    });
  };

  const handleApproveImage = (id: string) => {
    setPendingImages((prev) => prev.filter((i) => i.id !== id));
    toast({
      title: "Image approved! ✅",
      description: "The image is now visible in the gallery.",
    });
  };

  const handleRejectImage = (id: string) => {
    setPendingImages((prev) => prev.filter((i) => i.id !== id));
    toast({
      title: "Image rejected",
      description: "The submitter will be notified.",
    });
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="bg-primary pt-6 pb-4 px-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-primary-foreground">President Panel</h1>
            <p className="text-primary-foreground/80 text-sm">Manage approvals</p>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="px-6 -mt-2">
        <div className="card-elevated p-4 flex justify-around">
          <div className="text-center">
            <p className="text-2xl font-bold text-coral">{pendingDogs.length}</p>
            <p className="text-xs text-muted-foreground">Pending Dogs</p>
          </div>
          <div className="w-px bg-border" />
          <div className="text-center">
            <p className="text-2xl font-bold text-accent">{pendingImages.length}</p>
            <p className="text-xs text-muted-foreground">Pending Images</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 mt-6">
        <div className="flex gap-2 bg-muted p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("dogs")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium 
              transition-all ${
                activeTab === "dogs"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
          >
            <Dog className="w-4 h-4" />
            Dog Profiles
          </button>
          <button
            onClick={() => setActiveTab("images")}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium 
              transition-all ${
                activeTab === "images"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground"
              }`}
          >
            <Image className="w-4 h-4" />
            Gallery Images
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 mt-6 space-y-3">
        {activeTab === "dogs" ? (
          pendingDogs.length > 0 ? (
            pendingDogs.map((dog) => (
              <div key={dog.id} className="card-warm p-4">
                <div className="flex gap-3">
                  <img
                    src={dog.image}
                    alt={dog.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{dog.name}</h3>
                    <p className="text-sm text-muted-foreground">Zone: {dog.zone}</p>
                    <p className="text-xs text-muted-foreground">By: {dog.submittedBy}</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => handleApproveDog(dog.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-secondary text-secondary-foreground 
                      py-2 rounded-xl font-medium transition-all hover:opacity-90"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectDog(dog.id)}
                    className="flex-1 flex items-center justify-center gap-1 bg-destructive/20 text-destructive-foreground 
                      py-2 rounded-xl font-medium transition-all hover:opacity-90"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Dog className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No pending dog profiles 🎉</p>
            </div>
          )
        ) : pendingImages.length > 0 ? (
          pendingImages.map((img) => (
            <div key={img.id} className="card-warm p-4">
              <img
                src={img.image}
                alt="Pending"
                className="w-full h-40 rounded-xl object-cover"
              />
              <p className="text-sm text-muted-foreground mt-2">Submitted by: {img.submittedBy}</p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => handleApproveImage(img.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-secondary text-secondary-foreground 
                    py-2 rounded-xl font-medium transition-all hover:opacity-90"
                >
                  <Check className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => handleRejectImage(img.id)}
                  className="flex-1 flex items-center justify-center gap-1 bg-destructive/20 text-destructive-foreground 
                    py-2 rounded-xl font-medium transition-all hover:opacity-90"
                >
                  <X className="w-4 h-4" />
                  Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No pending images 🎉</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default AdminPanel;
