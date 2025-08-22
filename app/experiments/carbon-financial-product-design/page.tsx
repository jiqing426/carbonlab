"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Coins, LineChart, TrendingUp, Shield } from "lucide-react";
import Link from "next/link";

export default function CarbonFinancialProductDesignPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-violet-100">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
            <Coins className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">碳金融产品设计</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            设计和开发创新碳金融产品与风险管理工具
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
              <LineChart className="w-4 h-4 mr-2" />
              高级难度
            </span>
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              <Coins className="w-4 h-4 mr-2" />
              碳交易模块
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
                  <Coins className="w-5 h-5 mr-2 text-purple-600" />
                  实验介绍
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  本实验将带领您探索碳金融产品的创新设计理念和实践方法。通过模拟真实的金融市场环境，
                  您将学习如何设计碳期货、碳期权、碳债券等金融产品，并掌握相关的风险管理和定价策略。
                </p>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">实验目标</h4>
                  <ul className="text-purple-700 space-y-1 text-sm">
                    <li>• 理解碳金融产品的基本原理和设计思路</li>
                    <li>• 掌握碳金融产品的定价和风险管理方法</li>
                    <li>• 学习碳市场中的金融创新工具</li>
                    <li>• 培养金融产品设计和风险控制能力</li>
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
                  <span className="font-medium">75-90分钟</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">适用人群</span>
                  <span className="font-medium">金融、经济、环境等专业学生</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">实验特色</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">创新设计</h4>
                    <p className="text-sm text-gray-600">探索前沿的碳金融产品设计理念</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <Shield className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="font-medium">风险管理</h4>
                    <p className="text-sm text-gray-600">学习碳金融产品的风险控制策略</p>
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
              <Coins className="w-8 h-8 text-yellow-600" />
            </div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">实验正在开发中</h3>
            <p className="text-yellow-700 mb-4">
              本实验目前正在开发中，预计将在近期上线。我们将为您提供最先进的碳金融产品设计工具和丰富的学习内容。
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