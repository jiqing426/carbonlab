import React from "react";
import { Loader2 } from "lucide-react";

interface CommonLoadingProps {
  text?: string;
  size?: "sm" | "md" | "lg";
}

export default function CommonLoading({ 
  text = "加载中...", 
  size = "md" 
}: CommonLoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6", 
    lg: "h-8 w-8"
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div className="flex items-center gap-2">
        <Loader2 className={`${sizeClasses[size]} animate-spin`} />
        <span className="text-sm text-muted-foreground">{text}</span>
      </div>
    </div>
  );
}
