"use client"

import { useState, useEffect } from "react"
import { notFound, useParams } from "next/navigation"
import { modules, Module, Difficulty, getModuleExperiments } from "@/lib/database"
import ModuleHeader from "@/components/module/ModuleHeader"
import ExperimentList from "@/components/module/ExperimentList"
import CourseList from "@/components/module/CourseList"
import ExperimentHistory from "@/components/module/ExperimentHistory"
import SearchAndFilter from "@/components/module/SearchAndFilter"
import Footer from "@/components/home/Footer"
import Link from "next/link"
import { MonitorIcon, CalculateIcon, TradeIcon, NeutralIcon } from "@/components/module/ModuleIcons"
import { getQuizzesByIds, Quiz } from "@/lib/api/quizzes"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Toaster } from "@/components/ui/toaster"
import React from "react"

export default function ModulePage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [difficultyFilter, setDifficultyFilter] = useState<Difficulty | "all">("all")
  const [courses, setCourses] = useState<Quiz[]>([])
  const [coursesLoading, setCoursesLoading] = useState(true)

  const params = useParams<{ "module-id": string }>()
  const moduleId = params["module-id"]
  const module = modules.find((m: Module) => m.id === moduleId)

  if (!module) {
    notFound()
  }

  // 获取当前模块的所有实验
  const moduleExperiments = getModuleExperiments(moduleId)

  // 获取当前模块的课程
  useEffect(() => {
    const fetchCourses = async () => {
      if (module.courseIds && module.courseIds.length > 0) {
        setCoursesLoading(true)
        try {
          const courseData = await getQuizzesByIds(module.courseIds)
          setCourses(courseData)
        } catch (error) {
          console.error('获取课程数据失败:', error)
          setCourses([])
        } finally {
          setCoursesLoading(false)
        }
      } else {
        setCourses([])
        setCoursesLoading(false)
      }
    }

    fetchCourses()
  }, [module.courseIds])

  // 根据 module.id 选择合适的图标
  const getModuleIcon = () => {
    switch(module.id) {
      case "carbon-monitor":
        return <MonitorIcon />
      case "carbon-calculate":
        return <CalculateIcon />
      case "carbon-trading":
        return <TradeIcon />
      case "carbon-neutral":
        return <NeutralIcon />
      default:
        return <MonitorIcon />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 模块头部，包含导航栏 */}
      <ModuleHeader module={module} />

      {/* 模块内容容器 - 添加上边距，避免被固定导航栏遮挡 */}
      <div className="flex-1 pt-6">
        {/* 模块介绍部分 */}
        <section className="mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`bg-gradient-to-r rounded-xl shadow-lg overflow-hidden ${
            module.id === "carbon-monitor" ? "from-green-600 to-emerald-700" :
            module.id === "carbon-calculate" ? "from-blue-600 to-indigo-700" :
            module.id === "carbon-trading" ? "from-purple-600 to-violet-700" :
            "from-orange-600 to-amber-700"
          }`}>
            <div className="md:flex">
              <div className="md:flex-1 p-8 md:p-12 text-white">
                <h1 className="text-3xl md:text-4xl font-bold mb-4">{module.title}</h1>
                <p className="text-lg md:text-xl mb-6 opacity-90">{module.subtitle || "面向双碳战略的仿真模拟教学系统"}</p>
                <p className="text-base md:text-lg mb-8 opacity-80">{module.description}</p>
                <Link
                  href="/"
                  className="inline-block bg-white text-indigo-600 font-medium px-6 py-3 rounded-lg shadow-md hover:bg-gray-50 transition duration-300 transform hover:scale-105"
                >
                  <i className="fas fa-arrow-left mr-2"></i>返回首页
                </Link>
              </div>
              <div className="md:flex-1 flex items-center justify-center p-8 md:p-12 bg-opacity-30">
                {module.headerSvg || (
                  <div className="rounded-lg shadow-lg max-h-80 w-full bg-white bg-opacity-10 p-8 flex items-center justify-center">
                    {getModuleIcon()}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 碳核算与碳管理模块特殊介绍 */}
          {module.id === "carbon-calculate" && (
            <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-green-800 mb-2">📖 样章预览</h2>
                <p className="text-green-700">碳核算与碳管理模块样章内容展示</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-book text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800">第5章 碳足迹计量</h3>
                  </div>
                  <p className="text-green-700 text-sm mb-4">
                    本章是教材的样章内容，完整展示了碳足迹计量的标准、方法和实践应用。
                    其他章节正在编写中，敬请期待。
                  </p>
                  <div className="space-y-2 text-xs text-green-600">
                    <div>• 5.1 碳足迹计量标准</div>
                    <div>• 5.2 生命周期评价方法与碳足迹</div>
                    <div>• 5.3 碳足迹计算与数据质量</div>
                  </div>
                </div>
                <div className="bg-white p-6 rounded-lg border border-green-200">
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                      <i className="fas fa-info-circle text-white"></i>
                    </div>
                    <h3 className="text-lg font-semibold text-blue-800">编写进度</h3>
                  </div>
                  <ul className="space-y-2 text-sm text-blue-700">
                    <li className="flex items-start">
                      <i className="fas fa-check-circle text-blue-500 mt-1 mr-2"></i>
                      <span>第5章已完成，作为样章供预览</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-clock text-blue-500 mt-1 mr-2"></i>
                      <span>其他章节正在编写中</span>
                    </li>
                    <li className="flex items-start">
                      <i className="fas fa-star text-blue-500 mt-1 mr-2"></i>
                      <span>样章内容完整，可正常学习使用</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* 主要内容 */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* 搜索和过滤部分 */}
          <SearchAndFilter
            onSearch={setSearchTerm}
            onDifficultyChange={setDifficultyFilter}
          />

          {/* 内容标签页 */}
          <Tabs defaultValue="experiments" className="mt-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="experiments">实验列表</TabsTrigger>
              <TabsTrigger value="courses">课程列表</TabsTrigger>
              <TabsTrigger value="history">实验记录</TabsTrigger>
            </TabsList>

            <TabsContent value="experiments" className="mt-6">
              <ExperimentList
                experiments={moduleExperiments}
                searchTerm={searchTerm}
                difficultyFilter={difficultyFilter}
              />
            </TabsContent>

            <TabsContent value="courses" className="mt-6">
              <CourseList
                courses={courses}
                loading={coursesLoading}
              />
            </TabsContent>

            <TabsContent value="history" className="mt-6">
              <ExperimentHistory />
            </TabsContent>
          </Tabs>
        </main>
      </div>

      <div className="mt-8">
        <Footer />
      </div>
      <Toaster />
    </div>
  )
}