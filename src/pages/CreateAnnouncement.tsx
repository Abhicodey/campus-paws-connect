import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Send, Loader2, Mail } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateAnnouncement } from '@/hooks/useAnnouncements';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const CreateAnnouncement = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const createAnnouncement = useCreateAnnouncement();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [sendEmail, setSendEmail] = useState(false);

    // Only presidents and superadmins can access this page
    useEffect(() => {
        if (!profile?.is_super_admin && profile?.role !== 'president') {
            navigate('/');
        }
    }, [profile, navigate]);

    if (!profile?.is_super_admin && profile?.role !== 'president') {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim() || !content.trim()) {
            toast({
                title: 'Missing information',
                description: 'Please fill in both title and content',
                variant: 'destructive',
            });
            return;
        }

        try {
            await createAnnouncement.mutateAsync({
                title: title.trim(),
                content: content.trim(),
                sendEmail,
            });

            toast({
                title: 'Announcement posted! 📢',
                description: sendEmail
                    ? 'Notification sent to all users and emails delivered'
                    : 'Notification sent to all users',
            });



            navigate('/admin');
        } catch (error: any) {
            toast({
                title: 'Failed to post announcement',
                description: error.message,
                variant: 'destructive',
            });
        }
    };

    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header */}
            <header className="bg-gradient-to-br from-primary to-primary/80 pt-6 pb-4 px-6">
                <div className="flex items-center gap-4">
                    <Link
                        to="/admin"
                        className="p-2 rounded-full bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-xl font-bold text-primary-foreground">
                            Create Announcement
                        </h1>
                        <p className="text-primary-foreground/80 text-sm">
                            Notify all community members
                        </p>
                    </div>
                </div>
            </header>

            {/* Form */}
            <div className="px-6 mt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="card-warm p-5">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g., Free Vaccination Camp Tomorrow"
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background 
                                text-foreground placeholder:text-muted-foreground
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                            maxLength={100}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {title.length}/100 characters
                        </p>
                    </div>

                    {/* Content */}
                    <div className="card-warm p-5">
                        <label className="block text-sm font-medium text-foreground mb-2">
                            Content
                        </label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Write your announcement details here..."
                            rows={8}
                            className="w-full px-4 py-3 rounded-xl border border-border bg-background 
                                text-foreground placeholder:text-muted-foreground
                                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary
                                resize-none"
                            maxLength={1000}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            {content.length}/1000 characters
                        </p>
                    </div>

                    {/* Email Toggle */}
                    <div className="card-warm p-5">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={sendEmail}
                                onChange={(e) => setSendEmail(e.target.checked)}
                                className="w-5 h-5 rounded border-border text-primary 
                                    focus:ring-2 focus:ring-primary/20"
                            />
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <Mail className="w-4 h-4 text-primary" />
                                    <span className="font-medium text-foreground">
                                        Send as email
                                    </span>
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Also send this announcement via email to all active users
                                </p>
                            </div>
                        </label>
                    </div>

                    {/* Preview */}
                    {(title || content) && (
                        <div className="card-warm p-5">
                            <h3 className="text-sm font-medium text-foreground mb-3">
                                Preview
                            </h3>
                            <div className="bg-background rounded-xl p-4 border border-border">
                                <div className="flex items-start gap-3">
                                    <span className="text-2xl">📢</span>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground">
                                            {title || 'Announcement Title'}
                                        </h4>
                                        <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">
                                            {content || 'Announcement content will appear here...'}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-3">
                                            Just now
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={createAnnouncement.isPending || !title.trim() || !content.trim()}
                        className="w-full flex items-center justify-center gap-2 bg-primary text-primary-foreground 
                            py-4 rounded-xl font-semibold transition-all hover:opacity-90 active:scale-[0.98]
                            disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {createAnnouncement.isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Posting...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Post Announcement
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAnnouncement;
