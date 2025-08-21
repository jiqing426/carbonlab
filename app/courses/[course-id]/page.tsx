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
    <div className="container mx-auto px-4 py-2 md:py-8">
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">加载课程中...</p>
          </div>
        </div>
      ) : course ? (
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="md:w-1/3">
            <div className="relative h-[300px] overflow-hidden rounded-lg shadow-lg">
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
            </div>
          </div>
          <div className="md:w-2/3">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {course.category}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                {course.difficulty}
              </span>
              {course.status && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {course.status}
                </span>
              )}
            </div>
            <h1 className="text-3xl font-bold mb-4">{course.title}</h1>
            <p className="text-secondary-foreground mb-4">{course.description}</p>
            <div className="flex items-center mb-6">
              <span className="text-yellow-500 mr-2">★</span>
              <span className="font-bold mr-2">{course.average_rating}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10">课程不存在或加载失败</div>
      )}

      {course && (
        <div className="mb-8">
          {/* 课程特色介绍 */}
          {course.id === "carbon-accounting-management" && (
            <div className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-eye text-white text-xl"></i>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-green-800 mb-2">样章说明</h3>
                  <p className="text-green-700 mb-4">
                    本课程正在编写中，目前第5章"碳足迹计量"已完成，作为样章供大家预览学习。
                    其他章节正在编写中，敬请期待完整版教材的发布。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 text-sm mb-1">📊 碳核算标准</h4>
                      <p className="text-green-600 text-xs">掌握国际国内主要碳核算标准</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 text-sm mb-1">🌱 样章内容</h4>
                      <p className="text-green-600 text-xs">第5章碳足迹计量完整内容</p>
                    </div>
                    <div className="bg-white p-3 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-green-800 text-sm mb-1">🔬 LCA方法</h4>
                      <p className="text-green-600 text-xs">生命周期评价方法应用</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <CourseContent courseId={courseId} />
        </div>
      )}
    </div>
  );
}