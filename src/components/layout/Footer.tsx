import { Mail, Instagram, FileText } from "lucide-react";
import { OFFICIAL } from "@/constants/official";

export default function Footer() {
    return (
        <footer className="mt-16 border-t bg-muted/40 pb-8">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* Socials */}
                <div className="flex flex-wrap gap-6 justify-center text-sm">
                    <a href={OFFICIAL.instagram} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Instagram size={16} /> Instagram
                    </a>



                    <a href={`mailto:${OFFICIAL.email}`}
                        className="flex items-center gap-2 hover:text-primary transition-colors">
                        <Mail size={16} /> {OFFICIAL.email}
                    </a>
                </div>

                {/* Copyright */}
                <div className="text-center text-xs text-muted-foreground">
                    © {new Date().getFullYear()} Campus Paws • Made with ❤️ for campus dogs
                </div>
            </div>
        </footer>
    );
}
