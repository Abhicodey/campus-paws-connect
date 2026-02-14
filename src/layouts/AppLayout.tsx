import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background text-foreground flex">

            {/* Desktop sidebar - Fixed width, fixed position */}
            <aside className="hidden md:flex w-64 flex-col border-r border-border fixed inset-y-0 left-0 bg-surface z-50">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-h-screen w-full md:pl-64">
                {/* Content wrapper to ensure footer pushes down if we add one, or just general padding */}
                <div className="flex-1 pb-20 md:pb-0">
                    <Outlet />
                </div>
            </main>

            {/* Mobile nav - Fixed bottom */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
                <MobileNav />
            </div>

        </div>
    );
}
