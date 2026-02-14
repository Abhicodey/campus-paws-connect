import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import BottomNav from '@/components/BottomNav';

const ReportDog = () => {
    const navigate = useNavigate();
    const { authUser } = useAuth();

    // Form state
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string>('');
    const [temporaryName, setTemporaryName] = useState('');
    const [description, setDescription] = useState('');
    const [condition, setCondition] = useState<'healthy' | 'injured' | 'needs_feeding'>('healthy');
    const [latitude, setLatitude] = useState<number | null>(null);
    const [longitude, setLongitude] = useState<number | null>(null);
    const [locationError, setLocationError] = useState('');

    // UI state
    const [submitting, setSubmitting] = useState(false);
    const [fetchingLocation, setFetchingLocation] = useState(false);

    // Get user's location on mount
    useEffect(() => {
        getCurrentLocation();
    }, []);

    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported by your browser');
            return;
        }

        setFetchingLocation(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLatitude(position.coords.latitude);
                setLongitude(position.coords.longitude);
                setFetchingLocation(false);
                setLocationError('');
            },
            (error) => {
                setFetchingLocation(false);
                setLocationError('Unable to get location. Please enable location services.');
                console.error('Geolocation error:', error);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0
            }
        );
    };

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhoto(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!authUser) {
            toast({ title: 'Error', description: 'You must be logged in to report a dog.', variant: 'destructive' });
            return;
        }

        if (!photo) {
            toast({ title: 'Error', description: 'Please upload a photo.', variant: 'destructive' });
            return;
        }

        if (!latitude || !longitude) {
            toast({ title: 'Error', description: 'Location is required. Please enable location services.', variant: 'destructive' });
            return;
        }

        setSubmitting(true);

        try {
            // 1. Upload photo to storage
            const fileExt = photo.name.split('.').pop();
            const fileName = `${authUser.id}-${Date.now()}.${fileExt}`;
            const filePath = `dogs/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('dog-images')
                .upload(filePath, photo);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('dog-images')
                .getPublicUrl(filePath);

            // 2. Create dog record (Flow 2: Unverified)
            const { data: dog, error: dogError } = await supabase
                .from('dogs')
                .insert({
                    temporary_name: temporaryName.trim() || null,
                    official_name: null,
                    description: description || `Condition: ${condition}`,
                    profile_image: publicUrl,
                    verified: false,
                    is_verified: false,
                    reported_by: authUser.id,
                    latitude,
                    longitude,
                    soft_locations: [],
                    vaccination_status: 'unknown',
                    name_locked: false,
                    is_active: true,
                    is_hidden: false
                })
                .select()
                .single();

            if (dogError) throw dogError;

            // 3. Award points for reporting (+10)
            try {
                // @ts-ignore
                await supabase.rpc('add_points', {
                    user_id: authUser.id,
                    points_to_add: 10
                });
            } catch (err) {
                console.error('Points award failed:', err);
            }

            toast({
                title: 'Dog Reported!',
                description: 'Thank you for helping! The president will verify this dog soon.',
            });

            // Redirect to home or dog profile
            navigate('/');
        } catch (error: any) {
            console.error('Error reporting dog:', error);
            toast({
                title: 'Failed to Report',
                description: error.message || 'Something went wrong. Please try again.',
                variant: 'destructive'
            });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <div className="bg-primary pt-8 pb-6 px-6">
                <h1 className="text-2xl font-bold text-primary-foreground">Report a Dog</h1>
                <p className="text-primary-foreground/80 text-sm mt-1">
                    Help us track and care for campus dogs
                </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-6 mt-6 space-y-5">
                {/* Photo Upload */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Photo <span className="text-destructive">*</span>
                    </label>
                    {!photoPreview ? (
                        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors">
                            <Camera className="w-12 h-12 text-muted-foreground mb-2" />
                            <span className="text-sm text-muted-foreground">Tap to upload photo</span>
                            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                    ) : (
                        <div className="relative">
                            <img src={photoPreview} alt="Preview" className="w-full h-48 object-cover rounded-xl" />
                            <button
                                type="button"
                                onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                                className="absolute top-2 right-2 bg-destructive text-destructive-foreground px-3 py-1 rounded-lg text-sm"
                            >
                                Remove
                            </button>
                        </div>
                    )}
                </div>

                {/* Location */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Location <span className="text-destructive">*</span>
                    </label>
                    <div className="card-warm p-4">
                        {fetchingLocation && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm">Getting your location...</span>
                            </div>
                        )}
                        {locationError && (
                            <div className="flex items-start gap-2 text-destructive">
                                <AlertCircle className="w-4 h-4 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">{locationError}</p>
                                    <button
                                        type="button"
                                        onClick={getCurrentLocation}
                                        className="text-sm underline mt-1"
                                    >
                                        Try Again
                                    </button>
                                </div>
                            </div>
                        )}
                        {latitude && longitude && !fetchingLocation && (
                            <div className="flex items-start gap-2 text-secondary">
                                <CheckCircle2 className="w-4 h-4 mt-0.5" />
                                <div>
                                    <p className="text-sm font-medium">Location captured</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        {latitude.toFixed(6)}, {longitude.toFixed(6)}
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Temporary Name */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Temporary Name (Optional)
                    </label>
                    <input
                        type="text"
                        value={temporaryName}
                        onChange={(e) => setTemporaryName(e.target.value)}
                        placeholder="e.g., Spot, Fluffy, Brown Dog"
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                        maxLength={50}
                    />
                </div>

                {/* Condition */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Condition
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {['healthy', 'injured', 'needs_feeding'].map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => setCondition(c as any)}
                                className={`py-3 rounded-xl text-sm font-medium transition-all ${condition === c
                                        ? 'bg-primary text-primary-foreground'
                                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {c.replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Any additional details about the dog..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px]"
                        maxLength={500}
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={submitting || !photo || !latitude || !longitude}
                    className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground py-4 rounded-xl font-semibold hover:opacity-90 disabled:opacity-50 transition-all active:scale-[0.98]"
                >
                    {submitting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        <>
                            <MapPin className="w-5 h-5" />
                            Report Dog (+10 pts)
                        </>
                    )}
                </button>
            </form>

        </div>
    );
};

export default ReportDog;
