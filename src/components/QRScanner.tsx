import { useEffect, useRef } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanFailure?: (error: string) => void;
    facingMode?: "user" | "environment";
}

export const QRScanner = ({ onScanSuccess, onScanFailure, facingMode = "environment" }: QRScannerProps) => {
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const regionId = "qr-reader";

    useEffect(() => {
        scannerRef.current = new Html5Qrcode(regionId);

        const config = {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            aspectRatio: 1.0,
            formatsToSupport: [Html5QrcodeSupportedFormats.QR_CODE]
        };

        scannerRef.current.start(
            { facingMode },
            config,
            (decodedText) => {
                onScanSuccess(decodedText);
            },
            (errorMessage) => {
                if (onScanFailure) onScanFailure(errorMessage);
            }
        ).catch(err => {
            console.error("Scanner start error:", err);
        });

        return () => {
            if (scannerRef.current?.isScanning) {
                scannerRef.current.stop().catch(err => console.error("Scanner stop error:", err));
            }
        };
    }, [facingMode, onScanSuccess, onScanFailure]);

    return <div id={regionId} className="w-full h-full rounded-3xl overflow-hidden" />;
};
