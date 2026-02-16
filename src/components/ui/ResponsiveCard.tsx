import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export default function ResponsiveCard({ children, className, ...props }: ResponsiveCardProps) {
    return (
        <div
            className={cn(
                "card p-4 sm:p-5 md:p-6 lg:p-7",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}
