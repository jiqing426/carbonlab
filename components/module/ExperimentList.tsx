"use client"

import { Experiment, Difficulty } from "@/lib/database"
import Link from "next/link"
import { Play } from "lucide-react"
import { MonitorIcon, CalculateIcon, TradeIcon, NeutralIcon } from "@/components/module/ModuleIcons"
import { toast } from "sonner"
import { ExperimentLink } from "@/components/ui/feature-link"

interface ExperimentListProps {
  experiments: Experiment[]
  searchTerm?: string
  difficultyFilter?: Difficulty | "all"
  categoryFilter?: string | "all"
  title?: string
  onlyAvailable?: boolean
}

export default function ExperimentList({
  experiments,
  searchTerm = "",
  difficultyFilter = "all",
  categoryFilter = "all",
  title = "实验列表",
  onlyAvailable = false
}: ExperimentListProps) {
  // 处理实验点击
  const handleExperimentClick = (experiment: Experiment) => {
    if (experiment.status === "开发中") {
      toast.info(`"${experiment.title}"实验正在开发中，敬请期待！`, {
        position: "top-center",
        duration: 3000,
      })
    } else if (experiment.status === "维护中") {
      toast.warning(`"${experiment.title}"实验正在维护中，请稍后再试！`, {
        position: "top-center",
        duration: 3000,
      })
    }
  }

  // 过滤实验
  const filteredExperiments = experiments.filter((experiment: Experiment) => {
    const matchesSearch =
      experiment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      experiment.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesDifficulty = difficultyFilter === "all" || experiment.difficulty === difficultyFilter
    
    // 由于 category 不存在于 Experiment 类型中，我们只使用 all 过滤
    const matchesCategory = categoryFilter === "all"

    // 根据 onlyAvailable 参数决定是否只显示已上线的实验
    const matchesAvailability = onlyAvailable ? 
      (experiment.status !== "开发中" && experiment.status !== "维护中") : true

    return matchesSearch && matchesDifficulty && matchesCategory && matchesAvailability
  })

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperiments.map((experiment: Experiment) => {
          const isAvailable = experiment.status !== "开发中" && experiment.status !== "维护中";
          
          return (
            <div
              key={experiment.id}
              className="card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
            >
              <div className={`h-48 overflow-hidden ${getModuleBgClass(experiment.module)}`}>
                {experiment.image ? (
                  <img 
                    src={experiment.image} 
                    alt={experiment.title}
                    className="w-full h-full object-cover"
                  />
                ) : experiment.svg || 
                  (experiment.icon && <i className={`fas fa-${experiment.icon} text-6xl ${getModuleIconClass(experiment.module)}`}></i>)
                }
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
                {isAvailable ? (
                  <ExperimentLink
                    href={experiment.route || `/experiments/${experiment.id}`}
                    experimentName={experiment.title}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    {experiment.icon ? <i className="fas fa-play mr-2"></i> : <Play className="h-4 w-4 inline-block mr-2" />}
                    开始实验
                  </ExperimentLink>
                ) : (
                  <button
                    onClick={() => handleExperimentClick(experiment)}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    {experiment.icon ? <i className="fas fa-play mr-2"></i> : <Play className="h-4 w-4 inline-block mr-2" />}
                    开始实验
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
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

// 根据模块ID获取对应的颜色
function getModuleColor(moduleId: string): string {
  switch (moduleId) {
    case "carbon-monitor":
      return "emerald"
    case "carbon-calculate":
      return "blue"
    case "carbon-trading":
      return "purple"
    case "carbon-neutral":
      return "orange"
    default:
      return "indigo"
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