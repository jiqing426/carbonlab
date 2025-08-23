"use client";

import React, { useState } from "react";
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
  AlertCircle,
} from "lucide-react";

// 设置 PDF.js worker
if (typeof window !== "undefined") {
  pdfjs.GlobalWorkerOptions.workerSrc = `/pdf.worker.min.js`;
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
    console.log("PDF加载成功，页数:", pdf.numPages);
    setNumPages(pdf.numPages);
    setLoading(false);
    setError(null);
  };

  // 处理加载错误
  const onDocumentLoadError = (error: Error) => {
    console.error("PDF加载失败:", error);
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
          {loading && (
            <div className="w-full max-w-4xl flex flex-col items-center gap-4">
              <Skeleton className="w-full h-[450px]" />
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  正在加载PDF文档...
                </span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="w-full max-w-4xl flex flex-col items-center gap-4 p-8">
              <AlertCircle className="h-16 w-16 text-red-500" />
              <div className="text-center">
                <h3 className="text-lg font-semibold text-red-800 mb-2">PDF加载失败</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <div className="text-sm text-gray-600">
                  <p>可能的原因：</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>PDF文件不存在或路径错误</li>
                    <li>PDF.js worker文件未正确加载</li>
                    <li>网络连接问题</li>
                    <li>PDF文件损坏</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={pdfUri}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm text-muted-foreground">
                    初始化PDF文档...
                  </span>
                </div>
              }
              error={
                <div className="text-center py-8">
                  <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-800 mb-2">PDF文档加载失败</h3>
                  <p className="text-red-600">请检查PDF文件格式是否正确</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                renderTextLayer={false}
                renderAnnotationLayer={false}
                scale={scale}
                loading={
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      正在渲染第 {pageNumber} 页...
                    </span>
                  </div>
                }
                error={
                  <div className="text-center py-4">
                    <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-red-600 text-sm">页面渲染失败</p>
                  </div>
                }
              />
            </Document>
          )}
        </div>
      </div>
    </div>
  );
} 