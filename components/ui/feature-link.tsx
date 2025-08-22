"use client";

import React from "react";
import Link from "next/link";
import { useError } from "@/contexts/error-context";

interface FeatureLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  featureName?: string;
  isAvailable?: boolean;
  onClick?: () => void;
}

export function FeatureLink({ 
  href, 
  children, 
  className = "", 
  featureName,
  isAvailable = true,
  onClick 
}: FeatureLinkProps) {
  const { handleFeatureNotAvailable } = useError();

  const handleClick = (e: React.MouseEvent) => {
    if (!isAvailable) {
      e.preventDefault();
      e.stopPropagation();
      handleFeatureNotAvailable(featureName);
      return;
    }

    if (onClick) {
      onClick();
    }
  };

  if (isAvailable) {
    return (
      <Link href={href} className={className} onClick={handleClick}>
        {children}
      </Link>
    );
  }

  return (
    <button 
      className={className} 
      onClick={handleClick}
      type="button"
    >
      {children}
    </button>
  );
}

// 用于实验链接的专用组件
export function ExperimentLink({ 
  href, 
  children, 
  className = "", 
  experimentName 
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  experimentName: string;
}) {
  return (
    <FeatureLink 
      href={href} 
      className={className} 
      featureName={experimentName}
      isAvailable={false}
    >
      {children}
    </FeatureLink>
  );
}

// 用于课程链接的专用组件
export function CourseLink({ 
  href, 
  children, 
  className = "", 
  courseName 
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  courseName: string;
}) {
  return (
    <FeatureLink 
      href={href} 
      className={className} 
      featureName={courseName}
      isAvailable={false}
    >
      {children}
    </FeatureLink>
  );
} 