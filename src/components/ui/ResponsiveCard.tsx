import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export default function ResponsiveCard({ children, className, ...props }: ResponsiveCardProps) {
    return (
        <div
            className={cn(
                "bg-card border border-border rounded-2xl p-4 sm:p-5 md:p-6 lg:p-7 shadow-sm",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
