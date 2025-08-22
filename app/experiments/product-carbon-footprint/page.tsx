"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recycle, Calculator, TrendingUp, Leaf } from "lucide-react";
import Link from "next/link";

export default function ProductCarbonFootprintPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-100 rounded-full mb-6">
            <Recycle className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">产品碳足迹分析</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            产品全生命周期碳足迹评估与环境影响分析
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Calculator className="w-4 h-4 mr-2" />
              高级难度
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
              <Leaf className="w-4 h-4 mr-2" />
              碳核算模块
            </span>
          </div>
        </div>

        {/* 实验内容 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* 左侧：实验介绍 */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Recycle className="w-5 h-5 mr-2 text-blue-600" />
                  实验介绍
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  本实验将深入探讨产品全生命周期的碳足迹评估方法。从原材料获取、生产制造、运输配送、
                  使用维护到最终处置，您将学习如何系统性地识别和量化产品各阶段的碳排放，为绿色产品设计提供科学依据。
                </p>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">实验目标</h4>
                  <ul className="text-blue-700 space-y-1 text-sm">
                    <li>• 掌握生命周期评价（LCA）的基本原理和方法</li>
                    <li>• 学习产品碳足迹的计算和评估技术</li>
                    <li>• 理解产品设计中的环境影响考量</li>
                    <li>• 培养可持续发展的产品设计思维</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：实验信息 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">实验信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">难度等级</span>
                  <span className="font-medium">高级</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预计时长</span>
                  <span className="font-medium">60-90分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">适用人群</span>
                  <span className="font-medium">环境工程、产品设计等专业学生</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">实验特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">全生命周期分析</h4>
                    <p className="text-sm text-gray-600">覆盖产品从摇篮到坟墓的完整过程</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Calculator className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">精确计算</h4>
                    <p className="text-sm text-gray-600">基于国际标准的碳足迹计算方法</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 实验状态提示 */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
              <Recycle className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">实验正在开发中</h3>
            <p className="text-yellow-700 mb-4">
              本实验目前正在开发中，预计将在近期上线。我们将为您提供最全面的产品碳足迹分析工具和丰富的学习内容。
            </p>
            <div className="flex justify-center gap-4">
              <Button variant="outline" className="border-yellow-500 text-yellow-700 hover:bg-yellow-100">
                订阅更新通知
              </Button>
              <Link href="/">
                <Button variant="outline">
                  返回首页
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 