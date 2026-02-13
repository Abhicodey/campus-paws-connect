import { useState, useRef } from "react";
import GalleryImage from "@/components/GalleryImage";
import BottomNav from "@/components/BottomNav";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { Upload, Info, Loader2, X } from "lucide-react";
import { useGallery } from "@/hooks/useGallery";
import { useUpload } from "@/hooks/useUpload";
import { useAuth } from "@/contexts/AuthContext";
import { useUsernameStatus } from "@/hooks/useUsernameStatus";
import { supabase } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const Gallery = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { authUser, profile, isPresident } = useAuth();
  const { canParticipate } = useUsernameStatus();
  const { data: images, isLoading, error } = useGallery();
  const { uploading, uploadGalleryImage } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showUploadNote, setShowUploadNote] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file format",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image under 5MB",
          variant: "destructive",
        });
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setShowUploadNote(true);
    }
  };

  const handleUpload = async () => {
    if (!authUser) {
      toast({
        title: "Login required",
        description: "Please log in to upload images",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!canParticipate) {
      toast({
        title: "Username required",
        description: "Please set up your username to upload images.",
        variant: "destructive",
      });
      navigate("/setup-username");
      return;
    }

    if (!selectedFile) return;

    const { path, error: uploadError } = await uploadGalleryImage(selectedFile, profile?.role);

    if (uploadError || !path) {
      toast({
        title: "Upload failed",
        description: uploadError || "Something went wrong",
        variant: "destructive",
      });
      return;
    }


    const { error: dbError } = await supabase
      .from('gallery_images')
      .insert({
        user_id: authUser.id,
        file_path: path,
        status: isPresident ? 'approved' : 'pending',
      } as any);

    if (dbError) {
      toast({
        title: "Upload failed",
        description: dbError.message,
        variant: "destructive",
      });
      return;
    }

    // Invalidate gallery cache so new image shows immediately
    queryClient.invalidateQueries({ queryKey: ['gallery'] });

    toast({
      title: isPresident ? "Photo published! 📸" : "Photo submitted! 📸",
      description: isPresident
        ? "Your image is now live in the gallery."
        : "Your image will appear after approval by a moderator.",
    });

    // Cleanup
    setShowUploadNote(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const cancelUpload = () => {
    setShowUploadNote(false);
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="pt-6 px-6">
        <h1 className="text-2xl font-bold text-foreground">Campus Gallery</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Cute moments from our campus friends
        </p>
      </header>

      {/* Username Status Banner */}
      <UsernameStatusBanner className="mx-6 mt-4" />

      {/* Gallery Grid */}
      <div className="px-4 mt-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
            <p className="text-muted-foreground text-sm">Loading gallery...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-muted-foreground">
            <p>Something went wrong. Please try again.</p>
          </div>
        ) : images && images.length > 0 ? (
          <div style={{ columnCount: 2, columnGap: '8px' }} className="sm:columns-3">
            {images.map((image) => (
              <div key={image.id} style={{ breakInside: 'avoid', marginBottom: '8px' }}>
                <GalleryImage
                  src={image.display_url}
                  alt="Campus dog"
                  imageId={image.id}
                  uploaderId={image.user_id}
                  username={image.users?.username}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No photos yet. Be the first to share! 📸</p>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <div className="px-6 mt-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 bg-secondary text-secondary-foreground 
            py-3 px-6 rounded-2xl font-medium transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Photo
            </>
          )}
        </button>
      </div>

      {/* Upload Confirmation Modal */}
      {showUploadNote && (
        <div
          className="fixed inset-0 bg-foreground/50 z-50 flex items-end sm:items-center justify-center p-4 animate-fade-in"
          onClick={cancelUpload}
        >
          <div
            className="bg-card rounded-3xl p-6 w-full max-w-sm animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Preview */}
            {previewUrl && (
              <div className="relative mb-4">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-2xl"
                />
                <button
                  onClick={cancelUpload}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-foreground/50 text-card"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent/30 flex items-center justify-center">
                <Info className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="font-semibold text-foreground">Before You Upload</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              {isPresident
                ? "As president, your images will be published directly to the gallery. 🐾"
                : "All images are reviewed by the community president before being published to ensure appropriate and respectful content. Thank you for contributing! 🐾"
              }
            </p>
            <div className="flex gap-3">
              <button
                onClick={cancelUpload}
                className="flex-1 bg-muted text-muted-foreground py-3 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="flex-1 bg-primary text-primary-foreground py-3 rounded-xl font-medium 
                  disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                Upload
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
