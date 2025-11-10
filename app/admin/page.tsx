"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { experiments, modules } from "@/lib/database"
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
  AlertCircle,
  BarChart3,
  Home
} from "lucide-react"

export default function AdminPage() {
  const { user } = useUserStore()

  // 统计数据
  const stats = {
    experiments: experiments.length,
    courses: 0, // 临时设置为0，因为courses在database.ts中不存在
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
      title: "数据看板",
      icon: BarChart3,
      href: "/admin/dashboard",
      description: "实时掌握平台运行状况和教学数据分析"
    },
    {
      title: "用户管理",
      icon: Users,
      href: "/admin/users",
      description: "管理用户账号和权限"
    },
    {
      title: "班级管理",
      icon: UserCheck,
      href: "/admin/classes",
      description: "管理班级信息"
    },
    {
      title: "课程管理",
      icon: BookOpen,
      href: "/admin/courses",
      description: "管理课程内容和实验项目"
    },
    {
      title: "资料库管理",
      icon: FileText,
      href: "/admin/libraries",
      description: "管理教学资料和学习材料"
    },
    {
      title: "返回首页",
      icon: Home,
      href: "/",
      description: "返回前台页面"
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
            管理中心 - 快捷操作入口
          </p>
        </div>

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
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action) => (
                <Card key={action.title} className="cursor-pointer hover:shadow-md transition-shadow group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <action.icon className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{action.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <Button size="sm" className="w-full" asChild>
                      <a href={action.href}>
                        进入管理
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
  )
}