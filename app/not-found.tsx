"use client";

import { useEffect, useState } from "react";
import { useError } from "@/contexts/error-context";
import Link from "next/link";

export default function NotFound() {
  const [showModal, setShowModal] = useState(false);
  const { handleNotFound } = useError();

  useEffect(() => {
    // 检查当前URL，判断是否应该显示弹框
    const currentPath = window.location.pathname;
    
    // 只对特定的未开放功能显示弹框
    const shouldShowModal = 
      currentPath.includes('/experiments/') ||
      currentPath.includes('/lessons/') ||
      currentPath.includes('/news') ||
      currentPath.includes('/reports') ||
      currentPath.includes('/datasets') ||
      currentPath.includes('/admin');
    
    if (shouldShowModal) {
      // 延迟显示弹框
      const timer = setTimeout(() => {
        handleNotFound();
        setShowModal(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [handleNotFound]);

  // 如果不是需要显示弹框的页面，显示标准的404页面
  if (!showModal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">页面未找到</h1>
          <p className="text-gray-600 mb-8">
            抱歉，您访问的页面不存在。请检查URL是否正确，或返回首页继续浏览。
          </p>
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              返回首页
            </Link>
            <button
              onClick={() => window.history.back()}
              className="block w-full bg-gray-200 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              返回上页
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 如果需要显示弹框，返回加载页面
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">页面加载中...</h1>
        <p className="text-gray-600">正在检查页面状态...</p>
      </div>
    </div>
  );
} 