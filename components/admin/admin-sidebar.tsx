"use client"

import * as React from "react"
import {
  BookOpen,
  Bot,
  Command,
  Frame,
  LifeBuoy,
  Map,
  PieChart,
  Send,
  Settings2,
  SquareTerminal,
  Users,
  FlaskConical,
  GraduationCap,
  BarChart3,
  Shield,
  Database,
} from "lucide-react"

import { NavMain } from "@/components/admin/nav-main"
import { NavProjects } from "@/components/admin/nav-projects"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import { TeamSwitcher } from "@/components/admin/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// 这是管理后台的数据结构
const data = {
  user: {
    name: "管理员",
    email: "admin@carbonlab.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "碳实验室",
      logo: Command,
      plan: "管理后台",
    },
  ],
  navMain: [
    {
      title: "实验管理",
      url: "#",
      icon: FlaskConical,
      isActive: true,
      items: [
        {
          title: "实验列表",
          url: "/admin/experiments",
        },
        {
          title: "实验分类",
          url: "/admin/experiments/categories",
        },
      ],
    },
    {
      title: "课程管理",
      url: "#",
      icon: GraduationCap,
      items: [
        {
          title: "课程列表",
          url: "/admin/courses",
        },
        {
          title: "课程分类",
          url: "/admin/courses/categories",
        },
      ],
    },
    {
      title: "用户管理",
      url: "#",
      icon: Users,
      items: [
        {
          title: "用户列表",
          url: "/admin/users",
        },
        {
          title: "角色管理",
          url: "/admin/roles",
        },
        {
          title: "权限管理",
          url: "/admin/users/permissions",
        },
        {
          title: "用户统计",
          url: "/admin/users/analytics",
        },
      ],
    },
    {
      title: "数据分析",
      url: "#",
      icon: BarChart3,
      items: [
        {
          title: "使用统计",
          url: "/admin/analytics/usage",
        },
        {
          title: "实验报告",
          url: "/admin/analytics/experiments",
        },
        {
          title: "学习进度",
          url: "/admin/analytics/progress",
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: "系统设置",
      url: "/admin/settings",
      icon: Settings2,
    },
    {
      title: "数据备份",
      url: "/admin/backup",
      icon: Database,
    },
    {
      title: "安全中心",
      url: "/admin/security",
      icon: Shield,
    },
    {
      title: "帮助支持",
      url: "/admin/support",
      icon: LifeBuoy,
    },
  ],
  projects: [
    {
      name: "碳监测模块",
      url: "/admin/modules/carbon-monitor",
      icon: Frame,
    },
    {
      name: "碳核算模块",
      url: "/admin/modules/carbon-calculate",
      icon: PieChart,
    },
    {
      name: "碳交易模块",
      url: "/admin/modules/carbon-trading",
      icon: Map,
    },
    {
      name: "碳中和模块",
      url: "/admin/modules/carbon-neutral",
      icon: Bot,
    },
  ],
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavProjects projects={data.projects} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
} 