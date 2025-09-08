"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumb } from "@/components/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// 模拟用户数据
const mockUsers = [
  {
    id: "1",
    username: "admin",
    nickName: "管理员",
    phone: "13800138001",
    email: "admin@example.com",
    status: "活跃",
    roles: ["admin"],
    registeredAt: "2024-01-01",
    lastLogin: "2024-01-15"
  },
  {
    id: "2",
    username: "teacher1",
    nickName: "张老师",
    phone: "13800138002",
    email: "teacher1@example.com",
    status: "活跃",
    roles: ["teacher"],
    registeredAt: "2024-01-02",
    lastLogin: "2024-01-14"
  },
  {
    id: "3",
    username: "student1",
    nickName: "李同学",
    phone: "13800138003",
    email: "student1@example.com",
    status: "活跃",
    roles: ["student"],
    registeredAt: "2024-01-03",
    lastLogin: "2024-01-13"
  }
]

export default function UsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  // 过滤用户
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.nickName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.phone.includes(searchTerm) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === "all" || user.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  // 删除用户
  const handleDeleteUser = (userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId))
    toast.success("用户删除成功")
  }

  // 查看用户详情
  const handleViewUser = (userId: string) => {
    router.push(`/dashboard/users/${userId}`)
  }

  return (
    <>
      <div className='flex h-16 items-center border-b bg-gradient-to-r from-purple-50 to-pink-50 px-4 shadow-sm'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-purple-50/30 to-pink-50/30 w-full max-w-7xl mx-auto space-y-6 p-6">
        {/* 头部 */}
        <div className="flex items-center justify-between">
          <div className='space-y-2'>
            <h1 className="text-4xl font-bold gradient-text-purple tracking-tight">用户管理</h1>
            <p className="text-gray-600 text-lg">管理系统中的所有用户账户</p>
          </div>
          <Button className='bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105'>
            <Plus className="h-4 w-4 mr-2" />
            添加用户
          </Button>
        </div>

        {/* 搜索和过滤 */}
        <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
          <CardContent className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="搜索用户名、昵称、手机号或邮箱..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                >
                  <option value="all">全部状态</option>
                  <option value="活跃">活跃</option>
                  <option value="冻结">冻结</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 用户列表 */}
        <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
          <CardHeader className='bg-gradient-to-r from-purple-50 to-pink-50 rounded-t-lg'>
            <CardTitle className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
              <Users className='h-5 w-5 text-purple-600' />
              用户列表 ({filteredUsers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border-0 rounded-lg hover:bg-purple-50/50 transition-all duration-200 shadow-sm hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {user.nickName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{user.nickName}</h3>
                        <span className="text-sm text-gray-500">@{user.username}</span>
                        <Badge variant={user.status === "活跃" ? "default" : "destructive"}>
                          {user.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>{user.phone}</span>
                        <span>{user.email}</span>
                        <span>注册: {user.registeredAt}</span>
                        <span>最后登录: {user.lastLogin}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {user.roles.map((role) => (
                          <Badge key={role} variant="outline" className="text-xs">
                            {role}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className='hover:bg-purple-50 transition-all duration-200 hover:scale-105'>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className='shadow-lg border-0 bg-white/95 backdrop-blur-sm'>
                      <DropdownMenuItem onClick={() => handleViewUser(user.id)} className='hover:bg-blue-50 transition-colors'>
                        <Eye className="h-4 w-4 mr-2" />
                        查看详情
                      </DropdownMenuItem>
                      <DropdownMenuItem className='hover:bg-green-50 transition-colors'>
                        <Edit className="h-4 w-4 mr-2" />
                        编辑
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-destructive hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
              
              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  没有找到匹配的用户
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
