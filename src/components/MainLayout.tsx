import { ReactNode } from "react";
import Footer from "./layout/Footer";
import { useLocation } from "react-router-dom";

interface MainLayoutProps {
    children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const location = useLocation();

    // Optional: Hide footer on specific pages if needed here
    // For now, showing on all pages as requested

    return (
        <div className="min-h-screen w-full flex justify-center bg-background text-foreground md:pl-64">
            <div className="w-full flex flex-col min-h-screen relative pb-20 md:pb-0">
                <main className="flex-1 w-full flex flex-col">
                    {children}
                </main>
                <Footer />
            </div>
        </div>
    );
}
