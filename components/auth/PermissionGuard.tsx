"use client"

import React from 'react'
import { usePermissions, UserPermissions } from '@/lib/hooks/usePermissions'

// 权限守卫组件属性
interface PermissionGuardProps {
  // 需要的权限（全部满足才显示）
  requireAll?: (keyof UserPermissions)[]
  // 需要的权限（满足任一即可显示）
  requireAny?: (keyof UserPermissions)[]
  // 需要的角色类型
  requireRole?: 'admin' | 'teacher' | 'student' | 'guest'
  // 权限不足时显示的内容
  fallback?: React.ReactNode
  // 子组件
  children: React.ReactNode
}

// 权限守卫组件
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requireAll,
  requireAny,
  requireRole,
  fallback = null,
  children
}) => {
  const { 
    hasAllPermissions, 
    hasAnyPermission, 
    isAdmin, 
    isTeacher, 
    isStudent,
    permissions 
  } = usePermissions()

  // 检查权限
  let hasPermission = true

  // 检查是否需要所有权限
  if (requireAll && requireAll.length > 0) {
    hasPermission = hasPermission && hasAllPermissions(requireAll)
  }

  // 检查是否需要任一权限
  if (requireAny && requireAny.length > 0) {
    hasPermission = hasPermission && hasAnyPermission(requireAny)
  }

  // 检查角色要求
  if (requireRole) {
    switch (requireRole) {
      case 'admin':
        hasPermission = hasPermission && isAdmin()
        break
      case 'teacher':
        hasPermission = hasPermission && isTeacher()
        break
      case 'student':
        hasPermission = hasPermission && isStudent()
        break
      case 'guest':
        // 访客角色总是有权限
        break
    }
  }

  // 如果没有权限，显示fallback或null
  if (!hasPermission) {
    return <>{fallback}</>
  }

  // 有权限，显示子组件
  return <>{children}</>
}

// 管理员权限守卫
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireRole="admin" fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 教师权限守卫
export const TeacherOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireRole="teacher" fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 学生权限守卫
export const StudentOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireRole="student" fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 管理员或教师权限守卫
export const AdminOrTeacher: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireAny={['canManageUsers', 'canViewAllStudents']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 可以查看所有学生的权限守卫
export const CanViewAllStudents: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireAll={['canViewAllStudents']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 可以管理用户的权限守卫
export const CanManageUsers: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireAll={['canManageUsers']} fallback={fallback}>
    {children}
  </PermissionGuard>
)

// 可以查看分析数据的权限守卫
export const CanViewAnalytics: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback = null 
}) => (
  <PermissionGuard requireAll={['canViewAnalytics']} fallback={fallback}>
    {children}
  </PermissionGuard>
)
