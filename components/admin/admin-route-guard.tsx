'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { toast } from 'sonner'

interface AdminRouteGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  redirectTo?: string
}

export function AdminRouteGuard({
  children,
  requiredRoles = ['admin', 'manager', 'teacher'],
  redirectTo = '/login'
}: AdminRouteGuardProps) {
  const router = useRouter()
  const { isLoggedIn, user, isTokenExpired, initialize } = useUserStore()
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    // 初始化用户状态
    initialize()
    setIsInitialized(true)
  }, [initialize])

  useEffect(() => {
    if (!isInitialized) return

    // 检查是否已登录
    if (!isLoggedIn) {
      toast.error('请先登录后再访问管理后台')
      router.push(redirectTo)
      return
    }

    // 检查token是否过期
    if (isTokenExpired()) {
      toast.error('登录已过期，请重新登录')
      router.push(redirectTo)
      return
    }

    // 检查用户是否有合适的角色
    if (user && user.roles) {
      const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role))
      if (!hasRequiredRole) {
        toast.error('您没有访问管理后台的权限')
        router.push('/')
        return
      }
    } else {
      // 如果没有角色信息，也跳转到登录页面
      toast.error('用户信息不完整，请重新登录')
      router.push(redirectTo)
      return
    }
  }, [isLoggedIn, user, isTokenExpired, requiredRoles, redirectTo, router, isInitialized])

  // 如果还没有初始化，显示加载状态
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在初始化...</p>
        </div>
      </div>
    )
  }

  // 如果未登录或验证失败，不渲染子组件
  if (!isLoggedIn || isTokenExpired()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">正在验证登录状态...</p>
        </div>
      </div>
    )
  }

  // 检查用户角色
  if (user && user.roles) {
    const hasRequiredRole = requiredRoles.some(role => user.roles?.includes(role))
    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive mb-4">权限不足</h1>
            <p className="text-muted-foreground mb-4">您没有访问管理后台的权限</p>
            <button
              type="button"
              onClick={() => router.push('/')}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              返回首页
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}