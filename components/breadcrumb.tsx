"use client"

import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"
import Link from "next/link"

export function Breadcrumb() {
  const pathname = usePathname()
  
  // 解析路径生成面包屑项
  const generateBreadcrumbs = () => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs = []
    
    let currentPath = ''
    
    for (let i = 0; i < segments.length; i++) {
      currentPath += `/${segments[i]}`
      
      // 将路径转换为可读的标题
      let title = segments[i]
      
      // 特殊处理一些路径
      if (segments[i] === 'dashboard') {
        title = '个人中心'
      } else if (segments[i] === 'users') {
        title = '用户管理'
      } else if (segments[i] === 'roles') {
        title = '角色管理'
      } else if (segments[i] === 'home') {
        title = '首页'
      } else if (segments[i] === 'resources') {
        title = '资料库管理'
      } else if (segments[i] === 'classes') {
        title = '班级管理'
      } else if (segments[i] === 'my-classes') {
        title = '我的班级'
      }
      
      breadcrumbs.push({
        title,
        path: currentPath,
        isLast: i === segments.length - 1
      })
    }
    
    return breadcrumbs
  }
  
  const breadcrumbs = generateBreadcrumbs()
  
  if (breadcrumbs.length === 0) {
    return null
  }
  
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      <Link
        href="/"
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="h-4 w-4" />
      </Link>
      
      {breadcrumbs.map((breadcrumb, index) => (
        <div key={breadcrumb.path} className="flex items-center space-x-1">
          <ChevronRight className="h-4 w-4" />
          {breadcrumb.isLast ? (
            <span className="text-foreground font-medium">
              {breadcrumb.title}
            </span>
          ) : (
            <Link
              href={breadcrumb.path}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.title}
            </Link>
          )}
        </div>
      ))}
    </nav>
  )
}
