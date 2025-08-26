"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { Plus, Search, Edit, Trash2, User, Phone, Calendar } from 'lucide-react'
import { AdminOnly } from '@/components/auth/PermissionGuard'
import { getUsers, createUser, deleteUser, getUserDetail, saveUserRoles } from '@/lib/api/users'
import { getRoles } from '@/lib/api/roles'
import { AppUser, CreateUserRequest } from '@/types/tale'
import { Role } from '@/types/tale'
import { useUserStore } from '@/lib/stores/user-store'

export default function UsersManagementPage() {
  const { user } = useUserStore()
  const [users, setUsers] = useState<AppUser[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize] = useState(10)
  const [totalUsers, setTotalUsers] = useState(0)
  
  // 对话框状态
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AppUser | null>(null)
  
  // 表单状态
  const [createForm, setCreateForm] = useState<CreateUserRequest>({
    username: '',
    phone: '',
    password_encrypted: ''
  })

  // 获取用户列表
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const response = await getUsers({
        page: currentPage,
        size: pageSize,
        search: searchTerm || undefined
      }, process.env.NEXT_PUBLIC_TALE_APP_KEY)
      
      setUsers(response.content)
      setTotalUsers(response.total)
    } catch (error) {
      console.error('获取用户列表失败:', error)
      toast.error('获取用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  // 获取角色列表
  const fetchRoles = async () => {
    try {
      const response = await getRoles({
        page: 0,
        size: 100
      }, process.env.NEXT_PUBLIC_TALE_APP_KEY)
      
      setRoles(response.data.content)
    } catch (error) {
      console.error('获取角色列表失败:', error)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [currentPage, searchTerm])

  // 处理创建用户
  const handleCreateUser = async () => {
    try {
      if (!createForm.username.trim()) {
        toast.error('用户名不能为空')
        return
      }

      await createUser(createForm, process.env.NEXT_PUBLIC_TALE_APP_KEY)
      toast.success('用户创建成功')
      setCreateDialogOpen(false)
      setCreateForm({ username: '', phone: '', password_encrypted: '' })
      fetchUsers()
    } catch (error) {
      console.error('创建用户失败:', error)
      toast.error('创建用户失败')
    }
  }

  // 处理删除用户
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('确定要删除这个用户吗？此操作不可恢复。')) {
      return
    }

    try {
      await deleteUser(userId, process.env.NEXT_PUBLIC_TALE_APP_KEY)
      toast.success('用户删除成功')
      fetchUsers()
    } catch (error) {
      console.error('删除用户失败:', error)
      toast.error('删除用户失败')
    }
  }

  // 处理编辑用户
  const handleEditUser = (user: AppUser) => {
    setSelectedUser(user)
    setEditDialogOpen(true)
  }

  // 处理保存用户角色
  const handleSaveUserRoles = async (userId: string, roleIds: string[]) => {
    try {
      await saveUserRoles(userId, { role_ids: roleIds }, process.env.NEXT_PUBLIC_TALE_APP_KEY)
      toast.success('用户角色保存成功')
      setEditDialogOpen(false)
      fetchUsers()
    } catch (error) {
      console.error('保存用户角色失败:', error)
      toast.error('保存用户角色失败')
    }
  }

  return (
    <AdminOnly fallback={<div className="text-center py-8">您没有权限访问此页面</div>}>
      <div className="container mx-auto px-4 py-8">
        {/* 权限检查已启用提示 */}
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-green-700 font-medium">
              权限检查已启用，当前用户角色：{JSON.stringify(user?.roles)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">用户管理</h1>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                创建用户
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>创建新用户</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="username">用户名 *</Label>
                  <Input
                    id="username"
                    value={createForm.username}
                    onChange={(e) => setCreateForm({ ...createForm, username: e.target.value })}
                    placeholder="请输入用户名"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    value={createForm.phone}
                    onChange={(e) => setCreateForm({ ...createForm, phone: e.target.value })}
                    placeholder="请输入手机号"
                  />
                </div>
                <div>
                  <Label htmlFor="password">密码</Label>
                  <Input
                    id="password"
                    type="password"
                    value={createForm.password_encrypted}
                    onChange={(e) => setCreateForm({ ...createForm, password_encrypted: e.target.value })}
                    placeholder="请输入密码"
                  />
                </div>
                <Button onClick={handleCreateUser} className="w-full">
                  创建用户
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* 搜索栏 */}
        <div className="mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="搜索用户..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 用户列表 */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
              <p className="mt-2 text-gray-600">加载中...</p>
            </div>
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-gray-500">暂无用户数据</p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => (
              <Card key={user.user_id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{user.username}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="w-4 h-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(user.registered_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        {user.remark && (
                          <p className="text-sm text-gray-600 mt-1">{user.remark}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteUser(user.user_id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        删除
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* 分页 */}
        {totalUsers > pageSize && (
          <div className="flex justify-center mt-6">
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                disabled={currentPage === 0}
              >
                上一页
              </Button>
              <span className="flex items-center px-4">
                {currentPage + 1} / {Math.ceil(totalUsers / pageSize)}
              </span>
              <Button
                variant="outline"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage >= Math.ceil(totalUsers / pageSize) - 1}
              >
                下一页
              </Button>
            </div>
          </div>
        )}

        {/* 编辑用户对话框 */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>编辑用户 - {selectedUser?.username}</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>用户ID</Label>
                    <Input value={selectedUser.user_id} disabled />
                  </div>
                  <div>
                    <Label>用户名</Label>
                    <Input value={selectedUser.username} disabled />
                  </div>
                  <div>
                    <Label>手机号</Label>
                    <Input value={selectedUser.phone || ''} disabled />
                  </div>
                  <div>
                    <Label>注册时间</Label>
                    <Input value={new Date(selectedUser.registered_at).toLocaleString()} disabled />
                  </div>
                </div>
                <div>
                  <Label>备注</Label>
                  <Textarea value={selectedUser.remark || ''} disabled />
                </div>
                <div>
                  <Label>角色管理</Label>
                  <div className="mt-2 space-y-2">
                    {roles.map((role) => (
                      <div key={role.role_id} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`role-${role.role_id}`}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor={`role-${role.role_id}`} className="text-sm">
                          {role.role_name} ({role.role_type})
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                    取消
                  </Button>
                  <Button onClick={() => handleSaveUserRoles(selectedUser.user_id, [])}>
                    保存角色
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminOnly>
  )
}
