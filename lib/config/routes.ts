import {
  LayoutDashboard,
  Users,
  Settings,
  Home,
  BarChart3,
  BookOpen,
  BeakerIcon,
  FileText,
  Library
} from 'lucide-react'

export type Route = {
  title: string
  description: string
  icon: any
  href: string
  isAccessible: boolean
  allowedRoles: string[]
}

export type RouteGroup = {
  id: string
  title: string
  allowedRoles: string[]
  routes: Route[]
  isDisplayedOnPage: boolean
}

export const routeGroups: RouteGroup[] = [
  {
    id: 'dashboard',
    title: '首页',
    allowedRoles: ['admin', 'manager', 'teacher'],
    isDisplayedOnPage: true,
    routes: [
      {
        title: '首页',
        description: '管理概览和统计',
        icon: LayoutDashboard,
        href: '/admin',
        isAccessible: true,
        allowedRoles: ['admin', 'manager', 'teacher'],
      },
    ],
  },
  {
    id: 'user-management',
    title: '用户管理',
    allowedRoles: ['admin', 'manager'],
    isDisplayedOnPage: true,
    routes: [
      {
        title: '用户列表',
        description: '管理用户账号和权限',
        icon: Users,
        href: '/admin/users',
        isAccessible: true,
        allowedRoles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'course-management',
    title: '课程管理',
    allowedRoles: ['admin', 'teacher'],
    isDisplayedOnPage: false,
    routes: [
      {
        title: '课程管理',
        description: '管理课程内容',
        icon: BookOpen,
        href: '/admin/courses',
        isAccessible: true,
        allowedRoles: ['admin', 'teacher'],
      },
    ],
  },
  {
    id: 'resources',
    title: '资源管理',
    allowedRoles: ['admin', 'department-head', 'mentor'],
    isDisplayedOnPage: true,
    routes: [
      {
        title: '管理资料库',
        description: '管理教学资料和学习材料',
        icon: Library,
        href: '/admin/libraries',
        isAccessible: true,
        allowedRoles: ['admin', 'department-head', 'mentor'],
      }
    ],
  },
  {
    id: 'experiment-management',
    title: '实验管理',
    allowedRoles: ['admin', 'teacher'],
    isDisplayedOnPage: false,
    routes: [
      {
        title: '实验管理',
        description: '管理实验项目',
        icon: BeakerIcon,
        href: '/admin/experiments',
        isAccessible: true,
        allowedRoles: ['admin', 'teacher'],
      },
    ],
  },
  {
    id: 'content-management',
    title: '内容管理',
    allowedRoles: ['admin', 'teacher'],
    isDisplayedOnPage: false,
    routes: [
      {
        title: '内容管理',
        description: '管理内容资源',
        icon: FileText,
        href: '/admin/content',
        isAccessible: true,
        allowedRoles: ['admin', 'teacher'],
      },
    ],
  },
  {
    id: 'analytics',
    title: '数据统计',
    allowedRoles: ['admin', 'manager'],
    isDisplayedOnPage: false,
    routes: [
      {
        title: '数据统计',
        description: '查看数据统计',
        icon: BarChart3,
        href: '/admin/analytics',
        isAccessible: true,
        allowedRoles: ['admin', 'manager'],
      },
    ],
  },
  {
    id: 'settings',
    title: '系统设置',
    allowedRoles: ['admin'],
    isDisplayedOnPage: false,
    routes: [
      {
        title: '系统设置',
        description: '系统配置管理',
        icon: Settings,
        href: '/admin/settings',
        isAccessible: true,
        allowedRoles: ['admin'],
      },
    ],
  },
  {
    id: 'quick-access',
    title: '快速访问',
    allowedRoles: ['admin', 'manager', 'teacher'],
    isDisplayedOnPage: true,
    routes: [
      {
        title: '返回首页',
        description: '返回前台页面',
        icon: Home,
        href: '/',
        isAccessible: true,
        allowedRoles: ['admin', 'manager', 'teacher'],
      },
    ],
  },
]

/**
 * 根据角色获取过滤后的路由组
 * @param roles 用户角色数组
 * @returns 过滤后的路由组
 */
export function getFilteredRouteGroups(roles: string[]): RouteGroup[] {
  return routeGroups
    .filter(group => group.allowedRoles.some(role => roles.includes(role)))
    .map(group => ({
      ...group,
      routes: group.routes.filter(route =>
        route.allowedRoles.some(role => roles.includes(role))
      ),
    }))
    .filter(group => group.routes.length > 0)
}

/**
 * 检查用户是否有权限访问特定路由
 * @param href 路由路径
 * @param roles 用户角色数组
 * @returns 是否有权限访问
 */
export function hasRouteAccess(href: string, roles: string[]): boolean {
  for (const group of routeGroups) {
    for (const route of group.routes) {
      if (route.href === href) {
        return route.allowedRoles.some(role => roles.includes(role))
      }
    }
  }
  return false
}

/**
 * 获取用户可以访问的所有路由
 * @param roles 用户角色数组
 * @returns 可访问的路由列表
 */
export function getAccessibleRoutes(roles: string[]): Route[] {
  const accessibleRoutes: Route[] = []

  for (const group of routeGroups) {
    for (const route of group.routes) {
      if (route.allowedRoles.some(role => roles.includes(role))) {
        accessibleRoutes.push(route)
      }
    }
  }

  return accessibleRoutes
}