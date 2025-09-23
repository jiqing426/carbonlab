'use client';

import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  ScrollText,
  FileText,
  PanelLeft,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { useHotkeys } from 'react-hotkeys-hook';
import { PDFSidebar } from './PDFSidebar';

// 设置 PDF.js worker - 使用 CDN 避免模块问题
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
}

interface PDFViewerProps {
  pdfUrl: string;
}

export default function PDFViewer({ pdfUrl }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [scale, setScale] = useState(0.7);
  const [rotation, setRotation] = useState(0);
  const [pageWidth, setPageWidth] = useState<number | undefined>(undefined);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showAllPages, setShowAllPages] = useState(true);
  const [showSidebar, setShowSidebar] = useState(true);
  const [pdfDocument, setPdfDocument] = useState<pdfjs.PDFDocumentProxy | null>(
    null
  );

  // 使用原始 URL
  const proxyPdfUrl = pdfUrl;

  // 优化 PDF 选项，避免不必要的重新渲染
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjs.version}/standard_fonts/`,
      withCredentials: false, // 禁用 credentials 以避免 CORS 问题
    }),
    []
  );

  // 处理文档加载成功
  const onDocumentLoadSuccess = (pdf: pdfjs.PDFDocumentProxy) => {
    setNumPages(pdf.numPages);
    setPdfDocument(pdf);
    setError(null);
  };

  // 处理加载错误
  const onDocumentLoadError = (error: Error) => {
    console.error('PDF加载失败:', error);
    console.error('PDF URL:', pdfUrl);
    setError(`PDF加载失败: ${error.message || '请检查文件路径或网络连接'}`);
  };

  // 页面导航
  const goToPage = (page: number) => {
    const newPage = Math.max(1, Math.min(page, numPages));
    setPageNumber(newPage);
  };

  // 处理侧边栏页面点击
  const handleSidebarPageClick = (pageNumber: number) => {
    setPageNumber(pageNumber);
    setShowAllPages(false);
  };

  // 缩放控制
  const zoom = (delta: number) => {
    setScale(prevScale => {
      const newScale = prevScale + delta;
      return Math.max(0.5, Math.min(2.5, newScale));
    });
  };

  // 旋转控制
  const rotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // 处理窗口大小变化
  const updatePageWidth = useCallback((ref: HTMLDivElement | null) => {
    if (ref) {
      const debouncedUpdate = debounce(() => {
        setPageWidth(ref.clientWidth);
      }, 100);
      debouncedUpdate();
    }
  }, []);

  // 键盘快捷键
  useHotkeys('left', () => goToPage(pageNumber - 1), [pageNumber]);
  useHotkeys('right', () => goToPage(pageNumber + 1), [pageNumber]);
  useHotkeys('ctrl+=', () => zoom(0.1), []);
  useHotkeys('ctrl+-', () => zoom(-0.1), []);

  // 添加全屏切换函数
  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
        setIsFullscreen(true);
      } catch (error) {
        console.error('Error attempting to enable fullscreen:', error);
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

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  return (
    <div className='flex flex-col h-full'>
      {/* 工具栏 */}
      <div className='flex items-center gap-2 p-2 bg-muted border-b'>
        <Button
          variant='outline'
          size='icon'
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className='h-4 w-4' />
        </Button>

        <div className='flex items-center gap-2'>
          <Input
            type='number'
            min={1}
            max={numPages}
            value={pageNumber}
            onChange={e => goToPage(parseInt(e.target.value) || 1)}
            className='w-16 text-center'
          />
          <span className='text-sm text-muted-foreground'>/ {numPages}</span>
        </div>

        <Button
          variant='outline'
          size='icon'
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
        >
          <ChevronRight className='h-4 w-4' />
        </Button>

        <div className='ml-auto flex items-center gap-2'>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setShowSidebar(!showSidebar)}
            title={showSidebar ? '隐藏侧边栏' : '显示侧边栏'}
          >
            <PanelLeft className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => zoom(-0.1)}
            disabled={scale <= 0.5}
          >
            <ZoomOut className='h-4 w-4' />
          </Button>
          <span className='text-sm min-w-[3rem] text-center'>
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant='outline'
            size='icon'
            onClick={() => zoom(0.1)}
            disabled={scale >= 2.5}
          >
            <ZoomIn className='h-4 w-4' />
          </Button>
          <Button variant='outline' size='icon' onClick={rotate}>
            <RotateCw className='h-4 w-4' />
          </Button>
          <Button
            variant='outline'
            size='icon'
            onClick={() => setShowAllPages(!showAllPages)}
            title={showAllPages ? '单页模式' : '滚动模式'}
          >
            {showAllPages ? (
              <ScrollText className='h-4 w-4' />
            ) : (
              <FileText className='h-4 w-4' />
            )}
          </Button>
          <Button variant='outline' size='icon' onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize2 className='h-4 w-4' />
            ) : (
              <Maximize2 className='h-4 w-4' />
            )}
          </Button>
        </div>
      </div>

      {/* PDF 显示区域 */}
      <div className='flex flex-1 overflow-hidden'>
        {/* 侧边栏 */}
        {showSidebar && pdfDocument && (
          <PDFSidebar
            pdfDocument={pdfDocument}
            currentPage={pageNumber}
            onPageClick={handleSidebarPageClick}
          />
        )}

        {/* 主内容区域 */}
        <div
          ref={ref => updatePageWidth(ref)}
          className='flex-1 overflow-y-auto pdf-container'
        >
          <div className='flex justify-center min-h-full px-4'>
            <Document
              file={proxyPdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={pdfOptions}
              loading={
                <div className='flex items-center justify-center h-full'>
                  <p className='text-muted-foreground'>正在加载PDF文档...</p>
                </div>
              }
            >
              {error ? (
                <div className='flex items-center justify-center h-full min-h-[400px] text-destructive text-center px-4'>
                  <div className='max-w-md'>
                    <p className='text-lg font-medium mb-2'>文件加载失败</p>
                    <p className='text-sm opacity-80'>{error}</p>
                  </div>
                </div>
              ) : showAllPages ? (
                // 显示所有页面模式
                Array.from(new Array(numPages), (el, index) => (
                  <div key={`page_${index + 1}`} className='mb-4'>
                    <Page
                      pageNumber={index + 1}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                      width={pageWidth}
                      scale={scale}
                      rotate={rotation}
                    />
                  </div>
                ))
              ) : (
                // 单页模式
                <Page
                  pageNumber={pageNumber}
                  renderTextLayer={false}
                  renderAnnotationLayer={false}
                  width={pageWidth}
                  scale={scale}
                  rotate={rotation}
                />
              )}
            </Document>
          </div>
        </div>
      </div>

      {/* 移动端页面导航 */}
      <div className='md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-50'>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => goToPage(pageNumber - 1)}
          disabled={pageNumber <= 1}
        >
          <ChevronLeft className='h-4 w-4 mr-1' />
          上一页
        </Button>
        <Button
          variant='secondary'
          size='sm'
          onClick={() => goToPage(pageNumber + 1)}
          disabled={pageNumber >= numPages}
        >
          下一页
          <ChevronRight className='h-4 w-4 ml-1' />
        </Button>
      </div>
    </div>
  );
}