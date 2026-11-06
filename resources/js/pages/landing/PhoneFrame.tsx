import React from "react";
import { NAVY } from "./tokens";

interface PhoneFrameProps {
  children: React.ReactNode;
  className?: string;
}

// Moldura de celular em DOM/CSS, chapada. A largura vem do className (altura segue a proporcao).
export function PhoneFrame({ children, className = "w-[260px]" }: PhoneFrameProps) {
  return (
    <div
      className={`relative aspect-[9/18.5] rounded-[2.6rem] p-[7px] ${className}`}
      style={{ background: NAVY }}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[2.1rem] bg-white">
        <div
          className="absolute left-1/2 top-2 z-10 h-4 w-16 -translate-x-1/2 rounded-full"
          style={{ background: NAVY }}
        />
        {children}
      </div>
    </div>
  );
}
