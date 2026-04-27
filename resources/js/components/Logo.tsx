import React from "react";
import svgPaths from "@/imports/svg-82y8n8ykiy";

interface LogoProps {
  className?: string;
  variant?: "full" | "icon";
}

export function Logo({ className = "h-12", variant = "full" }: LogoProps) {
  // Brand colors
  const colorBlue = "#50CAE6";
  
  if (variant === "icon") {
    return (
      <svg className={className} viewBox="0 0 938.7 804.9" fill="none" preserveAspectRatio="xMidYMid meet">
        <path d={svgPaths.p30ca2ef0} fill={colorBlue} />
        <path d={svgPaths.pa3e9a00} fill={colorBlue} />
      </svg>
    );
  }

  return (
    <div className={`flex flex-col items-center ${className}`}>
        <svg className="h-[70%] w-auto" viewBox="0 0 938.7 804.9" fill="none" preserveAspectRatio="xMidYMid meet">
            <path d={svgPaths.p30ca2ef0} fill={colorBlue} />
            <path d={svgPaths.pa3e9a00} fill={colorBlue} />
        </svg>
        <svg className="h-[25%] w-auto mt-1" viewBox="0 0 938.8 221.8" fill="none" preserveAspectRatio="xMidYMid meet">
            <path d={svgPaths.p2f1bae80} fill={colorBlue} />
            <path d={svgPaths.p31136c80} fill={colorBlue} />
            <path d={svgPaths.p1f814a00} fill={colorBlue} />
            <path d={svgPaths.p1b8d6280} fill={colorBlue} />
            <path d={svgPaths.p17b40300} fill={colorBlue} />
            <path d={svgPaths.p29c63400} fill={colorBlue} />
            <path d={svgPaths.p3fede300} fill={colorBlue} />
            <path d={svgPaths.p344e9e80} fill={colorBlue} />
            <path d={svgPaths.pa7f0200} fill={colorBlue} />
        </svg>
    </div>
  );
}
