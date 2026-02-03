import { useState } from "react";
import { ArrowLeft, Upload, Camera, MapPin, Info } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { toast } from "@/hooks/use-toast";

const zones = [
  "Library Area",
  "Food Court",
  "Hostel Area",
  "Sports Ground",
  "Admin Block",
  "Engineering Block",
  "Science Block",
  "Main Gate",
];

const AddDog = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [zone, setZone] = useState("");
  const [image, setImage] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !zone) {
      toast({
        title: "Please fill all fields",
        description: "Name and zone are required",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Profile submitted! 🐾",
      description: "Your submission will be reviewed by the President before going live.",
    });

    setTimeout(() => navigate("/dogs"), 1500);
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="flex items-center gap-4 pt-6 px-6">
        <Link
          to="/dogs"
          className="p-2 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Register New Friend</h1>
          <p className="text-muted-foreground text-sm">Help us track campus dogs</p>
        </div>
      </header>

      <form onSubmit={handleSubmit} className="px-6 mt-6 space-y-5">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Dog Photo
          </label>
          <button
            type="button"
            className="w-full h-48 card-warm flex flex-col items-center justify-center gap-3 
              text-muted-foreground transition-all hover:bg-muted/50"
            onClick={() => {
              // Simulate photo selection
              setImage("https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400");
            }}
          >
            {image ? (
              <img src={image} alt="Preview" className="w-full h-full object-cover rounded-2xl" />
            ) : (
              <>
                <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-sm">Tap to upload photo</span>
              </>
            )}
          </button>
        </div>

        {/* Name Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Temporary Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Buddy, Brownie, Max..."
            className="w-full bg-muted rounded-xl py-3 px-4 text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Zone Selection */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 inline mr-1" />
            Usual Campus Zone
          </label>
          <div className="grid grid-cols-2 gap-2">
            {zones.map((z) => (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  zone === z
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* Info Note */}
        <div className="bg-accent/30 rounded-2xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
          <p className="text-sm text-accent-foreground">
            This profile will be verified by the President before going live. 
            This helps ensure accuracy and prevent duplicates. Thank you for helping! 🐾
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold 
            transition-all hover:opacity-90 active:scale-[0.98]"
        >
          Submit for Review
        </button>
      </form>

      <BottomNav />
    </div>
  );
};

export default AddDog;
