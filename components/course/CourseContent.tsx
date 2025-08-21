"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Circle, ChevronRight, Eye, BookOpen } from "lucide-react";
import { getCourseUnitsAndLessons } from "@/lib/courses";

interface CourseContentProps {
  courseId: string;
}

export function CourseContent({ courseId }: CourseContentProps) {
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCourseDetails() {
      setLoading(true);
      const { units } = await getCourseUnitsAndLessons(courseId);
      setUnits(units);
      setLoading(false);
    }
    fetchCourseDetails();
  }, [courseId]);

  if (loading) {
    return (
      <div className="bg-background p-4 rounded-lg">
        <div className="flex justify-center py-12">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-muted-foreground">加载课程内容中...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background p-4 rounded-lg">
      {/* 课程大纲标题 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">课程大纲</h2>
        <p className="text-gray-600">系统学习碳核算与碳管理的核心知识体系</p>
      </div>

      <Accordion type="single" collapsible className="w-full" defaultValue="item-4">
        {units.map((unit, unitIndex) => {
          const isChapter5 = unit.title === "碳足迹计量";
          const isSampleChapter = isChapter5;
          
          return (
            <AccordionItem 
              value={`item-${unitIndex}`} 
              key={unitIndex}
              className={isSampleChapter ? "border-2 border-green-200 rounded-lg mb-4" : ""}
            >
              <AccordionTrigger className={isSampleChapter ? "hover:bg-green-50 px-4" : ""}>
                <div className="flex justify-between w-full items-center">
                  <div className="flex items-center">
                    {isSampleChapter && (
                      <div className="mr-3 flex items-center">
                        <Eye className="h-5 w-5 text-green-600 mr-1" />
                        <span className="text-green-600 font-semibold text-sm">样章预览</span>
                      </div>
                    )}
                    <span className={`${isSampleChapter ? 'text-green-800 font-bold' : 'text-gray-800'} text-lg`}>
                      {unit.title}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-sm mr-2 ${isSampleChapter ? 'text-green-600' : 'text-gray-500'}`}>
                      {unit.lessons.length} 课时
                    </span>
                    {isSampleChapter && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        样章内容
                      </span>
                    )}
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className={isSampleChapter ? "bg-green-50" : ""}>
                {isChapter5 && (
                  <div className="mb-4 p-4 bg-white rounded-lg border border-green-200">
                    <div className="flex items-center mb-3">
                      <BookOpen className="h-5 w-5 text-green-600 mr-2" />
                      <h4 className="font-semibold text-green-800">第5章 碳足迹计量 - 样章预览</h4>
                    </div>
                    <p className="text-green-700 text-sm mb-3">
                      本章是教材的样章内容，完整展示了碳足迹计量的标准、方法和实践应用。
                      其他章节正在编写中，敬请期待。
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-green-600">
                      <div>• 碳足迹计量标准体系</div>
                      <div>• 生命周期评价方法</div>
                      <div>• 碳足迹计算与数据质量</div>
                      <div>• 实践案例与工具应用</div>
                    </div>
                  </div>
                )}
                <ul className="space-y-2">
                  {unit.lessons.map((lesson: any, lessonIndex: number) => {
                    const isSubSection = lesson.title.includes('.');
                    const isMainSection = lesson.title.match(/^\d+\.\d+ /);
                    
                    return (
                      <li key={lessonIndex}>
                        <Link
                          href={`/courses/${courseId}/lessons/${lesson.id}`}
                          className={`flex items-center p-3 rounded transition-colors ${
                            isSampleChapter 
                              ? 'hover:bg-green-100 border-l-4 border-green-300' 
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          <Circle className={`mr-3 flex-shrink-0 ${
                            isSampleChapter ? 'text-green-500' : 'text-gray-300'
                          }`} />
                          <div className="flex-grow">
                            <span className={`block ${
                              isMainSection 
                                ? 'font-semibold text-green-800' 
                                : isSubSection 
                                  ? 'font-medium text-green-600 ml-4' 
                                  : 'text-gray-800'
                            }`}>
                              {lesson.title}
                            </span>
                            <span className={`text-xs mt-1 block ${
                              isSampleChapter ? 'text-green-600' : 'text-gray-500'
                            }`}>
                              {lesson.description}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs ${
                              isSampleChapter ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {lesson.duration}分钟
                            </span>
                            <ChevronRight className={`h-4 w-4 ${
                              isSampleChapter ? 'text-green-500' : 'text-gray-400'
                            }`} />
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>

      {/* 课程说明 */}
      <div className="mt-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        <h3 className="text-lg font-semibold text-green-800 mb-3 flex items-center">
          <BookOpen className="h-5 w-5 mr-2" />
          课程说明
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-green-700">
          <div>
            <h4 className="font-medium mb-2">📖 教材编写进度</h4>
            <p>目前第5章"碳足迹计量"已完成编写，作为样章供大家预览学习。其他章节正在编写中。</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">🎯 样章内容</h4>
            <p>第5章完整展示了碳足迹计量的标准、LCA方法和数据质量控制等核心内容。</p>
          </div>
        </div>
      </div>
    </div>
  );
}
