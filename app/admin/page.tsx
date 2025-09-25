"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { experiments, courses, modules } from "@/lib/database"
import {
  getStudentProgressOverview,
  getExperimentCompletionStats,
  getRecentCompletions,
  students
} from "@/lib/student-data"
import { useUserStore } from "@/lib/stores/user-store"
import {
  Users,
  FlaskConical,
  GraduationCap,
  TrendingUp,
  Clock,
  Award,
  UserCheck,
  BookOpen,
  BeakerIcon,
  Plus,
  FileText,
  CheckCircle,
  AlertCircle
} from "lucide-react"

export default function AdminPage() {
  const { user } = useUserStore()

  // 统计数据
  const stats = {
    experiments: experiments.length,
    courses: courses.length,
    modules: modules.length,
    users: students.length,
  }

  // 学生进度概览
  const progressOverview = getStudentProgressOverview()
  
  // 实验完成统计
  const experimentStats = getExperimentCompletionStats()
  
  // 最近完成的实验
  const recentCompletions = getRecentCompletions(5)

  const quickActions = [
    {
      title: "添加用户",
      icon: Users,
      href: "/admin/users",
      description: "创建新的用户账户"
    },
    {
      title: "创建课程",
      icon: BookOpen,
      href: "/admin/courses",
      description: "添加新的课程内容"
    },
    {
      title: "设计实验",
      icon: BeakerIcon,
      href: "/admin/experiments",
      description: "创建新的实验项目"
    },
    {
      title: "发布文章",
      icon: FileText,
      href: "/admin/content",
      description: "发布新的内容"
    }
  ]

  const recentActivities = [
    {
      id: 1,
      type: "user",
      action: "新用户注册",
      user: "张三",
      time: "2分钟前",
      status: "success"
    },
    {
      id: 2,
      type: "course",
      action: "课程更新",
      user: "李老师",
      time: "15分钟前",
      status: "success"
    },
    {
      id: 3,
      type: "experiment",
      action: "实验提交",
      user: "王同学",
      time: "1小时前",
      status: "pending"
    },
    {
      id: 4,
      type: "system",
      action: "系统维护",
      user: "系统",
      time: "2小时前",
      status: "warning"
    }
  ]

  return (
      <div className="space-y-8 p-5">
        {/* 欢迎区域 */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">
            欢迎回来，{user?.username || "管理员"}
          </h1>
          <p className="text-xl text-muted-foreground">
            管理中心概览 - 掌握平台运行状态
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">总用户数</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.users.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                注册用户总数
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-100 to-green-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">课程总数</CardTitle>
              <GraduationCap className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.courses}</div>
              <p className="text-xs text-muted-foreground">
                已发布的课程内容
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">实验项目</CardTitle>
              <FlaskConical className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.experiments}</div>
              <p className="text-xs text-muted-foreground">
                已发布的实验项目
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full -mr-16 -mt-16 opacity-50"></div>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
              <UserCheck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{progressOverview.activeStudents}</div>
              <p className="text-xs text-muted-foreground">
                近7天内活跃的用户
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* 快速操作 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                快速操作
              </CardTitle>
              <CardDescription>
                常用的管理功能入口
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {quickActions.map((action) => (
                  <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <action.icon className="h-5 w-5 text-primary" />
                        <CardTitle className="text-base">{action.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground mb-3">
                        {action.description}
                      </p>
                      <Button size="sm" className="w-full">
                        进入管理
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 最近活动 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近活动
              </CardTitle>
              <CardDescription>
                平台最新的动态信息
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg border">
                    <div className="flex-shrink-0">
                      {activity.status === "success" && (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      )}
                      {activity.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {activity.status === "warning" && (
                        <AlertCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.action}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.user} · {activity.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="flex-shrink-0">
                      {activity.type === "user" && "用户"}
                      {activity.type === "course" && "课程"}
                      {activity.type === "experiment" && "实验"}
                      {activity.type === "system" && "系统"}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 学生学习进度概览 */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                学生学习进度概览
              </CardTitle>
              <CardDescription>
                全体学生的平均学习完成情况
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>实验完成率</span>
                  <span>{progressOverview.avgExperimentCompletion}%</span>
                </div>
                <Progress value={progressOverview.avgExperimentCompletion} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>课程完成率</span>
                  <span>{progressOverview.avgCourseCompletion}%</span>
                </div>
                <Progress value={progressOverview.avgCourseCompletion} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{progressOverview.totalStudents}</div>
                  <div className="text-xs text-muted-foreground">总学生数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{progressOverview.activeStudents}</div>
                  <div className="text-xs text-muted-foreground">活跃学生</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                最近完成的实验
              </CardTitle>
              <CardDescription>
                学生最新的实验完成记录
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentCompletions.map((completion) => {
                  const experiment = experiments.find(e => e.id === completion.experimentId)
                  return (
                    <div key={completion.id} className="flex items-center justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {completion.studentName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          完成了 "{experiment?.title || "未知实验"}"
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant={completion.score >= 90 ? "default" : completion.score >= 80 ? "secondary" : "outline"}>
                          {completion.score}分
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(completion.completedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 实验完成情况统计 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              各实验完成情况统计
            </CardTitle>
            <CardDescription>
              每个实验的学生参与和完成情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from(experimentStats.entries()).map(([experimentId, stat]) => {
                const experiment = experiments.find(e => e.id === experimentId)
                const completionRate = Math.round((stat.completed / stat.total) * 100)

                return (
                  <div key={experimentId} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium text-sm leading-tight">
                        {experiment?.title || "未知实验"}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {experiment?.difficulty}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>完成率</span>
                        <span>{completionRate}%</span>
                      </div>
                      <Progress value={completionRate} className="h-2" />
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <div className="font-medium">{stat.completed}</div>
                        <div className="text-muted-foreground">已完成</div>
                      </div>
                      <div>
                        <div className="font-medium">{stat.total - stat.completed}</div>
                        <div className="text-muted-foreground">未完成</div>
                      </div>
                      <div>
                        <div className="font-medium">
                          {stat.completed > 0 ? Math.round(stat.avgScore) : 0}
                        </div>
                        <div className="text-muted-foreground">平均分</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>系统状态</CardTitle>
              <CardDescription>
                各模块运行状态监控
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {modules.map((module) => (
                  <div key={module.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">{module.title}</span>
                    </div>
                    <span className="text-sm text-green-600">正常</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>学生等级分布</CardTitle>
              <CardDescription>
                按学习水平划分的学生分布情况
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {["初级", "中级", "高级"].map((level) => {
                  const count = students.filter(s => s.level === level).length
                  const percentage = Math.round((count / students.length) * 100)

                  return (
                    <div key={level} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{level}学生</span>
                        <span>{count}人 ({percentage}%)</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  )
} 