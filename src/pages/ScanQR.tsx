import { useState, useEffect } from "react";
import { ArrowLeft, Camera, CheckCircle, XCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import dogBuddy from "@/assets/dog-buddy.png";

const ScanQR = () => {
  const navigate = useNavigate();
  const [scanning, setScanning] = useState(true);
  const [found, setFound] = useState(false);

  // Simulate QR scan result
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        setScanning(false);
        setFound(true);
        // Navigate to dog profile after successful scan
        setTimeout(() => navigate("/dog/1"), 1500);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [scanning, navigate]);

  return (
    <div className="min-h-screen bg-background pb-24 flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 pt-6 px-6">
        <Link
          to="/"
          className="p-2 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-all"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-foreground">Scan Dog QR</h1>
          <p className="text-muted-foreground text-sm">Point camera at a QR tag</p>
        </div>
      </header>

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6">
        <div className="relative w-64 h-64 mb-6">
          {/* Scanner Frame */}
          <div className="absolute inset-0 border-4 border-primary rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
              {scanning ? (
                <div className="text-center">
                  <Camera className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-soft" />
                  <p className="text-muted-foreground text-sm">Scanning...</p>
                </div>
              ) : found ? (
                <div className="text-center animate-scale-in">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Dog Found!</p>
                </div>
              ) : (
                <div className="text-center">
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-foreground font-medium">Not Found</p>
                </div>
              )}
            </div>
            
            {/* Animated scan line */}
            {scanning && (
              <div className="absolute left-0 right-0 h-1 bg-primary/60 animate-[scan_2s_ease-in-out_infinite]" 
                style={{
                  animation: "scan 2s ease-in-out infinite",
                }}
              />
            )}
          </div>

          {/* Corner markers */}
          <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-lg" />
        </div>

        {/* Mascot */}
        <img src={dogBuddy} alt="CampusPaws mascot" className="w-20 h-20 animate-float" />

        {/* Instructions */}
        <p className="text-center text-muted-foreground text-sm mt-4 px-8">
          Each campus dog has a QR tag on their collar. Scan it to view their profile and log your caring actions!
        </p>

        {/* Manual Entry */}
        <Link
          to="/dogs"
          className="mt-6 text-primary font-medium text-sm underline"
        >
          Or browse all dogs manually
        </Link>
      </div>

      <BottomNav />

      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </div>
  );
};

export default ScanQR;
