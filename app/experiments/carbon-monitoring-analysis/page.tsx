"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, MapPin, Globe, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function CarbonMonitoringAnalysisPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-100 rounded-full mb-6">
            <BarChart3 className="w-10 h-10 text-emerald-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">碳监测与计量分析</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            基于地理空间数据的碳排放分布可视化与动态监测分析
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-100 text-emerald-800">
              <MapPin className="w-4 h-4 mr-2" />
              中级难度
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Globe className="w-4 h-4 mr-2" />
              碳监测模块
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
                  <BarChart3 className="w-5 h-5 mr-2 text-emerald-600" />
                  实验介绍
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  本实验将带领您深入了解基于地理空间数据的碳排放监测与分析方法。通过交互式的数据可视化界面，
                  您将学习如何分析不同地区的碳排放分布模式，理解碳排放的动态变化趋势，并掌握相关的分析技术。
                </p>
                <div className="bg-emerald-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-emerald-800 mb-2">实验目标</h4>
                  <ul className="text-emerald-700 space-y-1 text-sm">
                    <li>• 掌握地理空间数据分析的基本方法</li>
                    <li>• 学习碳排放分布的可视化技术</li>
                    <li>• 理解碳排放监测系统的设计原理</li>
                    <li>• 培养数据驱动的环境分析能力</li>
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
                  <span className="font-medium">中级</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">预计时长</span>
                  <span className="font-medium">45-60分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">适用人群</span>
                  <span className="font-medium">环境科学、地理信息等专业学生</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">实验特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">实时数据</h4>
                    <p className="text-sm text-gray-600">基于最新的碳排放监测数据</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">地理可视化</h4>
                    <p className="text-sm text-gray-600">直观的地图展示和空间分析</p>
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
              <BarChart3 className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">实验正在开发中</h3>
            <p className="text-yellow-700 mb-4">
              本实验目前正在开发中，预计将在近期上线。我们将为您提供最先进的碳监测分析工具和丰富的学习内容。
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