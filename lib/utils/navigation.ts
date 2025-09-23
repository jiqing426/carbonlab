'use client'

import { useRouter, usePathname } from 'next/navigation'

/**
 * 导航工具函数
 */
export function useNavigation() {
  const router = useRouter()
  const pathname = usePathname()

  /**
   * 导航到指定页面
   */
  const navigateTo = (path: string) => {
    router.push(path)
  }

  /**
   * 返回上一页
   */
  const goBack = () => {
    router.back()
  }

  /**
   * 刷新当前页面
   */
  const refresh = () => {
    router.refresh()
  }

  /**
   * 检查当前路径是否匹配指定路径
   */
  const isCurrentPath = (path: string) => {
    if (path === '/') {
      return pathname === path
    }
    return pathname.startsWith(path)
  }

  /**
   * 导航到登录页面
   */
  const goToLogin = (redirectUrl?: string) => {
    const loginUrl = redirectUrl
      ? `/login?redirect=${encodeURIComponent(redirectUrl)}`
      : '/login'
    router.push(loginUrl)
  }

  /**
   * 导航到管理后台
   */
  const goToAdmin = () => {
    router.push('/admin')
  }

  /**
   * 导航到前台首页
   */
  const goToHome = () => {
    router.push('/')
  }

  return {
    navigateTo,
    goBack,
    refresh,
    isCurrentPath,
    goToLogin,
    goToAdmin,
    goToHome,
    pathname,
  }
}

/**
 * 重新导出Next.js的导航hook
 */
export { useRouter, usePathname } from 'next/navigation'