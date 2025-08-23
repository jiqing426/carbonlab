"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useError } from "@/contexts/error-context";
import { useUserStore } from "@/lib/stores/user-store";
import { useRouter } from "next/navigation";
import { LoginRequiredModal } from "@/components/ui/login-required-modal";

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
  const { isLoggedIn } = useUserStore();
  const router = useRouter();
  const [showLoginModal, setShowLoginModal] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // 已登录，跳转到实验页面
    router.push(href);
  };

  return (
    <>
      <a
        href={href}
        className={className}
        onClick={handleClick}
      >
        {children}
      </a>
      
      <LoginRequiredModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        featureName={experimentName}
      />
    </>
  );
}

// 课程链接现在不需要登录拦截，使用普通的Link组件即可
// 如果需要添加登录拦截，可以重新实现这个组件 