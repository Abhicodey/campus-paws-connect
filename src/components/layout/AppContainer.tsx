import React from "react";

export default function AppContainer({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="
      w-full
      min-h-dvh
      flex
      bg-background
      text-foreground
    "
        >
            {children}
        </div>
    );
}
