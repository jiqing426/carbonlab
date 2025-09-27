import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { History, Calendar, Award, Download, Eye } from "lucide-react"
import { fetchCarbonTradingTasks, HistoryTask } from "@/lib/api/tasks"

interface ExperimentHistoryProps {
  taskId?: string
}

export function ExperimentHistory({ taskId }: ExperimentHistoryProps) {
  const [tasks, setTasks] = useState<HistoryTask[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetchCarbonTradingTasks()
        // 在客户端过滤碳交易模拟实验任务
        const allTasks = (response.content as any) as HistoryTask[]
        const carbonTasks = allTasks.filter(task => task.task_type === "carbon-trading-simulation")
        setTasks(carbonTasks)
      } catch (err) {
        console.error("获取实验记录失败:", err)
        setError(err instanceof Error ? err.message : "获取实验记录失败")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getESGRating = (rating: string) => {
    const ratingMap: Record<string, { color: string; bg: string }> = {
      "AAA": { color: "text-green-600", bg: "bg-green-100" },
      "AA": { color: "text-green-500", bg: "bg-green-50" },
      "A": { color: "text-blue-600", bg: "bg-blue-100" },
      "BBB": { color: "text-yellow-600", bg: "bg-yellow-100" },
      "BB": { color: "text-orange-600", bg: "bg-orange-100" },
      "B": { color: "text-red-600", bg: "bg-red-100" }
    }
    return ratingMap[rating] || { color: "text-gray-600", bg: "bg-gray-100" }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const downloadTaskData = (task: HistoryTask) => {
    const dataStr = JSON.stringify(task, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `碳交易模拟实验-${task.created_at.split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-1/2" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-16" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">获取实验记录失败</h3>
          <p className="text-gray-500 text-center">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <History className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无实验记录</h3>
          <p className="text-gray-500 text-center">完成碳交易模拟实验后，您的实验记录将显示在这里</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const taskOutput = task.task_output as any
        const esgScores = taskOutput?.esgScores || {}
        const overallRating = taskOutput?.overallRating || {}
        const rating = getESGRating(overallRating.rating || "B")

        return (
          <Card key={task.task_id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{task.task_title}</CardTitle>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {formatDate(task.created_at)}
                    </div>
                    <Badge variant="secondary">{task.task_status}</Badge>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      // 保存数据到localStorage
                      localStorage.setItem('carbonTradingSimulationData', JSON.stringify(task.task_output));
                      // 跳转到碳交易模拟页面
                      window.location.href = '/experiments/carbon-trading-simulation';
                    }}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    查看详情
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => downloadTaskData(task)}
                  >
                    <Download className="h-4 w-4 mr-1" />
                    下载数据
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* ESG评分概览 */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${rating.bg} mb-2`}>
                    <span className={`text-xl font-bold ${rating.color}`}>
                      {overallRating.rating || "B"}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">ESG评级</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {esgScores.environment || 0}
                  </div>
                  <div className="text-sm text-gray-500">环境 (E)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {esgScores.social || 0}
                  </div>
                  <div className="text-sm text-gray-500">社会 (S)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {esgScores.governance || 0}
                  </div>
                  <div className="text-sm text-gray-500">治理 (G)</div>
                </div>
              </div>

              {/* 关键指标 */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">总利润</div>
                  <div className="font-medium">
                    {taskOutput?.keyStatistics?.totalProfit?.toLocaleString() || 0} 元
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">技改投资</div>
                  <div className="font-medium">
                    {taskOutput?.keyStatistics?.totalUpgradeInvestment?.toLocaleString() || 0} 元
                  </div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-gray-500">最终现金</div>
                  <div className="font-medium">
                    {taskOutput?.socialGovernanceMetrics?.finalCash?.toLocaleString() || 0} 元
                  </div>
                </div>
              </div>

              {/* 主要成就 */}
              {taskOutput?.summary?.mainAchievements && (
                <div className="mt-4">
                  <div className="text-sm font-medium text-gray-700 mb-2">主要成就：</div>
                  <div className="text-sm text-gray-600 space-y-1">
                    {taskOutput.summary.mainAchievements.slice(0, 3).map((achievement: string, index: number) => (
                      <div key={index} className="flex items-start">
                        <Award className="h-3 w-3 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        {achievement}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

export default ExperimentHistory