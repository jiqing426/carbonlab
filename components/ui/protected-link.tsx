'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { toast } from 'sonner'
import { ReactNode } from 'react'

interface ProtectedLinkProps {
  href: string
  children: ReactNode
  className?: string
  onClick?: () => void
  requireAuth?: boolean
  redirectTo?: string
  message?: string
}

export function ProtectedLink({
  href,
  children,
  className = '',
  onClick,
  requireAuth = true,
  redirectTo = '/login',
  message = '请先登录后再访问此功能'
}: ProtectedLinkProps) {
  const router = useRouter()
  const { isLoggedIn } = useUserStore()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    // 如果不需要认证，直接跳转
    if (!requireAuth) {
      router.push(href)
      return
    }

    // 如果需要认证但未登录
    if (!isLoggedIn) {
      toast.error(message)
      router.push(redirectTo)
      return
    }

    // 已登录，执行自定义点击事件或直接跳转
    if (onClick) {
      onClick()
    } else {
      router.push(href)
    }
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

// 专门用于实验的登录拦截组件
export function ExperimentLink({
  href,
  children,
  className = '',
  experimentName = '实验'
}: {
  href: string
  children: ReactNode
  className?: string
  experimentName?: string
}) {
  const router = useRouter()
  const { isLoggedIn } = useUserStore()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      toast.error(`请先登录后再开始${experimentName}`)
      router.push('/login')
      return
    }

    // 已登录，跳转到实验页面
    router.push(href)
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}

// 专门用于课程的登录拦截组件
export function CourseLink({
  href,
  children,
  className = '',
  courseName = '课程'
}: {
  href: string
  children: ReactNode
  className?: string
  courseName?: string
}) {
  const router = useRouter()
  const { isLoggedIn } = useUserStore()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    
    if (!isLoggedIn) {
      toast.error(`请先登录后再学习${courseName}`)
      router.push('/login')
      return
    }

    // 已登录，跳转到课程页面
    router.push(href)
  }

  return (
    <a
      href={href}
      className={className}
      onClick={handleClick}
    >
      {children}
    </a>
  )
}


