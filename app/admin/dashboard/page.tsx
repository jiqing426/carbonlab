"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { experiments, courses, modules } from "@/lib/database"
import {
  Users,
  FlaskConical,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  UserCheck,
  BeakerIcon,
  Activity,
  Users2,
  Target,
  Calendar
} from "lucide-react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"

// 颜色配置
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

// API fetcher function
const fetcher = (url: string) => fetch(url).then(res => res.json())

export default function DataDashboardPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d")
  const [selectedClass, setSelectedClass] = useState("all")

  // 构建 API URL
  const apiUrl = `/api/admin/dashboard?timeRange=${selectedTimeRange}&classId=${selectedClass}`

  // 使用 SWR 获取数据
  const { data: dashboardData, error, isLoading } = useSWR(apiUrl, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    refreshInterval: 300000 // 5分钟刷新一次
  })

  if (error) {
    console.error('Dashboard data error:', error)
  }

  // 获取核心统计数据
  const stats = dashboardData?.coreStats || {
    totalUsers: 0,
    totalCourses: 0,
    totalExperiments: 0,
    activeUsers: 0,
    weeklyGrowth: { users: 0, courses: 0, activeUsers: 0 }
  }

  // 获取各类数据
  const courseCompletionData = dashboardData?.courseCompletion || []
  const experimentCompletionData = dashboardData?.experimentCompletion || []
  const courseDistributionData = dashboardData?.courseDistribution || []
  const experimentDistributionData = dashboardData?.experimentDistribution || []
  const classCompletionData = dashboardData?.classCompletion || []
  const activityTrendData = dashboardData?.activityTrend || []
  const completionRateData = dashboardData?.completionRate || []

  // 显示加载状态
  if (isLoading) {
    return (
      <div className="space-y-8 p-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
          <p className="text-lg text-muted-foreground">正在加载数据...</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-16 mb-2"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // 显示错误状态
  if (error) {
    return (
      <div className="space-y-8 p-5">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
          <p className="text-lg text-muted-foreground text-red-600">
            加载数据失败，请稍后重试
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              无法获取数据，请检查网络连接或联系管理员
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8 p-5">
      {/* 页面标题和筛选器 */}
      <div className="flex justify-between items-center space-y-2">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">数据看板</h1>
          <p className="text-lg text-muted-foreground">
            实时掌握平台运行状况和教学数据分析
          </p>
        </div>
        <div className="flex space-x-4">
          <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近3个月</SelectItem>
              <SelectItem value="all">全部</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">所有班级</SelectItem>
              <SelectItem value="class1">碳管理21班</SelectItem>
              <SelectItem value="class2">环境工程19班</SelectItem>
              <SelectItem value="class3">新能源技术20班</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总用户数</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              注册用户总数
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>较上周增长 {stats.weeklyGrowth.users}%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">课程总数</CardTitle>
            <GraduationCap className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              已发布的课程内容
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>较上周增长 {stats.weeklyGrowth.courses}门</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">实验项目数</CardTitle>
            <FlaskConical className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalExperiments}</div>
            <p className="text-xs text-muted-foreground">
              已发布的实验项目
            </p>
            <div className="flex items-center mt-2 text-xs text-gray-600">
              <Clock className="h-3 w-3 mr-1" />
              <span>与上周持平</span>
            </div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户数</CardTitle>
            <UserCheck className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              近7天内活跃用户
            </p>
            <div className="flex items-center mt-2 text-xs text-green-600">
              <TrendingUp className="h-3 w-3 mr-1" />
              <span>较上周增长 {stats.weeklyGrowth.activeUsers}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 数据分析图表 */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 课程完成情况 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              课程完成情况
            </CardTitle>
            <CardDescription>
              各课程的完成百分比和参与人数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'completion' ? '完成率 (%)' : '参与人数']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="completion" fill="#00C49F" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 实验完成情况 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BeakerIcon className="h-5 w-5" />
              实验完成情况
            </CardTitle>
            <CardDescription>
              各实验的完成百分比和参与人数
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experimentCompletionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name) => [value, name === 'completion' ? '完成率 (%)' : '参与人数']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="completion" fill="#8884D8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 课程人数分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users2 className="h-5 w-5" />
              课程人数分布
            </CardTitle>
            <CardDescription>
              各课程的学生参与人数统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={courseDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value, '参与人数']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="count" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 实验人数分布 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              实验人数分布
            </CardTitle>
            <CardDescription>
              各实验的学生参与人数统计
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={experimentDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [value, '参与人数']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                  <Bar dataKey="count" fill="#FF8042" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* 班级完成率排行 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              班级完成率排行
            </CardTitle>
            <CardDescription>
              以班级为维度的课程/实验整体完成率
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {classCompletionData.map((classData, index) => (
                <div key={classData.name} className="flex items-center justify-between p-3 rounded-lg border">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{classData.name}</p>
                      <p className="text-sm text-muted-foreground">
                        课程 {classData.courses}% | 实验 {classData.experiments}%
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-green-600">{classData.completion}%</p>
                    <p className="text-xs text-muted-foreground">总体完成率</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 活跃度趋势 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              活跃度趋势
            </CardTitle>
            <CardDescription>
              最近7天的用户活跃度和完成情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="activeUsers"
                    stackId="1"
                    stroke="#0088FE"
                    fill="#0088FE"
                    name="活跃用户"
                  />
                  <Area
                    type="monotone"
                    dataKey="courseCompletions"
                    stackId="2"
                    stroke="#00C49F"
                    fill="#00C49F"
                    name="课程完成"
                  />
                  <Area
                    type="monotone"
                    dataKey="experimentCompletions"
                    stackId="3"
                    stroke="#FFBB28"
                    fill="#FFBB28"
                    name="实验完成"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 整体完成率饼图 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              整体完成率分布
            </CardTitle>
            <CardDescription>
              用户学习任务完成状态分布
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80 flex flex-col items-center">
              <ResponsiveContainer width="100%" height="70%">
                <RePieChart>
                  <Pie
                    data={completionRateData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {completionRateData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value}%`, '占比']}
                    contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid #ccc' }}
                  />
                </RePieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap justify-center gap-3 mt-4">
                {completionRateData.map((item) => (
                  <div key={item.name} className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <span className="text-sm whitespace-nowrap">{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}