import { Mail, Instagram, FileText } from "lucide-react";

export default function AppFooter() {
    return (
        <footer className="mt-auto border-t border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="mx-auto max-w-7xl px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">

                {/* Branding */}
                <p className="text-center sm:text-left">
                    © {new Date().getFullYear()} CampusPaws • Sharing Care & Comfort 🐾
                </p>

                {/* Links */}
                <div className="flex items-center gap-6">

                    <a
                        href="mailto:campuspaws7@gmail.com"
                        className="flex items-center gap-2 hover:text-foreground transition-colors"
                    >
                        <Mail size={16} />
                        Email
                    </a>

                    <a
                        href="https://www.instagram.com/campus.paws/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-pink-400 transition-colors"
                    >
                        <Instagram size={16} />
                        Instagram
                    </a>

                    <a
                        href="https://forms.gle/bhVX5vqqMyX7FHFY6"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-orange-400 transition-colors"
                    >
                        <FileText size={16} />
                        Join Team
                    </a>

                </div>
            </div>
        </footer>
    );
}
