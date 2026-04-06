import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Camera, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Page from "@/components/layout/Page";
import { UsernameStatusBanner } from "@/components/UsernameStatusBanner";
import { useDogByQRCode } from "@/hooks/useDogProfile";


import { QRScanner } from "@/components/QRScanner";

const ScanQR = () => {
  const navigate = useNavigate();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState("");
  const [showManualInput, setShowManualInput] = useState(false);
  const [isScanning, setIsScanning] = useState(true);

  // Query for dog by QR code
  const { data: foundDog, isLoading: isSearching, error } = useDogByQRCode(qrCode || undefined);

  // Navigate to dog profile when found
  useEffect(() => {
    if (foundDog?.id) {
      setIsScanning(false);
      setTimeout(() => navigate(`/dog/${foundDog.id}`), 1500);
    }
  }, [foundDog, navigate]);

  const handleManualSearch = () => {
    if (manualInput.trim()) {
      setQrCode(manualInput.trim());
      setIsScanning(false);
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    setQrCode(decodedText);
    setIsScanning(false);
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
        <div className="relative w-72 h-72 mb-6">
          {/* Scanner Frame */}
          <div className="absolute inset-0 border-4 border-primary rounded-3xl overflow-hidden shadow-2xl">
            {isScanning ? (
              <QRScanner onScanSuccess={handleScanSuccess} facingMode="environment" />
            ) : (
              <div className="absolute inset-0 bg-muted/90 flex items-center justify-center p-6 text-center">
                {isSearching ? (
                  <div className="animate-in fade-in zoom-in duration-300">
                    <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
                    <p className="text-foreground font-semibold">Verifying Tag...</p>
                  </div>
                ) : foundDog ? (
                  <div className="animate-in fade-in zoom-in duration-500 scale-110">
                    <div className="relative mx-auto mb-4">
                      <CheckCircle className="w-20 h-20 text-secondary" />
                      <div className="absolute inset-0 bg-secondary/20 rounded-full animate-ping" />
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-1">{foundDog.name}</p>
                    <p className="text-muted-foreground text-sm">Transferring to profile...</p>
                  </div>
                ) : (
                  <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <XCircle className="w-12 h-12 text-destructive" />
                    </div>
                    <p className="text-foreground font-bold text-lg">Unrecognized Tag</p>
                    <p className="text-muted-foreground text-sm mt-1 mb-6 px-4">
                      This QR code isn't registered in our system yet.
                    </p>
                    <button
                      onClick={() => { setQrCode(null); setIsScanning(true); }}
                      className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold hover:scale-[1.02] active:scale-[0.98] transition-all"
                    >
                      Try Again
                    </button>
                  </div>
                )}
              </div>
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
    </Page >
  );
};

export default ScanQR;
