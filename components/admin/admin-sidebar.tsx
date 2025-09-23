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

// 管理员用户信息
const adminUser = {
  name: "管理员",
  email: "admin@example.com",
  avatar: "/avatars/admin.jpg",
}

export function AdminSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user } = useUserStore()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  // 使用useMemo来缓存计算结果，避免不必要的重新计算
  const navData = React.useMemo(() => {
    // 如果还没挂载，使用默认数据避免hydration错误
    if (!isMounted) {
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
      })),
    }))

    // 转换为NavSecondary组件需要的格式
    const navSecondaryItems = quickAccessGroup?.routes.map(route => ({
      title: route.title,
      url: route.href,
      icon: route.icon,
    })) || []

    return { navMainItems, navSecondaryItems }
  }, [user?.roles, isMounted])

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarContent>
        <NavMain items={navData.navMainItems} />
        <NavSecondary items={navData.navSecondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={adminUser} />
      </SidebarFooter>
    </Sidebar>
  )
} 