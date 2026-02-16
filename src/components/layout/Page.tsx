import React from "react";
import { cn } from "@/lib/utils";

interface PageProps {
    children: React.ReactNode;
    className?: string;
}

export default function Page({ children, className }: PageProps) {
    return (
        <main
            className={cn(
                "flex-1 w-full px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 py-4 md:py-6 max-w-none",
                "flex flex-col gap-[var(--section-gap-mobile)] md:gap-[var(--section-gap)]",
                "page-safe-bottom",
                className
            )}
        >
            {children}
        </main>
    );
}
