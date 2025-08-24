"use client";

import React, { Suspense, use, useEffect, useRef } from "react";
import { ArrowLeft, BookOpen, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import dynamic from "next/dynamic";

// 动态导入PDFViewer组件，禁用服务器端渲染
const PDFViewer = dynamic(() => import("@/components/course/PDFViewer"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">PDF查看器加载中...</p>
      </div>
    </div>
  ),
});

export default function Chapter5Page({ params }: { params: Promise<{ "course-id": string }> }) {
  const { "course-id": courseId } = use(params);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // 隐藏PDF查看器的下载和打印按钮
  useEffect(() => {
    const hidePDFButtons = () => {
      if (iframeRef.current) {
        try {
          const iframe = iframeRef.current;
          const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
          
          if (iframeDoc) {
            // 隐藏下载按钮
            const downloadButtons = iframeDoc.querySelectorAll('button[title*="下载"], button[title*="Download"], button[aria-label*="下载"], button[aria-label*="Download"]');
            downloadButtons.forEach(btn => {
              (btn as HTMLElement).style.display = 'none';
            });
            
            // 隐藏打印按钮
            const printButtons = iframeDoc.querySelectorAll('button[title*="打印"], button[title*="Print"], button[aria-label*="打印"], button[aria-label*="Print"]');
            printButtons.forEach(btn => {
              (btn as HTMLElement).style.display = 'none';
            });
            
            // 隐藏工具栏中的下载和打印按钮
            const toolbarButtons = iframeDoc.querySelectorAll('button, a[download], a[href*="print"]');
            toolbarButtons.forEach(btn => {
              const btnElement = btn as HTMLElement;
              const title = btnElement.title?.toLowerCase() || '';
              const ariaLabel = btnElement.getAttribute('aria-label')?.toLowerCase() || '';
              const text = btnElement.textContent?.toLowerCase() || '';
              
              if (title.includes('下载') || title.includes('download') || 
                  ariaLabel.includes('下载') || ariaLabel.includes('download') ||
                  text.includes('下载') || text.includes('download') ||
                  title.includes('打印') || title.includes('print') ||
                  ariaLabel.includes('打印') || ariaLabel.includes('print') ||
                  text.includes('打印') || text.includes('print')) {
                btnElement.style.display = 'none';
              }
            });
          }
        } catch (error) {
          // 跨域限制或其他错误，忽略
          console.log('无法访问iframe内容，这是正常的跨域限制');
        }
      }
    };

    // 延迟执行，等待iframe加载完成
    const timer = setTimeout(hidePDFButtons, 2000);
    
    // 监听iframe加载完成事件
    if (iframeRef.current) {
      iframeRef.current.onload = hidePDFButtons;
    }
    
    // 定期检查并隐藏按钮（每3秒检查一次）
    const intervalId = setInterval(hidePDFButtons, 3000);
    
    return () => {
      clearTimeout(timer);
      clearInterval(intervalId);
    };
  }, []);
  
  return (
    <div className="min-h-screen bg-background">
      {/* 页面头部 */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/courses/${courseId}`}>
                <Button variant="ghost" size="sm" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  返回课程
                </Button>
              </Link>
              <div className="flex flex-col space-y-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-green-600" />
                  <h1 className="text-xl font-semibold">第5章 碳足迹计量</h1>
                </div>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium self-start">
                  样章内容
                </span>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4" />
                <span>PDF 文档阅读器</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PDF 内容区域 */}
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200 p-6">
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-green-800 mb-2">
                  第5章 碳足迹计量 - 样章预览
                </h2>
                <p className="text-green-700 mb-4">
                  本章是教材的样章内容，完整展示了碳足迹计量的标准、方法和实践应用。
                  包含碳足迹计量标准体系、生命周期评价方法、碳足迹计算与数据质量等核心内容。
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-green-600">
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    碳足迹计量标准体系
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    生命周期评价方法
                  </div>
                  <div className="flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    实践案例与工具应用
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PDF 查看器 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="h-[calc(100vh-400px)] min-h-[600px]">
            {/* 方案1：使用浏览器内置PDF查看器（已隐藏下载和打印按钮） */}
            <div className="w-full h-full">
              <iframe
                ref={iframeRef}
                src="/第5章碳足迹计量.pdf#toolbar=0&navpanes=0&scrollbar=0&download=0&print=0"
                className="w-full h-full border-0"
                title="第5章 碳足迹计量"
                style={{
                  // 隐藏PDF查看器的下载和打印按钮
                  filter: 'grayscale(0%)',
                }}
              >
                <p>您的浏览器不支持PDF查看，请升级浏览器或使用支持PDF的现代浏览器。</p>
              </iframe>
            </div>
            
            {/* 方案2：使用object标签（备用方案） */}
            {/* 
            <object
              data="/第5章碳足迹计量.pdf"
              type="application/pdf"
              className="w-full h-full"
            >
              <p>您的浏览器不支持PDF查看，请升级浏览器或使用支持PDF的现代浏览器。</p>
            </object>
            */}
            
            {/* 方案3：使用自定义PDF查看器（完全控制界面，无下载打印按钮） */}
            {/* 
            <div className="w-full h-full">
              <PDFViewer 
                pdfUri="/第5章碳足迹计量.pdf"
                title="第5章 碳足迹计量"
              />
            </div>
            */}
          </div>
        </div>

        {/* 添加CSS样式来隐藏PDF查看器的下载和打印按钮 */}
        <style jsx global>{`
          /* 隐藏PDF查看器的下载和打印按钮 */
          iframe[src*=".pdf"] {
            /* 尝试隐藏PDF查看器内部的按钮 */
          }
          
          /* 全局样式：隐藏所有可能的下载和打印按钮 */
          button[title*="下载"],
          button[title*="Download"],
          button[aria-label*="下载"],
          button[aria-label*="Download"],
          button[title*="打印"],
          button[title*="Print"],
          button[aria-label*="打印"],
          button[aria-label*="Print"],
          a[download],
          a[href*="print"],
          a[href*="download"] {
            display: none !important;
          }
          
          /* 隐藏PDF查看器工具栏中的特定按钮 */
          .pdfViewer button[title*="下载"],
          .pdfViewer button[title*="Download"],
          .pdfViewer button[title*="打印"],
          .pdfViewer button[title*="Print"] {
            display: none !important;
          }
          
          /* 隐藏PDF查看器的工具栏 */
          iframe[src*=".pdf"] {
            /* 尝试隐藏工具栏 */
          }
          
          /* 隐藏所有可能的下载和打印相关元素 */
          [data-l10n-id*="download"],
          [data-l10n-id*="print"],
          [title*="下载"],
          [title*="Download"],
          [title*="打印"],
          [title*="Print"],
          [aria-label*="下载"],
          [aria-label*="Download"],
          [aria-label*="打印"],
          [aria-label*="Print"] {
            display: none !important;
          }
          
          /* 隐藏PDF.js相关的下载和打印按钮 */
          .pdfViewer .toolbarViewer .toolbarViewerLeft button[title*="下载"],
          .pdfViewer .toolbarViewer .toolbarViewerLeft button[title*="Download"],
          .pdfViewer .toolbarViewer .toolbarViewerLeft button[title*="打印"],
          .pdfViewer .toolbarViewer .toolbarViewerLeft button[title*="Print"],
          .pdfViewer .toolbarViewer .toolbarViewerRight button[title*="下载"],
          .pdfViewer .toolbarViewer .toolbarViewerRight button[title*="Download"],
          .pdfViewer .toolbarViewer .toolbarViewerRight button[title*="打印"],
          .pdfViewer .toolbarViewer .toolbarViewerRight button[title*="Print"] {
            display: none !important;
          }
        `}</style>

        {/* 底部说明 */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <p>
            本样章仅供学习参考，完整版教材正在编写中，敬请期待。
          </p>
        </div>
      </div>
    </div>
  );
} 