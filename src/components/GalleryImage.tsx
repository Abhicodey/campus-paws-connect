import { useState } from "react";
import { X } from "lucide-react";

interface GalleryImageProps {
  src: string;
  alt: string;
}

const GalleryImage = ({ src, alt }: GalleryImageProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="aspect-square rounded-2xl overflow-hidden bg-muted transition-all duration-200 
          hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
        />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/80 z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-card text-foreground hover:bg-muted"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] rounded-2xl object-contain animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default GalleryImage;
