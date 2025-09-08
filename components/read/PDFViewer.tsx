"use client";

import React, { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Maximize2,
  Minimize2,
  SidebarClose,
  SidebarOpen,
  ScrollText,
  FileText,
  ExternalLink,
} from "lucide-react";
import debounce from "lodash/debounce";
import { useHotkeys } from "react-hotkeys-hook";

interface PDFViewerProps {
  pdfUri: string;
  title: string;
}

export default function PDFViewer({ pdfUri, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const [iframeBlocked, setIframeBlocked] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 移除下载功能 - 样章内容不允许下载

  // 在新窗口中打开PDF
  const openInNewWindow = () => {
    window.open(pdfUri, '_blank');
  };

  // 处理iframe加载
  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
    setIframeBlocked(false);
  };

  const handleIframeError = () => {
    setError("PDF加载失败，请稍后重试");
    setLoading(false);
  };

  // 检测iframe是否被屏蔽
  useEffect(() => {
    const timer = setTimeout(() => {
      if (loading) {
        setIframeBlocked(true);
        setLoading(false);
        setError("PDF查看器被浏览器屏蔽，请使用新窗口打开");
      }
    }, 5000); // 5秒后如果还在加载，认为被屏蔽

    return () => clearTimeout(timer);
  }, [loading]);

  // 缩放控制
  const zoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(0.5, Math.min(2.5, newScale));
    });
  };

  // 添加全屏切换函数
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error("Error attempting to enable fullscreen:", error);
      }
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  // 监听全屏状态变化
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  // 添加键盘保护 - 禁用常见的保存快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 禁用 Ctrl+S (保存)
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        return false;
      }
      // 禁用 Ctrl+A (全选)
      if (e.ctrlKey && e.key === 'a') {
        e.preventDefault();
        return false;
      }
      // 禁用 F12 (开发者工具)
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      // 禁用 Ctrl+Shift+I (开发者工具)
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // 如果不在客户端环境，显示加载状态
  if (!isClient) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">PDF查看器初始化中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 bg-muted border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(-0.1)}
            disabled={scale <= 0.5}
            title="缩小"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm min-w-[3rem] text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(0.1)}
            disabled={scale >= 2.5}
            title="放大"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          
          <div className="w-px h-6 bg-border mx-2" />
          
          <Button
            variant="outline"
            size="icon"
            onClick={openInNewWindow}
            title="在新窗口中打开"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* PDF 显示区域 */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="w-full h-full flex flex-col items-center justify-center gap-4">
            <Skeleton className="w-full h-full" />
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">
                加载中...
              </span>
            </div>
          </div>
        )}
        
        {error ? (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="text-destructive text-lg mb-4">{error}</div>
              {iframeBlocked ? (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground mb-4">
                    由于浏览器安全策略，PDF无法在页面内直接显示。请点击下方按钮在新窗口中查看。
                  </p>
                  <div className="flex gap-2 justify-center">
                    <Button onClick={openInNewWindow} className="gap-2">
                      <ExternalLink className="h-4 w-4" />
                      在新窗口中打开
                    </Button>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      重新加载
                    </Button>
                  </div>
                </div>
              ) : (
                <Button onClick={() => window.location.reload()}>
                  重新加载
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div 
            className="w-full h-full relative"
            onContextMenu={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
          >
            <iframe
              src={`${pdfUri}#toolbar=0&navpanes=0&scrollbar=1&zoom=${Math.round(scale * 100)}`}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              title={title}
              style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
              allow="fullscreen"
            />
            {/* 添加水印提示 */}
            <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-xs pointer-events-none z-10">
              样章内容，仅供预览
            </div>
            {/* 添加保护层 */}
            <div 
              className="absolute inset-0 pointer-events-none z-20"
              style={{ 
                background: 'transparent',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
