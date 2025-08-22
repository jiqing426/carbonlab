"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { useError } from "@/contexts/error-context";
import { FeatureLink, ExperimentLink, CourseLink } from "@/components/ui/feature-link";
import Link from "next/link";

export default function TestBoundaryPage() {
  const { showError, handleNotFound, handleFeatureNotAvailable } = useError();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">边界功能测试页面</h1>
            <p className="text-gray-600 text-lg">
              测试各种错误处理和边界功能的场景 - 弹框在当前页面显示
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 基本错误处理测试 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">基本错误处理</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => showError("这是一个自定义错误消息")}
                  className="w-full"
                  variant="outline"
                >
                  显示自定义错误
                </Button>
                <Button
                  onClick={handleNotFound}
                  className="w-full"
                  variant="outline"
                >
                  模拟404错误
                </Button>
                <Button
                  onClick={() => handleFeatureNotAvailable("用户管理")}
                  className="w-full"
                  variant="outline"
                >
                  功能未开放提示
                </Button>
              </div>
            </div>

            {/* 链接组件测试 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">链接组件测试</h2>
              <div className="space-y-3">
                <FeatureLink
                  href="/non-existent-page"
                  isAvailable={false}
                  featureName="高级功能"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  功能链接（未开放）
                </FeatureLink>
                <ExperimentLink
                  href="/experiments/advanced"
                  experimentName="高级实验"
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  实验链接（未开放）
                </ExperimentLink>
                <CourseLink
                  href="/courses/advanced"
                  courseName="高级课程"
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  课程链接（未开放）
                </CourseLink>
              </div>
            </div>

            {/* 正常链接测试 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">正常链接测试</h2>
              <div className="space-y-3">
                <Link
                  href="/"
                  className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-center block"
                >
                  返回首页（正常）
                </Link>
                <FeatureLink
                  href="/"
                  isAvailable={true}
                  className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                >
                  功能链接（已开放）
                </FeatureLink>
              </div>
            </div>

            {/* 错误边界测试 */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">错误边界测试</h2>
              <div className="space-y-3">
                <Button
                  onClick={() => {
                    throw new Error("这是一个测试错误");
                  }}
                  className="w-full"
                  variant="destructive"
                >
                  抛出错误（测试错误边界）
                </Button>
                <Button
                  onClick={() => {
                    // 模拟异步错误
                    setTimeout(() => {
                      throw new Error("异步错误");
                    }, 100);
                  }}
                  className="w-full"
                  variant="destructive"
                >
                  异步错误测试
                </Button>
              </div>
            </div>
          </div>

          {/* 课程内容链接测试 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">课程内容链接测试</h2>
            <p className="text-gray-600 mb-4">测试课程大纲中的课时链接是否都应用了边界功能</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">未开放功能（应显示弹框）</h3>
                <FeatureLink
                  href="/courses/carbon-accounting-management/lessons/unit1-lesson1"
                  isAvailable={false}
                  featureName="数字时代的碳规则与碳关税 单元1 第1节"
                  className="w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  数字时代的碳规则与碳关税 单元1 第1节
                </FeatureLink>
                <FeatureLink
                  href="/courses/carbon-accounting-management/lessons/unit2-lesson1"
                  isAvailable={false}
                  featureName="碳市场交易与碳金融 单元1 第1节"
                  className="w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  碳市场交易与碳金融 单元1 第1节
                </FeatureLink>
                <FeatureLink
                  href="/news"
                  isAvailable={false}
                  featureName="新闻中心"
                  className="w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  新闻中心
                </FeatureLink>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">已开放功能（应正常跳转）</h3>
                <FeatureLink
                  href="/courses/carbon-accounting-management/chapter-5"
                  isAvailable={true}
                  className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200"
                >
                  第5章 碳足迹计量（样章）
                </FeatureLink>
                <Link
                  href="/"
                  className="w-full bg-blue-100 text-blue-800 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors border border-blue-200 text-center block"
                >
                  返回首页
                </Link>
              </div>
            </div>
          </div>

          {/* 实验链接测试 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">实验链接测试</h2>
            <p className="text-gray-600 mb-4">测试实验链接的边界功能，已上线的实验应该可以正常点击</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">已上线实验（应正常跳转）</h3>
                <Link
                  href="/experiments/carbon-neutral-prediction"
                  className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200 text-center block"
                >
                  碳中和预测
                </Link>
                <Link
                  href="/experiments/project-carbon-calculation"
                  className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200 text-center block"
                >
                  项目碳精算实验
                </Link>
                <Link
                  href="/experiments/carbon-trading-simulation"
                  className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-lg hover:bg-green-200 transition-colors border border-green-200 text-center block"
                >
                  碳交易模拟
                </Link>
              </div>
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">未上线实验（应显示弹框）</h3>
                <ExperimentLink
                  href="/experiments/advanced-experiment"
                  experimentName="高级实验"
                  className="w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  高级实验（未上线）
                </ExperimentLink>
                <ExperimentLink
                  href="/experiments/future-experiment"
                  experimentName="未来实验"
                  className="w-full bg-red-100 text-red-800 px-4 py-2 rounded-lg hover:bg-red-200 transition-colors border border-red-200"
                >
                  未来实验（未上线）
                </ExperimentLink>
              </div>
            </div>
          </div>

          {/* 当前页面状态显示 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">当前页面状态</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">页面URL</h3>
                <p className="text-blue-600 text-sm">{typeof window !== 'undefined' ? window.location.href : '加载中...'}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">页面标题</h3>
                <p className="text-green-600 text-sm">{typeof document !== 'undefined' ? document.title : '加载中...'}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-purple-800 mb-2">测试时间</h3>
                <p className="text-purple-600 text-sm">{new Date().toLocaleString('zh-CN')}</p>
              </div>
            </div>
          </div>

          {/* 说明文档 */}
          <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">使用说明</h2>
            <div className="prose prose-gray max-w-none">
              <ul className="space-y-2 text-gray-600">
                <li>• <strong>基本错误处理</strong>: 测试各种错误提示的显示</li>
                <li>• <strong>链接组件测试</strong>: 测试未开放功能的链接点击</li>
                <li>• <strong>正常链接测试</strong>: 测试正常功能的链接跳转</li>
                <li>• <strong>错误边界测试</strong>: 测试React错误边界的捕获</li>
                <li>• <strong>课程内容链接测试</strong>: 测试课程大纲中的课时链接</li>
              </ul>
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="text-blue-800 text-sm">
                  <strong>重要更新：</strong> 现在所有弹窗都会在当前页面显示，不会跳转到新页面。
                  弹窗位置固定在右上角，提供统一的用户体验。点击"返回上页"或"返回首页"可以关闭弹窗并导航到相应页面。
                </p>
              </div>
              <div className="mt-4 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm">
                  <strong>测试要点：</strong> 
                  1. 点击未开放功能链接时，弹框应该直接在当前页面显示
                  2. 页面URL不应该改变
                  3. 弹框关闭后应该回到当前页面状态
                  4. 课程大纲中的课时链接都应该应用边界功能
                </p>
              </div>
              <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800 text-sm">
                  <strong>已修复的问题：</strong> 
                  - 课程内容中的课时链接现在都使用边界功能
                  - 首页的新闻、报告、数据集链接也应用了边界功能
                  - 所有未开放功能都会显示弹框而不是跳转页面
                  - <strong>实验链接已修复</strong>：已上线的实验可以正常点击，未上线的实验显示弹框
                  - <strong>课程链接已修复</strong>：已发布的课程可以正常点击，不会被错误拦截
                  - <strong>实验页面已创建</strong>：为所有实验创建了对应的页面，现在都可以正常访问
                  - <strong>双碳快讯链接已修复</strong>：新闻中心、研究报告、数据集等链接现在可以正常跳转
                  - <strong>课程章节布局已优化</strong>：未上线课程章节名称左对齐，箭头在最右边
                  - <strong>新闻页面图片已修复</strong>：政策法规轮播图片现在可以正常显示
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 