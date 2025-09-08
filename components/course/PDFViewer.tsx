"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Download,
  ExternalLink,
} from "lucide-react";

interface PDFViewerProps {
  pdfUri: string;
  title: string;
}

export default function PDFViewer({ pdfUri, title }: PDFViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);
  const [isClient, setIsClient] = useState(false);

  // 确保组件只在客户端渲染
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 缩放控制
  const zoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(0.5, Math.min(2.5, newScale));
    });
  };

  // 下载PDF
  const downloadPDF = () => {
    const link = document.createElement('a');
    link.href = pdfUri;
    link.download = title || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 在新窗口中打开PDF
  const openInNewWindow = () => {
    window.open(pdfUri, '_blank');
  };

  // 处理iframe加载
  const handleIframeLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleIframeError = () => {
    setError("PDF加载失败，请稍后重试");
    setLoading(false);
  };

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
            onClick={downloadPDF}
            title="下载PDF"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={openInNewWindow}
            title="在新窗口中打开"
          >
            <ExternalLink className="h-4 w-4" />
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
            <div className="text-center">
              <div className="text-destructive text-lg mb-2">{error}</div>
              <Button onClick={() => window.location.reload()}>
                重新加载
              </Button>
            </div>
          </div>
        ) : (
          <iframe
            src={`${pdfUri}#toolbar=1&navpanes=1&scrollbar=1&zoom=${Math.round(scale * 100)}`}
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title={title}
            style={{ transform: `scale(${scale})`, transformOrigin: 'top left' }}
          />
        )}
      </div>
    </div>
  );
} 