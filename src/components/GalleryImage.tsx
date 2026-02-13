import { useState } from "react";
import { X, Flag, Trash2, Loader2 } from "lucide-react";
import { useReportContent } from "@/hooks/useReport";
import { useAuth } from "@/contexts/AuthContext";
import { useRejectImage } from "@/hooks/useAdmin";

interface GalleryImageProps {
  src: string;
  alt: string;
  imageId?: string;
  uploaderId?: string;
  username?: string | null;
}

const GalleryImage = ({ src, alt, imageId, uploaderId, username }: GalleryImageProps) => {
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
      <div className="w-full">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full rounded-2xl overflow-hidden bg-muted transition-all duration-200 
            hover:scale-[1.02] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-primary/50"
        >
          <img
            src={src}
            alt={alt}
            className="w-full h-auto object-cover"
            loading="lazy"
          />
        </button>

        {/* Username and Report on Card */}
        <div className="flex items-center justify-between mt-2 px-1">
          <span className="text-sm text-muted-foreground">
            @{username || 'anonymous'}
          </span>
          {authUser && imageId && uploaderId && (
            <button
              onClick={handleReport}
              disabled={reportMutation.isPending}
              className="text-xs text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {reportMutation.isPending ? "Reporting..." : "Report"}
            </button>
          )}
        </div>
      </div>

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

          {/* Username display in modal */}
          <div className="absolute top-4 left-4 px-4 py-2 rounded-xl bg-card/90 backdrop-blur-sm">
            <span className="text-sm text-foreground font-medium">
              @{username || 'anonymous'}
            </span>
          </div>

          {/* Report and Delete buttons */}
          <div className="absolute bottom-6 right-6 flex gap-2">
            {(profile?.is_super_admin || profile?.role === 'president') && imageId && (
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                    bg-destructive text-destructive-foreground text-sm font-medium
                    hover:opacity-90 transition-all disabled:opacity-50"
              >
                {deleteMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete Permanently
              </button>
            )}

            {authUser && imageId && uploaderId && (
              <button
                onClick={handleReport}
                disabled={reportMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl 
                    bg-secondary/90 text-secondary-foreground text-sm font-medium
                    hover:bg-secondary transition-all disabled:opacity-50 backdrop-blur-sm"
              >
                <Flag className="w-4 h-4" />
                {reportMutation.isPending ? "Reporting..." : "Report"}
              </button>
            )}
          </div>

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
