import { useState } from "react";
import { X, Flag, Trash2, Loader2 } from "lucide-react";
import { useReportContent } from "@/hooks/useReport";
import { useAuth } from "@/contexts/AuthContext";
import { useRejectImage } from "@/hooks/useAdmin";
import { cn } from "@/lib/utils";

interface GalleryImageProps {
  src: string;
  alt: string;
  imageId?: string;
  uploaderId?: string;
  username?: string | null;
  className?: string; // Added className prop
}

const GalleryImage = ({ src, alt, imageId, uploaderId, username, className }: GalleryImageProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const { authUser, profile } = useAuth();
  const reportMutation = useReportContent();
  const deleteMutation = useRejectImage();

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!imageId || !confirm("Are you sure you want to permanently delete this image?")) return;

    deleteMutation.mutate(imageId, {
      onSuccess: () => setIsOpen(false)
    });
  };

  const handleReport = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!authUser || !imageId || !uploaderId) return;

    reportMutation.mutate({
      reported_by: authUser.id,
      reported_user: uploaderId,
      target_type: 'image',
      target_id: imageId,
      reason: 'Inappropriate content',
    });
  };

  return (
    <>
      <div
        className={cn(
          "relative w-full h-full group overflow-hidden bg-muted cursor-pointer",
          className
        )}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        {/* Overlay Layout */}
        <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-100 transition-opacity flex items-end justify-between">
          <span className="text-sm font-medium text-white truncate text-shadow-sm">
            @{username || 'anonymous'}
          </span>

          {authUser && imageId && uploaderId && (
            <button
              onClick={handleReport}
              disabled={reportMutation.isPending}
              className="text-white/80 hover:text-red-400 p-1 rounded-full hover:bg-white/10 transition-colors"
              title="Report"
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div
          className="fixed inset-0 bg-background/90 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        >
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-full bg-card text-foreground hover:bg-muted shadow-sm z-10"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Username display in modal */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-full bg-card/90 backdrop-blur-sm shadow-sm z-10 border border-border/50">
            <span className="text-sm text-foreground font-medium">
              @{username || 'anonymous'}
            </span>
          </div>

          {/* Report and Delete buttons */}
          <div className="absolute bottom-6 right-6 flex gap-2 z-10">
            {(profile?.is_super_admin || profile?.role === 'president') && imageId && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                    bg-destructive text-destructive-foreground text-sm font-medium
                    hover:opacity-90 transition-all disabled:opacity-50 shadow-sm"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            )}

            {authUser && imageId && uploaderId && (
              <button
                onClick={handleReport}
                disabled={reportMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                    bg-secondary/90 text-secondary-foreground text-sm font-medium
                    hover:bg-secondary transition-all disabled:opacity-50 backdrop-blur-sm shadow-sm"
              >
                <Flag className="w-4 h-4" />
                {reportMutation.isPending ? "Reporting..." : "Report"}
              </button>
            )}
          </div>

          <img
            src={src}
            alt={alt}
            className="max-w-full max-h-[85vh] w-auto h-auto rounded-xl object-contain shadow-2xl animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default GalleryImage;
