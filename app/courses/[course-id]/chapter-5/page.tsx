"use client";

import React, { Suspense, use } from "react";
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
            {/* 使用新的PDF查看器组件 */}
            <div className="w-full h-full">
              <PDFViewer 
                pdfUri="/第5章碳足迹计量.pdf"
                title="第5章 碳足迹计量"
              />
            </div>
          </div>
        </div>



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