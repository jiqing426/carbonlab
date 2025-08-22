"use client";

import React, { useEffect, useState } from "react";
import { getCourseById } from "@/lib/courses";
import { CourseContent } from "@/components/course/CourseContent";
import { Difficulty } from "@/lib/database";

// 定义课程类型
type Course = {
  id: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  status?: string;
  category: string;
  icon?: string;
  average_rating: string;
  module: string;
  image?: string;
} | null;

export default function CourseDetail({ params }: { params: { "course-id": string } }) {
  const [course, setCourse] = useState<Course>(null);
  const [loading, setLoading] = useState(true);
  const courseId = params["course-id"];

  useEffect(() => {
    async function fetchInitialData() {
      setLoading(true);
      const courseData = await getCourseById(courseId);
      // 添加缺失的属性来满足 Course 类型要求
      if (courseData) {
        // 转换 difficulty 类型
        const difficultyMap: Record<string, Difficulty> = {
          "beginner": "基础",
          "intermediate": "中级", 
          "advanced": "高级"
        };
        
        setCourse({
          ...courseData,
          category: courseData.module,
          average_rating: courseData.rating?.toString() || "4.5",
          difficulty: difficultyMap[courseData.difficulty] || "中级"
        });
      } else {
        setCourse(null);
      }
      setLoading(false);
    }
    fetchInitialData();
  }, [courseId]);

  // 根据模块ID获取模块样式
  const getModuleStyles = (moduleId: string) => {
    switch (moduleId) {
      case "carbon-monitor":
        return {
          bg: "bg-emerald-50",
          gradient: "from-green-600 to-emerald-700",
          icon: "text-emerald-600"
        };
      case "carbon-calculate":
        return {
          bg: "bg-blue-50",
          gradient: "from-blue-600 to-indigo-700",
          icon: "text-blue-600"
        };
      case "carbon-trading":
        return {
          bg: "bg-purple-50",
          gradient: "from-purple-600 to-violet-700",
          icon: "text-purple-600"
        };
      case "carbon-neutral":
        return {
          bg: "bg-orange-50",
          gradient: "from-orange-600 to-amber-700",
          icon: "text-orange-600"
        };
      default:
        return {
          bg: "bg-gray-50",
          gradient: "from-gray-600 to-gray-700",
          icon: "text-gray-600"
        };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-6 md:py-12">
      {loading ? (
          <div className="flex justify-center py-20">
          <div className="text-center">
              <div className="inline-block w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-6 text-lg text-gray-600 font-medium">加载课程中...</p>
            </div>
        </div>
      ) : course ? (
          <div className="space-y-8">
            {/* 课程头部信息 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="flex flex-col lg:flex-row">
                {/* 课程图片 */}
                <div className="lg:w-2/5">
                  <div className="relative h-64 lg:h-full min-h-[300px] overflow-hidden">
              {course.image ? (
                <img 
                  src={course.image.startsWith('/') ? course.image : `/${course.image}`}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className={`h-full ${getModuleStyles(course.module).bg} flex items-center justify-center`}>
                  {course.icon && <i className={`fas fa-${course.icon} text-6xl ${getModuleStyles(course.module).icon}`}></i>}
                </div>
              )}
                    {/* 渐变遮罩 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
          </div>

                {/* 课程基本信息 */}
                <div className="lg:w-3/5 p-6 lg:p-8 flex flex-col justify-center">
                  {/* 标签 */}
            <div className="flex flex-wrap gap-2 mb-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
                {course.category}
              </span>
                    <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-800 border border-green-200">
                {course.difficulty}
              </span>
              {course.status && (
                      <span className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800 border border-amber-200">
                  {course.status}
                </span>
              )}
            </div>

                  {/* 课程标题 */}
                  <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                    {course.title}
                  </h1>

                  {/* 课程描述 */}
                  <p className="text-gray-600 text-lg leading-relaxed mb-6">
                    {course.description}
                  </p>

                  {/* 评分 */}
            <div className="flex items-center mb-6">
                    <div className="flex items-center">
                      <span className="text-yellow-400 mr-2 text-xl">★</span>
                      <span className="font-bold text-xl text-gray-900 mr-2">{course.average_rating}</span>
                      <span className="text-gray-500 text-sm">(推荐指数)</span>
                    </div>
                  </div>

                  {/* 课程特色介绍 */}
                  {course.id === "carbon-accounting-management" && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 p-5">
                      <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                          <h4 className="font-semibold text-green-800 text-sm mb-1">📊 碳核算标准</h4>
                          <p className="text-green-600 text-xs">掌握国际国内主要碳核算标准</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                          <h4 className="font-semibold text-green-800 text-sm mb-1">🌱 样章内容</h4>
                          <p className="text-green-600 text-xs">第5章碳足迹计量完整内容</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-green-200 shadow-sm">
                          <h4 className="font-semibold text-green-800 text-sm mb-1">🔬 LCA方法</h4>
                          <p className="text-green-600 text-xs">生命周期评价方法应用</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 数字时代的碳规则与碳关税 */}
                  {course.id === "digital-carbon-rules" && (
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-5">
                      <h3 className="text-lg font-semibold text-blue-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">🌐 数字规则</h4>
                          <p className="text-blue-600 text-xs">数字时代碳规则体系</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">💰 碳关税</h4>
                          <p className="text-blue-600 text-xs">碳关税计算方法</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-blue-200 shadow-sm">
                          <h4 className="font-semibold text-blue-800 text-sm mb-1">📈 应对策略</h4>
                          <p className="text-blue-600 text-xs">碳关税应对策略</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 碳市场交易与碳金融 */}
                  {course.id === "carbon-market-trading" && (
                    <div className="bg-gradient-to-r from-purple-50 to-violet-50 rounded-xl border border-purple-200 p-5">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                          <h4 className="font-semibold text-purple-800 text-sm mb-1">📊 交易机制</h4>
                          <p className="text-purple-600 text-xs">碳市场交易机制</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                          <h4 className="font-semibold text-purple-800 text-sm mb-1">💎 产品设计</h4>
                          <p className="text-purple-600 text-xs">碳金融产品设计</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-purple-200 shadow-sm">
                          <h4 className="font-semibold text-purple-800 text-sm mb-1">🛡️ 风险管理</h4>
                          <p className="text-purple-600 text-xs">风险管理策略</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 数智化碳监测与系统开发 */}
                  {course.id === "digital-carbon-monitoring" && (
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-200 p-5">
                      <h3 className="text-lg font-semibold text-emerald-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                          <h4 className="font-semibold text-emerald-800 text-sm mb-1">🔍 智能监测</h4>
                          <p className="text-emerald-600 text-xs">数智化监测技术</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                          <h4 className="font-semibold text-emerald-800 text-sm mb-1">💻 系统开发</h4>
                          <p className="text-emerald-600 text-xs">碳监测系统开发</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-emerald-200 shadow-sm">
                          <h4 className="font-semibold text-emerald-800 text-sm mb-1">📱 技术应用</h4>
                          <p className="text-emerald-600 text-xs">前沿技术应用</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 碳核算标准与方法 */}
                  {course.id === "carbon-accounting-standards" && (
                    <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl border border-cyan-200 p-5">
                      <h3 className="text-lg font-semibold text-cyan-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-cyan-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-cyan-200 shadow-sm">
                          <h4 className="font-semibold text-cyan-800 text-sm mb-1">📋 国际标准</h4>
                          <p className="text-cyan-600 text-xs">ISO 14064等国际标准</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-cyan-200 shadow-sm">
                          <h4 className="font-semibold text-cyan-800 text-sm mb-1">🇨🇳 国内规范</h4>
                          <p className="text-cyan-600 text-xs">国内碳核算规范</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-cyan-200 shadow-sm">
                          <h4 className="font-semibold text-cyan-800 text-sm mb-1">🔧 核算方法</h4>
                          <p className="text-cyan-600 text-xs">实用核算方法</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 产品生命周期评价 */}
                  {course.id === "life-cycle-assessment" && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 p-5">
                      <h3 className="text-lg font-semibold text-orange-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-orange-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                          <h4 className="font-semibold text-orange-800 text-sm mb-1">♻️ 全生命周期</h4>
                          <p className="text-orange-600 text-xs">产品全生命周期分析</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                          <h4 className="font-semibold text-orange-800 text-sm mb-1">📊 环境影响</h4>
                          <p className="text-orange-600 text-xs">环境影响评估</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-orange-200 shadow-sm">
                          <h4 className="font-semibold text-orange-800 text-sm mb-1">🎯 评价方法</h4>
                          <p className="text-orange-600 text-xs">LCA评价方法</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 碳交易基础知识 */}
                  {course.id === "carbon-trading-fundamentals" && (
                    <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200 p-5">
                      <h3 className="text-lg font-semibold text-indigo-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                          <h4 className="font-semibold text-indigo-800 text-sm mb-1">📚 基础知识</h4>
                          <p className="text-indigo-600 text-xs">碳交易基础概念</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                          <h4 className="font-semibold text-indigo-800 text-sm mb-1">🌍 全球市场</h4>
                          <p className="text-indigo-600 text-xs">全球碳市场介绍</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-indigo-200 shadow-sm">
                          <h4 className="font-semibold text-indigo-800 text-sm mb-1">⚖️ 运行规则</h4>
                          <p className="text-indigo-600 text-xs">市场运行规则</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 碳金融与衍生品 */}
                  {course.id === "carbon-derivatives" && (
                    <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 p-5">
                      <h3 className="text-lg font-semibold text-pink-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-pink-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-sm">
                          <h4 className="font-semibold text-pink-800 text-sm mb-1">💎 金融产品</h4>
                          <p className="text-pink-600 text-xs">创新碳金融产品</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-sm">
                          <h4 className="font-semibold text-pink-800 text-sm mb-1">📈 衍生品</h4>
                          <p className="text-pink-600 text-xs">碳期货、期权</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-pink-200 shadow-sm">
                          <h4 className="font-semibold text-pink-800 text-sm mb-1">💰 定价策略</h4>
                          <p className="text-pink-600 text-xs">定价与风险管理</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 可再生能源系统集成 */}
                  {course.id === "renewable-energy-integration" && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl border border-yellow-200 p-5">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                          <h4 className="font-semibold text-yellow-800 text-sm mb-1">☀️ 可再生能源</h4>
                          <p className="text-yellow-600 text-xs">太阳能、风能等</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                          <h4 className="font-semibold text-yellow-800 text-sm mb-1">🔌 系统集成</h4>
                          <p className="text-yellow-600 text-xs">系统集成技术</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-yellow-200 shadow-sm">
                          <h4 className="font-semibold text-yellow-800 text-sm mb-1">⚡ 电网接入</h4>
                          <p className="text-yellow-600 text-xs">智能电网接入</p>
            </div>
          </div>
        </div>
                  )}

                  {/* 碳捕集与封存技术 */}
                  {course.id === "carbon-capture-technologies" && (
                    <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl border border-slate-200 p-5">
                      <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center">
                        <span className="w-2 h-2 bg-slate-500 rounded-full mr-2"></span>
                        课程特色
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 text-sm mb-1">🌫️ 碳捕集</h4>
                          <p className="text-slate-600 text-xs">碳捕集技术</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 text-sm mb-1">🏔️ 碳封存</h4>
                          <p className="text-slate-600 text-xs">碳封存技术</p>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          <h4 className="font-semibold text-slate-800 text-sm mb-1">🔬 前沿技术</h4>
                          <p className="text-slate-600 text-xs">前沿CCUS技术</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 课程说明 */}
          {course.id === "carbon-accounting-management" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-book text-green-600"></i>
                  </div>
                  课程说明
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 核心内容卡片 */}
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-purple-800 mb-3">📚 核心内容</h4>
                      <p className="text-purple-700 text-sm leading-relaxed mb-4">
                        包含碳足迹计量标准体系、生命周期评价方法、碳足迹计算与数据质量等核心内容。
                      </p>
                      <div className="flex items-center text-sm text-purple-600 font-medium">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        重点：理论与实践结合
                      </div>
                    </div>
                  </div>

                  {/* 样章内容卡片 */}
                  <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-green-800 mb-3">🎯 样章内容</h4>
                      <p className="text-green-700 text-sm leading-relaxed mb-4">
                        第5章完整展示了碳足迹计量的标准体系、LCA方法应用、数据质量控制等核心内容。
                      </p>
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        状态：可预览学习
                      </div>
                    </div>
                  </div>

                  {/* 编写进度卡片 */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-blue-800 mb-3">📖 编写进度</h4>
                      <p className="text-blue-700 text-sm leading-relaxed mb-4">
                        目前第5章"碳足迹计量"已完成编写，作为样章供大家预览学习。其他章节正在编写中。
                      </p>
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        进度：20% 完成
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 其他课程的课程说明 */}
            {course.id !== "carbon-accounting-management" && (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-8 flex items-center">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                    <i className="fas fa-info-circle text-blue-600"></i>
                  </div>
                  课程说明
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* 学习目标卡片 */}
                  <div className="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="flex-1">
                      <h4 className="text-xl font-bold text-blue-800 mb-3">🎯 学习目标</h4>
                      <p className="text-blue-700 text-sm leading-relaxed mb-4">
                        掌握课程核心概念和方法，提升专业能力，为实际工作应用打下坚实基础。
                      </p>
                      <div className="flex items-center text-sm text-blue-600 font-medium">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                        目标：理论与实践并重
                      </div>
                    </div>
                  </div>

                  {/* 适用人群卡片 */}
                  <div className="group bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-green-800 mb-3">👥 适用人群</h4>
                      <p className="text-green-700 text-sm leading-relaxed mb-4">
                        适合相关专业学生、从业人员、企业管理者等对碳管理领域感兴趣的学习者。
                      </p>
                      <div className="flex items-center text-sm text-green-600 font-medium">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        人群：广泛适用
                      </div>
                    </div>
                  </div>

                  {/* 课程特色卡片 */}
                  <div className="group bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-purple-800 mb-3">✨ 课程特色</h4>
                      <p className="text-purple-700 text-sm leading-relaxed mb-4">
                        内容前沿、案例丰富、实用性强，结合最新行业动态和实际应用场景。
                      </p>
                      <div className="flex items-center text-sm text-purple-600 font-medium">
                        <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                        特色：前沿实用
                      </div>
                  </div>
                </div>
              </div>
            </div>
          )}

            {/* 课程大纲 */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <CourseContent courseId={courseId} />
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-exclamation-triangle text-red-600 text-2xl"></i>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">课程不存在</h2>
            <p className="text-gray-600">该课程可能已被删除或暂时不可用</p>
        </div>
      )}
      </div>
    </div>
  );
}