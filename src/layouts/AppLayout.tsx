import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AppFooter from "@/components/layout/AppFooter";

export default function AppLayout() {
    return (
        <div className="flex w-full min-h-dvh bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden lg:block w-64 shrink-0 border-r border-border">
                <Sidebar />
            </div>

            {/* Page Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <main className="flex-1 pb-20 lg:pb-0">
                    <Outlet />
                    <AppFooter />
                </main>

                {/* Mobile Navigation */}
                <div className="lg:hidden fixed bottom-1 left-0 right-0 z-50">
                    <MobileNav />
                </div>
            </div>
        </div>
    );
}
