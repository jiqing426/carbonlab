"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { CourseCard } from "@/components/course/CourseCard";
import { Filter } from 'lucide-react';
// @ts-ignore
import debounce from 'lodash/debounce';
import { getCoursesForComponent, Course } from "@/lib/api/courses";
import { modules, experiments, Experiment } from "@/lib/database";
import ExperimentList from "@/components/module/ExperimentList";
import { ExperimentLink } from "@/components/ui/feature-link";

// 定义课程类型映射
const difficultyMap: Record<string, string> = {
  "beginner": "基础",
  "intermediate": "中级",
  "advanced": "高级"
};

export default function ResourcesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [filteredExperiments, setFilteredExperiments] = useState<Experiment[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([]);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 500),
    []
  );

  useEffect(() => {
    async function fetchCourses() {
      try {
        setLoading(true);
        const coursesData = await getCoursesForComponent();
        const enabledCourses = coursesData.filter(course => course.isEnabled);
        setCourses(enabledCourses);
        setFilteredCourses(enabledCourses);
        setFilteredExperiments(experiments);
      } catch (error) {
        console.error('Failed to fetch courses:', error);
        setCourses([]);
        setFilteredCourses([]);
        setFilteredExperiments(experiments);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  useEffect(() => {
    const filtered = courses.filter(course => 
      course.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      // 注意：API返回的课程数据没有module和difficulty字段，所以暂时移除这些过滤条件
      // 如果需要这些过滤功能，需要在API中添加相应字段
    );
    setFilteredCourses(filtered);

    const filteredExps = experiments.filter(exp => 
      exp.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) &&
      (selectedModules.length === 0 || selectedModules.includes(exp.module)) &&
      (selectedDifficulties.length === 0 || (
        // 将中文难度转换为英文，以匹配筛选条件
        (exp.difficulty === "基础" && selectedDifficulties.includes("beginner")) ||
        (exp.difficulty === "中级" && selectedDifficulties.includes("intermediate")) ||
        (exp.difficulty === "高级" && selectedDifficulties.includes("advanced"))
      ))
    );
    setFilteredExperiments(filteredExps);
  }, [debouncedSearchTerm, selectedModules, selectedDifficulties, courses]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleModuleToggle = (moduleId: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleId)
        ? prev.filter(m => m !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleDifficultyToggle = (difficulty: string) => {
    setSelectedDifficulties(prev => 
      prev.includes(difficulty)
        ? prev.filter(d => d !== difficulty)
        : [...prev, difficulty]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">资源中心</h1>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <Input 
          className="max-w-sm" 
          placeholder="搜索资源..." 
          value={searchTerm}
          onChange={handleSearch}
        />
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">模块</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>模块筛选</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {modules.map((module) => (
                <DropdownMenuCheckboxItem
                  key={module.id}
                  checked={selectedModules.includes(module.id)}
                  onCheckedChange={() => handleModuleToggle(module.id)}
                >
                  {module.title}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">难度</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>难度级别</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {(['beginner', 'intermediate', 'advanced'] as const).map((difficulty) => (
                <DropdownMenuCheckboxItem
                  key={difficulty}
                  checked={selectedDifficulties.includes(difficulty)}
                  onCheckedChange={() => handleDifficultyToggle(difficulty)}
                >
                  {difficultyMap[difficulty]}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 课程部分 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">在线课程</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">加载课程中...</p>
              </div>
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="col-span-full text-center py-10 text-muted-foreground">
              未找到匹配的课程
            </div>
          ) : (
            filteredCourses.map((course) => (
              <CourseCard 
                key={course.id} 
                course={{
                  id: course.id,
                  title: course.title,
                  description: course.description,
                  difficulty: "中级", // 默认难度，因为API数据中没有difficulty字段
                  status: course.isEnabled ? "已上线" : "开发中",
                  icon: "book", // 默认图标
                  module: "carbon-monitor", // 默认模块，因为API数据中没有module字段
                  image: course.coverUrl || undefined,
                }}
              />
            ))
          )}
        </div>
      </section>

      {/* 实验部分 */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">交互式实验</h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="text-center">
              <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-muted-foreground">加载实验中...</p>
            </div>
          </div>
        ) : filteredExperiments.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground">
            未找到匹配的实验
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperiments.map((experiment) => (
              <div
                key={experiment.id}
                className="card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
              >
                <div className="h-48 overflow-hidden relative">
                  {experiment.image ? (
                    <img 
                      src={experiment.image.startsWith('/') ? experiment.image : `/${experiment.image}`}
                      alt={experiment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`h-full ${getModuleBgClass(experiment.module)} flex items-center justify-center`}>
                      {experiment.icon && <i className={`fas fa-${experiment.icon} text-6xl ${getModuleIconClass(experiment.module)}`}></i>}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{experiment.title}</h3>
                    <div className="flex items-center gap-2">
                      {experiment.status && (experiment.status === "开发中" || experiment.status === "维护中") && (
                        <span className={`text-xs font-medium ${getStatusColor(experiment.status)} px-2 py-1 rounded`}>
                          {experiment.status}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${getDifficultyColor(experiment.difficulty)} px-2 py-1 rounded`}>
                        {experiment.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{experiment.description}</p>
                  <ExperimentLink
                    href={experiment.route || `/experiments/${experiment.id}`}
                    experimentName={experiment.title}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    <i className="fas fa-play mr-2"></i>
                    开始实验
                  </ExperimentLink>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// 根据状态获取对应的颜色类名
function getStatusColor(status: string): string {
  switch (status) {
    case "开发中":
      return "bg-amber-100 text-amber-800"
    case "维护中":
      return "bg-orange-100 text-orange-800"
    default:
      return "bg-green-100 text-green-800"
  }
}

// 根据模块ID获取对应的背景颜色类名
function getModuleBgClass(moduleId: string): string {
  switch (moduleId) {
    case "carbon-monitor":
      return "bg-emerald-50"
    case "carbon-calculate":
      return "bg-blue-50"
    case "carbon-trading":
      return "bg-purple-50"
    case "carbon-neutral":
      return "bg-orange-50"
    default:
      return "bg-indigo-50"
  }
}

// 根据模块ID获取对应的图标颜色类名
function getModuleIconClass(moduleId: string): string {
  switch (moduleId) {
    case "carbon-monitor":
      return "text-emerald-600"
    case "carbon-calculate":
      return "text-blue-600"
    case "carbon-trading":
      return "text-purple-600"
    case "carbon-neutral":
      return "text-orange-600"
    default:
      return "text-indigo-600"
  }
}

// 根据模块ID获取对应的按钮背景颜色类名
function getModuleButtonClass(moduleId: string): string {
  switch (moduleId) {
    case "carbon-monitor":
      return "bg-emerald-600 hover:bg-emerald-700"
    case "carbon-calculate":
      return "bg-blue-600 hover:bg-blue-700"
    case "carbon-trading":
      return "bg-purple-600 hover:bg-purple-700"
    case "carbon-neutral":
      return "bg-orange-600 hover:bg-orange-700"
    default:
      return "bg-indigo-600 hover:bg-indigo-700"
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case "基础":
      return "bg-green-100 text-green-800"
    case "中级":
      return "bg-indigo-100 text-indigo-800"
    case "高级":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}