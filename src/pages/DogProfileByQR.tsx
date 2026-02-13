import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { useDogByQRCode } from "@/hooks/useDogProfile";

const DogProfileByQR = () => {
    const { qrCode } = useParams<{ qrCode: string }>();
    const navigate = useNavigate();
    const { data: dog, isLoading, error } = useDogByQRCode(qrCode);

    useEffect(() => {
        if (dog?.id) {
            // Redirect to the dog profile page using the UUID
            navigate(`/dog/${dog.id}`, { replace: true });
        }
    }, [dog, navigate]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-muted-foreground text-sm">Loading dog profile...</p>
                </div>
            </div>
        );
    }

    if (error || !dog) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
                <AlertTriangle className="w-12 h-12 text-muted-foreground mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">Dog Not Found</h2>
                <p className="text-muted-foreground text-center mb-6">
                    This QR code doesn't match any verified dog in our system.
                </p>
                <Link
                    to="/dogs"
                    className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-medium"
                >
                    Browse All Dogs
                </Link>
            </div>
        );
    }

    // This will only show briefly before redirect
    return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground text-sm">Redirecting...</p>
            </div>
        </div>
    );
};

export default DogProfileByQR;
