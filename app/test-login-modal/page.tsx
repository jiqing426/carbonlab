"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ExperimentLink } from "@/components/ui/feature-link";
import { LoginRequiredModal } from "@/components/ui/login-required-modal";
import { useUserStore } from "@/lib/stores/user-store";

export default function TestLoginModalPage() {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const { isLoggedIn, user } = useUserStore();

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">登录拦截弹窗测试</h1>
        
        {/* 登录状态显示 */}
        <div className="bg-white rounded-lg p-6 mb-8 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">当前登录状态</h2>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isLoggedIn ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {isLoggedIn ? '已登录' : '未登录'}
            </span>
            {user && (
              <span className="text-gray-600">用户: {user.username}</span>
            )}
          </div>
        </div>

        {/* 测试说明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">测试说明</h2>
          <ul className="text-blue-800 space-y-1">
            <li>• <strong>课程链接</strong>: 无需登录，游客可直接访问所有课程内容</li>
            <li>• <strong>实验链接</strong>: 必须登录，未登录时会在页面右上角显示登录拦截弹窗</li>
            <li>• 弹窗应该显示在整个页面的右上角，而不是在按钮内部</li>
          </ul>
        </div>

        {/* 测试按钮组 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* 实验链接测试 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">实验链接测试</h3>
            <div className="space-y-3">
              <ExperimentLink
                href="/experiments/carbon-footprint"
                experimentName="产品碳足迹分析"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 inline-block text-center"
              >
                开始实验 - 产品碳足迹分析
              </ExperimentLink>
              
              <ExperimentLink
                href="/experiments/carbon-trading"
                experimentName="碳交易模拟"
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 inline-block text-center"
              >
                开始实验 - 碳交易模拟
              </ExperimentLink>
            </div>
          </div>

          {/* 课程链接测试 - 无需登录 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">课程链接测试</h3>
            <p className="text-gray-600 mb-4">课程内容无需登录，游客可直接访问</p>
            <div className="space-y-3">
              <a
                href="/courses/carbon-basics"
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 inline-block text-center"
              >
                开始学习 - 碳基础知识
              </a>
              
              <a
                href="/courses/carbon-market"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105 inline-block text-center"
              >
                开始学习 - 碳市场原理
              </a>
            </div>
          </div>

          {/* 自定义弹窗测试 */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">自定义弹窗测试</h3>
            <Button
              onClick={() => setShowCustomModal(true)}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105"
            >
              测试自定义弹窗
            </Button>
          </div>
        </div>

        {/* 位置测试区域 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4">弹窗位置测试</h3>
          <p className="text-gray-600 mb-4">
            这个区域用于测试弹窗是否正确显示在页面右上角，而不是相对于这个容器。
          </p>
          <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[200px]">
            <div className="absolute top-2 right-2 text-xs text-gray-500">
              容器右上角
            </div>
            <div className="flex items-center justify-center h-full">
              <ExperimentLink
                href="/experiments/test"
                experimentName="位置测试实验"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-3 rounded-lg transition duration-300 transform hover:scale-105"
              >
                点击测试弹窗位置
              </ExperimentLink>
            </div>
          </div>
        </div>

        {/* 自定义弹窗 */}
        <LoginRequiredModal
          isOpen={showCustomModal}
          onClose={() => setShowCustomModal(false)}
          message="这是一个自定义的登录拦截弹窗"
          featureName="高级功能"
        />
      </div>
    </div>
  );
}
