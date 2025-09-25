"use client"

import * as React from "react"
import { useUserStore } from "@/lib/stores/user-store"
import { getFilteredRouteGroups } from "@/lib/config/routes"
import { NavMain } from "@/components/admin/nav-main"
import { NavSecondary } from "@/components/admin/nav-secondary"
import { NavUser } from "@/components/admin/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar"

// 权限映射
const roleMapping: Record<string, string> = {
  admin: "管理员",
  teacher: "老师",
  student: "学生",
}

export function AdminSidebarContent({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserStore()

  // 使用useMemo来记忆化导航数据计算，避免hydration问题
  const navData = React.useMemo(() => {
    // 在服务器端渲染时返回空数据，避免hydration不匹配
    if (typeof window === 'undefined') {
      return {
        navMainItems: [],
        navSecondaryItems: []
      }
    }

    // 获取用户角色，如果没有角色则使用空数组
    const userRoles = user?.roles || []

    // 获取过滤后的路由组
    const filteredRouteGroups = getFilteredRouteGroups(userRoles)

    // 分离主导航和次要导航
    const mainNavGroups = filteredRouteGroups.filter(group =>
      group.id !== 'quick-access' && group.isDisplayedOnPage
    )
    const quickAccessGroup = filteredRouteGroups.find(group => group.id === 'quick-access')

    // 转换为NavMain组件需要的格式
    const navMainItems = mainNavGroups.map(group => ({
      title: group.title,
      url: group.routes[0]?.href || '#',
      icon: group.routes[0]?.icon,
      items: group.routes.map(route => ({
        title: route.title,
        url: route.href,
        icon: route.icon,
      })),
    }))

    // 转换为NavSecondary组件需要的格式
    const navSecondaryItems = quickAccessGroup?.routes.map(route => ({
      title: route.title,
      url: route.href,
      icon: route.icon,
    })) || []

    return { navMainItems, navSecondaryItems }
  }, [user?.roles])

  // 构建用户信息对象，避免hydration问题
  const currentUser = React.useMemo(() => {
    // 在服务器端渲染时返回默认数据
    if (typeof window === 'undefined' || !user) {
      return {
        name: "管理员",
        email: "admin@example.com",
        avatar: "/avatars/admin.jpg" as string | null,
        role: "管理员",
      }
    }

    // 获取用户的主要角色
    const primaryRole = user.roles?.[0] || 'admin'
    const roleName = roleMapping[primaryRole] || primaryRole

    return {
      name: user.username || "未知用户",
      email: user.email || "",
      avatar: user.avatar || null,
      role: roleName,
    }
  }, [user])

  return (
    <Sidebar variant="inset" className="w-48" {...props}>
      <SidebarContent className="py-4">
        <NavMain items={navData.navMainItems} />
        <NavSecondary items={navData.navSecondaryItems} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  )
}