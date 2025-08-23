"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export function NotFoundModal({ isOpen, onClose, message }: NotFoundModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      setTimeout(() => setIsVisible(false), 200);
    }
  }, [isOpen]);

  if (!isVisible && !isOpen) return null;

  const handleGoHome = () => {
    onClose();
    // 使用 router.push 而不是 window.location.href 来避免页面刷新
    window.location.href = "/";
  };

  const handleGoBack = () => {
    onClose();
    // 使用 history.back() 返回上一页
    window.history.back();
  };

  return (
    <div className={`fixed inset-0 z-50 transition-opacity duration-200 ${
      isOpen ? "opacity-100" : "opacity-0"
    }`}>
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute top-4 right-4 max-w-md w-full mx-4">
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6 transform transition-transform duration-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-6 w-6 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">功能暂未开放</h2>
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
            {message || "抱歉，您访问的功能目前正在开发中，暂时无法使用。我们会尽快完善相关功能，敬请期待。"}
          </p>
          
          <div className="flex space-x-3">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回上页
            </Button>
            <Button
              onClick={handleGoHome}
              className="flex-1"
            >
              <Home className="h-4 w-4 mr-2" />
              返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 