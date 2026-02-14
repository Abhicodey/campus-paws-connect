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
import { LayoutContainer } from "@/components/layout-container"; // Added import

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
    <div className="min-h-screen bg-background">
      <LayoutContainer>
        {/* Header */}
        <header className="pt-6 px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Campus Gallery</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Memories with our furry friends 📸
              </p>
            </div>
            {/* Upload Button (Header) - Visible on desktop */}
            <div className="hidden md:block">
              <button
                onClick={() => isPresident ? fileInputRef.current?.click() : setShowUploadNote(true)}
                disabled={!canParticipate}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-2 rounded-xl text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                Upload Photo
              </button>
            </div>
          </div>
        </header>

        {/* Username Status Banner */}
        <div className="px-6 mt-4">
          <UsernameStatusBanner />
        </div>

        {/* Gallery Grid */}
        <div className="px-6 mt-6 max-w-3xl mx-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
              <p className="text-muted-foreground text-sm">Loading memories...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Something went wrong. Please try again.</p>
            </div>
          ) : images && images.length > 0 ? (
            <div className="columns-2 md:columns-3 gap-4 space-y-4">
              {images.map((image) => (
                <div key={image.id} className="break-inside-avoid">
                  <GalleryImage
                    imageId={image.id}
                    src={image.display_url}
                    alt="Campus dog"
                    username={image.users?.username || 'Anonymous'}
                    uploaderId={image.user_id}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <p>No photos yet. Be the first to share a memory! 📸</p>
            </div>
          )}
        </div>
      </LayoutContainer>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept="image/*"
        className="hidden"
      />

      {/* Upload FAB (Mobile) */}
      <div className="fixed bottom-24 right-6 md:hidden">
        <button
          onClick={() => isPresident ? fileInputRef.current?.click() : setShowUploadNote(true)}
          disabled={!canParticipate || uploading}
          className="w-14 h-14 bg-primary text-primary-foreground
            rounded-full shadow-warm flex items-center justify-center transition-all
            hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed z-50"
        >
          {uploading ? (
            <Loader2 className="w-6 h-6 animate-spin" />
          ) : (
            <>
              <Upload className="w-5 h-5" />
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

    </div>
  );
};

export default Gallery;
