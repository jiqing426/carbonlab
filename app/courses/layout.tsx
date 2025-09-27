"use client"

import { ReactNode, useEffect, useState } from "react"
import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { modules } from "@/lib/database"
import { getCourseByIdForComponent } from "@/lib/api/courses"

interface CourseLayoutProps {
  children: ReactNode
}

export default function CourseLayout({ children }: CourseLayoutProps) {
  const params = useParams<{ "course-id": string }>()
  const pathname = usePathname()
  const [courseModule, setCourseModule] = useState<{ id: string; title: string } | null>(null)
  const [loading, setLoading] = useState(true)
  
  // 提取课程ID，可能从路径参数或URL路径中获取
  const getCourseId = (): string => {
    // 直接从 params 对象获取课程 ID
    if (params && params["course-id"]) {
      return params["course-id"]
    }
    
    // 如果没有路径参数，从URL路径中提取
    // URL路径形如 /courses/carbon-economy-basics
    const segments = pathname.split('/')
    if (segments.length > 2) {
      return segments[2] // 获取 'carbon-economy-basics' 部分
    }
    
    return ""
  }
  
  const courseId = getCourseId()
  
  // 获取课程的所属模块
  useEffect(() => {
    const fetchCourseModule = async () => {
      if (courseId) {
        try {
          const course = await getCourseByIdForComponent(courseId)
          if (course) {
            // 由于API返回的课程数据没有module字段，暂时设置默认模块
            // 如果需要模块信息，需要在API中添加相应字段
            setCourseModule({
              id: "carbon-monitor", // 默认模块
              title: "碳监测"
            })
          }
        } catch (error) {
          console.error("Failed to fetch course:", error)
        }
      }
      setLoading(false)
    }
    
    fetchCourseModule()
  }, [courseId])
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <nav className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-xl font-semibold text-gray-800 shrink-0">
                <i className="fas fa-leaf mr-2 text-green-500"></i>
                碳经济与管理AI实训平台
              </Link>
              
              {/* 面包屑导航 */}
              <div className="md:flex hidden">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="/" className="text-sm text-gray-600 hover:text-gray-900">首页</BreadcrumbLink>
                    </BreadcrumbItem>
                    
                    {courseModule && (
                      <>
                        <BreadcrumbSeparator className="text-gray-400" />
                        <BreadcrumbItem>
                          <BreadcrumbLink href={`/modules/${courseModule.id}`} className="text-sm text-gray-600 hover:text-gray-900">
                            {courseModule.title}
                          </BreadcrumbLink>
                        </BreadcrumbItem>
                      </>
                    )}
                    
                    {courseId && !loading && (
                      <>
                        <BreadcrumbSeparator className="text-gray-400" />
                        <BreadcrumbItem>
                          <BreadcrumbPage className="text-sm font-medium text-gray-900">课程详情</BreadcrumbPage>
                        </BreadcrumbItem>
                      </>
                    )}
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
