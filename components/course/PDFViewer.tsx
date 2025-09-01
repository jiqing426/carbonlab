"use client";

import React, { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ZoomIn,
  ZoomOut,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

// 设置 PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
}

interface PDFViewerProps {
  pdfUri: string;
  title: string;
}

export default function PDFViewer({ pdfUri, title }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(1.0);

  // 处理文档加载成功
  const onDocumentLoadSuccess = (pdf: any) => {
    setNumPages(pdf.numPages);
    setLoading(false);
    setError(null);
  };

  // 处理加载错误
  const onDocumentLoadError = (error: Error) => {
    setError("PDF加载失败，请稍后重试");
    setLoading(false);
  };

  // 页面导航
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, numPages));
    setPageNumber(newPage);
  };

  // 缩放控制
  const zoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(0.5, Math.min(2.5, newScale));
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center gap-2 p-2 bg-muted border-b">
        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={e => goToPage(parseInt(e.target.value) || 1)}
            className="w-16 text-center"
          />
          <span className="text-sm text-muted-foreground">/ {numPages}</span>
        </div>

        <Button
          variant="outline"
          size="icon"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => zoom(-0.1)}
            disabled={scale <= 0.5}
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
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF 显示区域 */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex justify-center">
          <Document
            file={pdfUri}
            onLoadSuccess={onDocumentLoadSuccess}
            onLoadError={onDocumentLoadError}
            loading={
              <div className="w-full max-w-4xl flex flex-col items-center gap-4">
                <Skeleton className="w-full h-[450px]" />
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    加载中...
                  </span>
                </div>
              </div>
            }
          >
            {error ? (
              <div className="text-destructive text-center py-8">{error}</div>
            ) : (
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                scale={scale}
              />
            )}
          </Document>
        </div>
      </div>

      {/* 移动端页面导航 */}
      <div className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一页
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
} 