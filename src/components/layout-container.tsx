import React from "react";

export function LayoutContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full flex justify-center">
      <div className="
        w-full
        max-w-[1100px]
        px-4
        sm:px-6
        lg:px-8
      ">
        {children}
      </div>
    </div>
  );
}
