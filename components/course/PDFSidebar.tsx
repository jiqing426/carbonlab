"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PDFSidebarProps {
  pdfDocument: any;
  currentPage: number;
  onPageClick: (page: number) => void;
}

export function PDFSidebar({ pdfDocument, currentPage, onPageClick }: PDFSidebarProps) {
  if (!pdfDocument) {
    return null;
  }

  const numPages = pdfDocument.numPages || 0;
  const pages = Array.from({ length: numPages }, (_, i) => i + 1);

  return (
    <div className="w-64 bg-muted border-r overflow-y-auto">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-sm">页面导航</h3>
        <p className="text-xs text-muted-foreground mt-1">
          共 {numPages} 页
        </p>
      </div>
      
      <div className="p-2">
        <div className="grid grid-cols-2 gap-2">
          {pages.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="sm"
              className="h-16 text-xs"
              onClick={() => onPageClick(page)}
            >
              <div className="flex flex-col items-center">
                <span className="font-medium">第 {page} 页</span>
                <span className="text-xs opacity-70">
                  {page === currentPage ? "当前" : "点击查看"}
                </span>
              </div>
            </Button>
          ))}
        </div>
      </div>

      {/* 快速导航 */}
      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageClick(1)}
            disabled={currentPage === 1}
            className="flex-1"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            首页
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageClick(numPages)}
            disabled={currentPage === numPages}
            className="flex-1"
          >
            末页
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
} 