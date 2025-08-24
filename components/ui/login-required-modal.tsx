"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { AlertCircle, X, LogIn, Eye } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginRequiredModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
  featureName?: string;
}

export function LoginRequiredModal({ isOpen, onClose, message, featureName }: LoginRequiredModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleGoLogin = () => {
    onClose();
    router.push('/login');
  };

  const handleGuestBrowse = () => {
    onClose();
  };

  const defaultMessage = message || `请先登录后再${featureName ? `开始${featureName}` : '访问此功能'}`;

  if (!mounted || !isVisible) return null;

  const modalContent = (
    <div className={`fixed inset-0 z-[9999] transition-opacity duration-200 ${
      isOpen ? 'opacity-100' : 'opacity-0'
    }`}>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed top-4 right-4 max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 transform transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <LogIn className="h-6 w-6 text-blue-500" />
              <h2 className="text-lg font-semibold text-gray-900">需要登录</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-gray-600 mb-6 leading-relaxed">
            {defaultMessage}。请先登录您的账户以继续使用该功能。
          </p>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleGuestBrowse}
              variant="outline"
              className="flex-1"
            >
              <Eye className="h-4 w-4 mr-2" />
              我是游客，仅浏览
            </Button>
            <Button
              onClick={handleGoLogin}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              立即登录
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
