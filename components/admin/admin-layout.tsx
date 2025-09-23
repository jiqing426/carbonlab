"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import { SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarHeader, SidebarFooter } from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb } from "@/components/breadcrumb"
import {
  LayoutDashboard,
  Users,
  ChevronRight,
  User,
  LogOut
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useUserStore } from "@/lib/stores/user-store"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getFilteredRouteGroups } from "@/lib/config/routes"

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    toast.success("已退出登录")
    router.push("/")
  }

  // 检查当前路径是否匹配
  const isActive = (url: string) => {
    if (url === "/admin") {
      return pathname === "/admin"
    }
    return pathname.startsWith(url)
  }

  // 根据用户角色获取可访问的路由
  const userRoles = user?.roles || []
  const filteredRouteGroups = getFilteredRouteGroups(userRoles)

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border">
            <div className="flex items-center gap-2 px-2 py-2">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground">
                <LayoutDashboard className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">管理中心</h1>
                <p className="text-xs text-sidebar-foreground/60">碳经济管理平台</p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            {filteredRouteGroups.map((group) => (
              <SidebarGroup key={group.id}>
                <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.routes.map((route) => (
                      <SidebarMenuItem key={route.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive(route.href)}
                          tooltip={route.title}
                        >
                          <a href={route.href} className="flex items-center gap-3">
                            <route.icon className="h-4 w-4" />
                            <span>{route.title}</span>
                            {isActive(route.href) && (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar} alt={user?.username} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {user?.username || "管理员"}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {user?.roles?.[0] || "管理员"}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />
            <Breadcrumb />
          </header>

          <main className="flex-1 overflow-auto">
            <div className="w-full max-w-7xl mx-auto p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}