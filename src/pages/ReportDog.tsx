import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, MapPin, Loader2, AlertCircle, CheckCircle2, Phone, Stethoscope, Heart, Info } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import BrandLogo from '@/components/BrandLogo';
import { motion } from 'framer-motion';
import Page from "@/components/layout/Page";
import ResponsiveCard from "@/components/ui/ResponsiveCard";

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
            // 1. Upload photo
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

            // 2. Create dog record
            const { error: dogError } = await supabase
                .from('dogs')
                // @ts-ignore
                .insert({
                    temporary_name: temporaryName.trim() || null,
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
                });

            if (dogError) throw dogError;

            // 3. Award points
            try {
                // @ts-ignore
                await supabase.rpc('add_points', { user_id: authUser.id, points_to_add: 10 });
            } catch (err) {
                console.error('Points failed:', err);
            }

            toast({ title: 'Dog Reported!', description: 'Thank you for helping!' });
            navigate('/');
        } catch (error: any) {
            console.error('Error:', error);
            toast({ title: 'Failed to Report', description: error.message, variant: 'destructive' });
        } finally {
            setSubmitting(false);
        }
    };

    const conditionOptions = [
        { id: 'healthy', label: 'Healthy', icon: Heart, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
        { id: 'injured', label: 'Injured', icon: Stethoscope, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
        { id: 'needs_feeding', label: 'Hungry', icon: Info, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
    ];

    return (
        <Page>
            {/* Header */}
            <div className="flex flex-col items-center text-center space-y-4 mb-8">
                <BrandLogo variant="hero" className="w-28 h-28" />
                <div>
                    <h1 className="text-2xl font-bold text-foreground">Report a Dog</h1>
                    <p className="text-muted-foreground text-sm">Help us track and care for stray dogs</p>
                </div>
                <a href="tel:+919876543210" className="flex items-center gap-2 bg-red-50 text-red-600 px-5 py-2.5 rounded-full font-medium text-sm border border-red-100 hover:bg-red-100 transition-all active:scale-95 shadow-sm">
                    <Phone className="w-4 h-4 fill-current" />
                    <span>Emergency: +91 98765 43210</span>
                </a>
            </div>

            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Left Column: Visuals & Location */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-6"
                    >
                        {/* Photo Upload */}
                        <ResponsiveCard className="space-y-3">
                            <label className="block text-sm font-semibold text-foreground">
                                Photo <span className="text-destructive">*</span>
                            </label>
                            {!photoPreview ? (
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-muted/50 transition-colors group">
                                    <div className="p-4 bg-muted rounded-full group-hover:scale-110 transition-transform mb-3">
                                        <Camera className="w-8 h-8 text-muted-foreground" />
                                    </div>
                                    <span className="text-sm font-medium text-foreground">Tap to take photo</span>
                                    <span className="text-xs text-muted-foreground mt-1">or select from gallery</span>
                                    <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                                </label>
                            ) : (
                                <div className="relative group">
                                    <img src={photoPreview} alt="Preview" className="w-full h-64 object-cover rounded-xl shadow-sm" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                        <button
                                            type="button"
                                            onClick={() => { setPhoto(null); setPhotoPreview(''); }}
                                            className="bg-destructive text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-destructive/90 transition-colors"
                                        >
                                            Change Photo
                                        </button>
                                    </div>
                                </div>
                            )}
                        </ResponsiveCard>

                        {/* Location */}
                        <ResponsiveCard className="space-y-3">
                            <label className="block text-sm font-semibold text-foreground">Location</label>
                            <div className={`p-4 rounded-xl border transition-colors ${locationError ? 'bg-red-50 border-red-100' :
                                (latitude ? 'bg-green-50 border-green-100' : 'bg-muted/30 border-border')
                                }`}>
                                {fetchingLocation && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="text-sm">Acquiring GPS...</span>
                                    </div>
                                )}
                                {locationError && (
                                    <div className="flex gap-2 text-destructive">
                                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-medium">{locationError}</p>
                                            <button type="button" onClick={getCurrentLocation} className="underline mt-1">Retry</button>
                                        </div>
                                    </div>
                                )}
                                {latitude && longitude && !fetchingLocation && (
                                    <div className="flex gap-3 text-green-700">
                                        <MapPin className="w-5 h-5 shrink-0 mt-0.5" />
                                        <div>
                                            <p className="font-medium text-sm">Location Pinned</p>
                                            <p className="text-xs opacity-80 mt-0.5">Coords: {latitude.toFixed(5)}, {longitude.toFixed(5)}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ResponsiveCard>
                    </motion.div>

                    {/* Right Column: Details */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="space-y-6"
                    >
                        {/* Condition Selector */}
                        <ResponsiveCard className="space-y-3">
                            <label className="block text-sm font-semibold text-foreground">Condition</label>
                            <div className="grid grid-cols-1 gap-2">
                                {conditionOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setCondition(opt.id as any)}
                                        className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${condition === opt.id
                                            ? `${opt.bg} ${opt.border} ring-1 ring-offset-0 ${opt.color.replace('text-', 'ring-')}`
                                            : 'bg-background hover:bg-muted/50 border-transparent'
                                            }`}
                                    >
                                        <div className={`p-2 rounded-full ${opt.bg} ${opt.color}`}>
                                            <opt.icon className="w-5 h-5" />
                                        </div>
                                        <span className={`font-medium text-sm ${condition === opt.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                                            {opt.label}
                                        </span>
                                        {condition === opt.id && <CheckCircle2 className={`w-5 h-5 ml-auto ${opt.color}`} />}
                                    </button>
                                ))}
                            </div>
                        </ResponsiveCard>

                        {/* Text Details */}
                        <ResponsiveCard className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Temporary Name</label>
                                <input
                                    type="text"
                                    value={temporaryName}
                                    onChange={(e) => setTemporaryName(e.target.value)}
                                    placeholder="Eg. Spot, Brownie..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-foreground mb-1.5">Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Notable markings, injuries, or behavior..."
                                    className="w-full px-4 py-2.5 rounded-lg border border-border bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm min-h-[100px] resize-none"
                                />
                            </div>
                        </ResponsiveCard>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={submitting || !photo || !latitude}
                            className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MapPin className="w-5 h-5" />}
                            {submitting ? 'Reporting...' : 'Submit Report'}
                        </button>
                    </motion.div>
                </div>
            </form>
        </Page>
    );
};

export default ReportDog;
