import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Page from "@/components/layout/Page";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { useDogByQRCode } from "@/hooks/useDogProfile";


const ScanQR = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);

  // Query for dog by QR code
  const { data: foundDog, isLoading: isSearching, error } = useDogByQRCode(qrCode || undefined);

  // Navigate to dog profile when found
  useEffect(() => {
    if (foundDog?.id) {
      setTimeout(() => navigate(`/dog/${foundDog.id}`), 1000);
    }
  }, [foundDog, navigate]);

  const handleManualSearch = () => {
    if (manualInput.trim()) {
      setQrCode(manualInput.trim());
    }
  };

  // Simulate QR scan for demo (since real camera requires permissions)
  const simulateScan = () => {
    // This simulates finding a QR code
    // In production, you'd integrate a real QR scanner library like html5-qrcode
    setQrCode("demo-qr-code");
  };

  return (
    <Page className="flex flex-col">
      {/* Header */}
      <header className="flex items-center gap-4 mb-4">
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

      {/* Username Status Banner */}
      <UsernameStatusBanner className="mb-4" />

      {/* Scanner Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="relative w-64 h-64 mb-6">
          {/* Scanner Frame */}
          <div className="absolute inset-0 border-4 border-primary rounded-3xl overflow-hidden">
            <div className="absolute inset-0 bg-muted/50 flex items-center justify-center">
              {isSearching ? (
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                  <p className="text-muted-foreground text-sm">Searching...</p>
                </div>
              ) : foundDog ? (
                <div className="text-center animate-scale-in">
                  <CheckCircle className="w-16 h-16 text-secondary mx-auto mb-4" />
                  <p className="text-foreground font-medium">Found {foundDog.name}!</p>
                </div>
              ) : qrCode && !foundDog && !isSearching ? (
                <div className="text-center">
                  <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                  <p className="text-foreground font-medium">Dog Not Found</p>
                  <p className="text-muted-foreground text-xs mt-1">QR code not registered</p>
                </div>
              ) : (
                <button
                  onClick={simulateScan}
                  className="text-center"
                >
                  <Camera className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse-soft" />
                  <p className="text-muted-foreground text-sm">Tap to simulate scan</p>
                </button>
              )}
            </div>

            {/* Animated scan line */}
            {!qrCode && (
              <div
                className="absolute left-0 right-0 h-1 bg-primary/60"
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

        {/* Official Logo */}
        <div className="flex items-center justify-center gap-2 mt-4">
          <img
            src="/logo.png"
            alt="CampusPaws Official Logo"
            className="w-16 h-16 object-contain select-none"
            draggable={false}
          />
        </div>

        {/* Instructions */}
        <p className="text-center text-muted-foreground text-sm mt-4 px-8">
          Each campus dog has a QR tag on their collar. Scan it to view their profile and log your caring actions!
        </p>

        {/* Manual Input Toggle */}
        {showManualInput ? (
          <div className="mt-6 w-full max-w-xs">
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter QR code..."
                className="flex-1 bg-muted rounded-xl py-3 px-4 text-foreground 
                  placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                onClick={handleManualSearch}
                disabled={!manualInput.trim() || isSearching}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-xl font-medium 
                  disabled:opacity-50 transition-all"
              >
                Go
              </button>
            </div>
            <button
              onClick={() => {
                setShowManualInput(false);
                setQrCode(null);
                setManualInput("");
              }}
              className="w-full mt-2 text-muted-foreground text-sm"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Link
              to="/dogs"
              className="text-primary font-medium text-sm underline"
            >
              Or browse all dogs manually
            </Link>
            <button
              onClick={() => setShowManualInput(true)}
              className="text-muted-foreground text-sm"
            >
              Enter QR code manually
            </button>
          </div>
        )}

        {/* Try Again Button (shown after not found) */}
        {qrCode && !foundDog && !isSearching && (
          <button
            onClick={() => {
              setQrCode(null);
              setManualInput("");
            }}
            className="mt-6 bg-muted text-muted-foreground px-6 py-3 rounded-xl font-medium"
          >
            Try Again
          </button>
        )}
      </div>


      <style>{`
        @keyframes scan {
          0%, 100% { top: 10%; }
          50% { top: 85%; }
        }
      `}</style>
    </Page>
  );
};

export default ScanQR;
