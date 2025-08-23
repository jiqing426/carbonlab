"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Circle, ChevronRight, Eye, BookOpen } from "lucide-react";
import { getCourseUnitsAndLessons } from "@/lib/courses";
import { FeatureLink } from "@/components/ui/feature-link";

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
                      {unit.lessons.length} 节
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
                <ul className="space-y-2">
                  {unit.lessons.map((lesson: any, lessonIndex: number) => {
                    const isSubSection = lesson.title.includes('.');
                    const isMainSection = lesson.title.match(/^\d+\.\d+ /);
                    
                    // 为第5章创建特殊的链接
                    const lessonHref = isChapter5 
                      ? `/courses/${courseId}/chapter-5`
                      : `/courses/${courseId}/lessons/${lesson.id}`;
                    
                    // 判断课时是否可用（只有第5章可用）
                    const isLessonAvailable = isChapter5;
                    
                    return (
                      <li key={lessonIndex}>
                        {isLessonAvailable ? (
                          // 已开放的课时使用普通Link
                          <Link
                            href={lessonHref}
                            className={`flex items-center justify-between p-3 rounded transition-colors ${
                              isSampleChapter 
                                ? 'hover:bg-green-100 border-l-4 border-green-300' 
                                : 'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center flex-grow">
                              <Circle className={`mr-3 flex-shrink-0 ${
                                isSampleChapter ? 'text-green-500' : 'text-gray-300'
                              }`} />
                              <div className="flex-grow">
                                <span className={`block text-left ${
                                  isMainSection 
                                    ? 'font-semibold text-green-800' 
                                    : isSubSection 
                                      ? 'font-medium text-green-600 ml-4' 
                                      : 'text-gray-800'
                                }`}>
                                  {lesson.title}
                                </span>
                                <span className={`text-xs mt-1 block text-left ${
                                  isSampleChapter ? 'text-green-600' : 'text-gray-500'
                                }`}>
                                  {lesson.description}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              <ChevronRight className={`h-4 w-4 ${
                                isSampleChapter ? 'text-green-500' : 'text-gray-400'
                              }`} />
                            </div>
                          </Link>
                        ) : (
                          // 未开放的课时使用FeatureLink显示弹框
                          <FeatureLink
                            href={lessonHref}
                            isAvailable={false}
                            featureName={lesson.title}
                            className={`flex items-center justify-between p-3 rounded transition-colors cursor-pointer ${
                              'hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center flex-grow">
                              <Circle className="mr-3 flex-shrink-0 text-gray-300" />
                              <div className="flex-grow">
                                <span className="block text-gray-800 text-left">
                                  {lesson.title}
                                </span>
                                <span className="text-xs mt-1 block text-gray-500 text-left">
                                  {lesson.description}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center ml-4">
                              <ChevronRight className="h-4 w-4 text-gray-400" />
                            </div>
                          </FeatureLink>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}
