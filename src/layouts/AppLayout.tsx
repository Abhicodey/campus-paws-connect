import { Outlet } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import AppFooter from "@/components/layout/AppFooter";

export default function AppLayout() {
    return (
        <div className="min-h-screen bg-background flex">

            {/* Sidebar: Visible on Landscape Mobile & Desktop */}
            <aside className="
        hidden
        landscape:flex
        md:flex
        w-64
        border-r
        border-border
        flex-col
        fixed
        inset-y-0
        left-0
        bg-surface
        z-50
      ">
                <Sidebar />
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-col flex-1 min-w-0 transition-all duration-300 md:pl-64 landscape:pl-64">

                {/* Page Content */}
                <main className="
          flex-1
          px-3 sm:px-6 lg:px-8
          py-6
          flex flex-col
        ">
                    <Outlet />
                </main>

                {/* Global Footer */}
                <AppFooter />

                {/* Mobile Nav: Visible on Portrait Mobile only */}
                {/* Added padding-bottom to main/footer to account for this fixed nav if needed, 
            but usually mobile nav sits on top of content z-index or we pad the bottom of the body.
            MobileNav component itself doesn't have height, it's fixed bottom. 
            We need to ensure content doesn't get hidden behind it on portrait.
            The 'pb-safe' in MobileNav might handle safe area, but we need bottom padding on the container 
            ONLY when MobileNav is visible.
        */}
                <div className="portrait:block landscape:hidden md:hidden h-20" /> {/* Spacer for MobileNav */}

                <div className="portrait:block landscape:hidden md:hidden fixed bottom-0 left-0 right-0 z-50">
                    <MobileNav />
                </div>

            </div>
        </div>
    );
}
