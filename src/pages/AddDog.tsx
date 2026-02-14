import { useState, useRef } from "react";
import { ArrowLeft, Upload, Camera, MapPin, Info, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUsernameStatus } from "@/hooks/useUsernameStatus";
import { useUpload } from "@/hooks/useUpload";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";

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
  const queryClient = useQueryClient();
  const { authUser, profile } = useAuth();
  const { canParticipate } = useUsernameStatus();
  const { uploading, uploadDogImage } = useUpload();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user is president or superadmin
  const isAdmin = profile?.role === 'president' || profile?.is_super_admin;

  const [name, setName] = useState("");
  const [zone, setZone] = useState("");
  const [description, setDescription] = useState("");
  const [qrCode, setQrCode] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file",
          description: "Please select an image file",
          variant: "destructive",
        });
        return;
      }

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
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !zone) {
      toast({
        title: "Please fill all fields",
        description: "Name and zone are required",
        variant: "destructive",
      });
      return;
    }

    if (!authUser) {
      toast({
        title: "Login required",
        description: "Please log in to register a dog",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!canParticipate) {
      toast({
        title: "Username required",
        description: "Please set up your username to register a dog.",
        variant: "destructive",
      });
      navigate("/setup-username");
      return;
    }

    setSubmitting(true);

    try {
      // Generate a temporary ID for the dog to upload image
      const tempId = crypto.randomUUID();
      let imageUrl: string | null = null;

      // Upload image if selected
      if (selectedFile) {
        const { url, error: uploadError } = await uploadDogImage(selectedFile, tempId);
        if (uploadError) {
          throw new Error(uploadError);
        }
        imageUrl = url;
      }

      // Insert dog into database
      const { error: dbError } = await supabase
        .from('dogs')
        .insert({
          id: tempId,
          temporary_name: name.trim(), // New lifecycle field
          name: name.trim(), // Backward compatibility (acts as display name)
          profile_image: imageUrl,
          description: description.trim() || null,
          soft_locations: [zone],
          vaccination_status: 'unknown',
          sterilized: null,
          verified: isAdmin, // Presidents/superadmins create verified dogs
          created_by: authUser.id,
          is_active: true,
          status: isAdmin ? 'approved' : 'pending', // Auto-approve for admins
          is_hidden: false,
          qr_code: isAdmin && qrCode.trim() ? qrCode.trim() : null, // Only save QR for admins
        } as any);

      if (dbError) {
        throw new Error(dbError.message);
      }

      toast({
        title: isAdmin ? "Dog registered! 🐾" : "Profile submitted! 🐾",
        description: isAdmin
          ? "The dog profile is now live and visible to everyone."
          : "Your submission will be reviewed by the President before going live.",
      });

      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['admin', 'pending-dogs'] });

      // Cleanup and navigate
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setTimeout(() => navigate("/dogs"), 1500);

    } catch (err: any) {
      toast({
        title: "Submission failed",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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

      {/* Username Status Banner */}
      <UsernameStatusBanner className="mx-6 mt-4" />

      <form onSubmit={handleSubmit} className="px-6 mt-6 space-y-5">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Dog Photo
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 card-warm flex flex-col items-center justify-center gap-3 
              text-muted-foreground transition-all hover:bg-muted/50 overflow-hidden"
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
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
            maxLength={50}
            className="w-full bg-muted rounded-xl py-3 px-4 text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Description Input */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any distinguishing features, personality traits..."
            rows={3}
            maxLength={500}
            className="w-full bg-muted rounded-xl py-3 px-4 text-foreground 
              placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
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
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${zone === z
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
              >
                {z}
              </button>
            ))}
          </div>
        </div>

        {/* QR Code Input (Presidents/Superadmins Only) */}
        {isAdmin && (
          <div className="bg-secondary/30 rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                <span className="text-lg">👑</span>
              </div>
              <label className="text-sm font-medium text-foreground">
                QR Code (Official Collar)
              </label>
            </div>
            <input
              type="text"
              value={qrCode}
              onChange={(e) => setQrCode(e.target.value)}
              placeholder="e.g., CP-1001, CP-1002..."
              maxLength={50}
              className="w-full bg-background rounded-xl py-3 px-4 text-foreground 
                placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/50"
            />
            <p className="text-xs text-muted-foreground">
              Enter the QR code from the official collar. Dogs with QR codes are automatically verified.
            </p>
          </div>
        )}

        {/* Info Note */}
        {!isAdmin && (
          <div className="bg-accent/30 rounded-2xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-accent-foreground mt-0.5 flex-shrink-0" />
            <p className="text-sm text-accent-foreground">
              This profile will be verified by the President before going live.
              This helps ensure accuracy and prevent duplicates. Thank you for helping! 🐾
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting || uploading}
          className="w-full bg-primary text-primary-foreground py-4 rounded-2xl font-semibold 
            transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 
            flex items-center justify-center gap-2"
        >
          {(submitting || uploading) && <Loader2 className="w-5 h-5 animate-spin" />}
          {submitting ? 'Submitting...' : (isAdmin ? 'Register Dog' : 'Submit for Review')}
        </button>
      </form>

    </div>
  );
};

export default AddDog;
