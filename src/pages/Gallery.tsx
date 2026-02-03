import { useState } from "react";
import GalleryImage from "@/components/GalleryImage";
import BottomNav from "@/components/BottomNav";
import { Upload, Info } from "lucide-react";

const mockImages = [
  "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400",
  "https://images.unsplash.com/photo-1558788353-f76d92427f16?w=400",
  "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=400",
  "https://images.unsplash.com/photo-1517849845537-4d257902454a?w=400",
  "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400",
  "https://images.unsplash.com/photo-1544568100-847a948585b9?w=400",
  "https://images.unsplash.com/photo-1537151625747-768eb6cf92b2?w=400",
  "https://images.unsplash.com/photo-1477884213360-7e9d7dcc1e48?w=400",
  "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400",
];

const Gallery = () => {
  const [showUploadNote, setShowUploadNote] = useState(false);

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-6 px-6">
        <h1 className="text-2xl font-bold text-foreground">Campus Gallery</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cute moments from our campus friends
        </p>
      </header>

      {/* Gallery Grid */}
      <div className="px-4 mt-6">
        <div className="grid grid-cols-3 gap-2">
          {mockImages.map((src, index) => (
            <GalleryImage
              key={index}
              src={src}
              alt={`Campus dog ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Upload Button */}
      <div className="px-6 mt-6">
        <button
          onClick={() => setShowUploadNote(true)}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground 
            py-3 px-6 rounded-2xl font-medium transition-all hover:opacity-90 active:scale-[0.98]"
        >
          <Upload className="w-5 h-5" />
          Upload Photo
        </button>
      </div>

      {/* Upload Note Modal */}
      {showUploadNote && (
        <div
          className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowUploadNote(false)}
        >
          <div
            className="bg-card rounded-3xl p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                <Info className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Before You Upload</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              All images are reviewed by the community president before being published to ensure 
              appropriate and respectful content. Thank you for contributing! 🐾
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowUploadNote(false)}
                className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowUploadNote(false)}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default Gallery;
