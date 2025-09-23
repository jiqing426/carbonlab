'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { hasRouteAccess } from '@/lib/config/routes'
import { toast } from 'sonner'

interface RouteGuardProps {
  children: React.ReactNode
  requiredRoles?: string[]
  redirectTo?: string
}

export function RouteGuard({
  children,
  requiredRoles = [],
  redirectTo = '/login'
}: RouteGuardProps) {
  const router = useRouter()
  const { isLoggedIn, user } = useUserStore()

  useEffect(() => {
    // 如果未登录，跳转到登录页
    if (!isLoggedIn) {
      router.push(redirectTo)
      return
    }

    // 如果需要特定角色，检查用户是否有相应角色
    if (requiredRoles.length > 0) {
      const userRoles = user?.roles || []
      const hasRequiredRole = requiredRoles.some(role =>
        userRoles.includes(role)
      )

      if (!hasRequiredRole) {
        toast.error('您没有权限访问此页面')
        router.push('/admin')
        return
      }
    }

    // 检查当前路由访问权限
    if (typeof window !== 'undefined') {
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/admin')) {
        const userRoles = user?.roles || []
        const hasAccess = hasRouteAccess(currentPath, userRoles)

        if (!hasAccess) {
          toast.error('您没有权限访问此页面')
          router.push('/admin')
          return
        }
      }
    }
  }, [isLoggedIn, user, requiredRoles, router, redirectTo])

  // 如果未登录，显示加载状态或null
  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // 检查角色权限
  if (requiredRoles.length > 0) {
    const userRoles = user?.roles || []
    const hasRequiredRole = requiredRoles.some(role =>
      userRoles.includes(role)
    )

    if (!hasRequiredRole) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
            <p className="text-gray-600">您没有权限访问此页面</p>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}

// 管理员路由守卫
export function AdminRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRoles={['admin']}>
      {children}
    </RouteGuard>
  )
}

// 管理员或经理路由守卫
export function AdminOrManagerRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRoles={['admin', 'manager']}>
      {children}
    </RouteGuard>
  )
}

// 教师路由守卫
export function TeacherRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard requiredRoles={['teacher']}>
      {children}
    </RouteGuard>
  )
}

// 任何已登录用户都能访问的路由守卫
export function AuthenticatedRouteGuard({ children }: { children: React.ReactNode }) {
  return (
    <RouteGuard>
      {children}
    </RouteGuard>
  )
}