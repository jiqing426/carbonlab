"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, BookOpen, Settings } from "lucide-react"
import { useUserStore } from "@/lib/stores/user-store"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface Student {
  id: string
  username: string
  phone?: string
  email?: string
  joinDate: string
  status: 'active' | 'inactive'
}

interface Class {
  id: string
  name: string
  description?: string
  maxStudents: number
  currentStudents: number
  grade: string
  remark?: string
  createdAt: string
  status: 'ongoing' | 'completed' | 'pending' // 进行中、已结课、待开始
  students: Student[]
}

export default function MyClassesPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [myClasses, setMyClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)

  // 获取用户角色
  const userRoles = user?.roles || []
  const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null
  const isStudent = primaryRole === 'student'
  const isAdmin = primaryRole === 'admin' || user?.username === 'carbon'

  useEffect(() => {
    // 从 localStorage 加载班级数据
    const loadClasses = () => {
      try {
        const savedClasses = localStorage.getItem('carbonlab-classes')
        if (savedClasses) {
          const allClasses: Class[] = JSON.parse(savedClasses)
          
          if (isStudent) {
            // 学生：显示自己所在的班级
            const studentClasses = allClasses.filter(cls => 
              cls.students.some(student => student.username === user?.username)
            )
            setMyClasses(studentClasses)
          } else if (isAdmin) {
            // 管理员：显示所有班级
            setMyClasses(allClasses)
          } else {
            // 其他用户：显示空数组
            setMyClasses([])
          }
        }
      } catch (error) {
        console.error('Failed to load classes:', error)
        setMyClasses([])
      } finally {
        setLoading(false)
      }
    }

    loadClasses()
  }, [user, isStudent, isAdmin])

  // 获取状态标签
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ongoing':
        return <Badge className="bg-green-100 text-green-800">进行中</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">已结课</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">待开始</Badge>
      default:
        return <Badge variant="outline">未知</Badge>
    }
  }

  // 获取用户在当前班级中的角色
  const getUserRoleInClass = (cls: Class) => {
    if (isAdmin) return "管理员"
    if (isStudent) {
      const student = cls.students.find(s => s.username === user?.username)
      return student ? "学生" : "未知"
    }
    return "未知"
  }

  if (loading) {
    return (
      <>
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
        </div>
        <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载中...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
      </div>
      <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
        {/* 页面标题 */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {isStudent ? '我的班级' : isAdmin ? '管理的班级' : '班级信息'}
          </h1>
          <p className="text-gray-600">
            {isStudent 
              ? '查看您所在班级的详细信息' 
              : isAdmin 
                ? '管理所有班级信息' 
                : '查看班级信息'
            }
          </p>
        </div>

        {/* 统计信息 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-blue-600">班级数量</p>
                  <p className="text-2xl font-bold text-blue-800">{myClasses.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-600">进行中班级</p>
                  <p className="text-2xl font-bold text-green-800">
                    {myClasses.filter(c => c.status === 'ongoing').length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-pink-50">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-purple-600">最新班级</p>
                  <p className="text-2xl font-bold text-purple-800">
                    {myClasses.length > 0 ? myClasses[0].grade : '-'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 班级列表 */}
        {myClasses.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="p-8 text-center">
              <div className="p-3 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-gray-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {isStudent ? '您还没有加入任何班级' : '暂无班级数据'}
              </h3>
              <p className="text-gray-600 mb-4">
                {isStudent 
                  ? '请联系管理员将您添加到班级中' 
                  : '请先创建班级或等待班级分配'
                }
              </p>
              {isAdmin && (
                <Button onClick={() => router.push('/dashboard/classes')}>
                  前往班级管理
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myClasses.map((cls) => (
              <Card key={cls.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{cls.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-1">{cls.grade}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(cls.status)}
                      <Badge variant="outline" className="text-xs">
                        {getUserRoleInClass(cls)}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {cls.description && (
                    <p className="text-sm text-gray-600">{cls.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">学生数量</span>
                    <span className="font-medium">
                      {cls.currentStudents} / {cls.maxStudents}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">创建时间</span>
                    <span className="font-medium">
                      {new Date(cls.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {cls.remark && (
                    <div className="pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">备注：</span>{cls.remark}
                      </p>
                    </div>
                  )}
                  
                  <div className="pt-3 flex gap-2">
                    {isAdmin ? (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/classes`)}
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        管理班级
                      </Button>
                    ) : (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => router.push(`/dashboard/classes`)}
                      >
                        <BookOpen className="w-4 h-4 mr-2" />
                        查看详情
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
