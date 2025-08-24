'use client'

import { useRouter } from 'next/navigation'
import { useUserStore } from '@/lib/stores/user-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  User, 
  BookOpen, 
  BarChart3, 
  Settings, 
  LogOut, 
  Home,
  Calendar,
  Shield,
  Mail,
  Phone
} from 'lucide-react'
import { toast } from 'sonner'
import { useState, useEffect } from 'react'
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar'
import { AvatarUpload } from '@/components/ui/avatar-upload'

export default function DashboardHomePage() {
  const router = useRouter()
  const { user, isLoggedIn, logout } = useUserStore()
  const [activeMenu, setActiveMenu] = useState('overview')
  const [showPlanForm, setShowPlanForm] = useState(false)
  const [planForm, setPlanForm] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    priority: 'medium'
  })
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null)
  const [plans, setPlans] = useState<Array<{
    id: string
    title: string
    description: string
    startDate: string
    endDate: string
    priority: string
    createdAt: string
    completed: boolean
  }>>([])

  // 修改密码相关状态
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // 头像管理相关状态
  const [showAvatarForm, setShowAvatarForm] = useState(false)

  // 学习统计相关状态
  const [learningStats, setLearningStats] = useState({
    totalCourses: 0,
    totalExperiments: 0,
    totalStudyTime: 0, // 总学习时长（分钟）
    completedCourses: 0,
    completedExperiments: 0,
    weeklyProgress: [0, 0, 0, 0, 0, 0, 0], // 一周的学习进度
    recentActivities: [] as Array<{
      id: string
      type: string
      title: string
      time: string
      duration: number
    }> // 最近的学习活动
  })

  // 笔记相关状态
  const [showNoteForm, setShowNoteForm] = useState(false)
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    category: 'general',
    tags: ''
  })
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null)
  const [notes, setNotes] = useState<Array<{
    id: string
    title: string
    content: string
    category: string
    tags: string[]
    createdAt: string
    updatedAt: string
  }>>([])

  // 从localStorage加载已保存的计划
  useEffect(() => {
    const savedPlans = localStorage.getItem('userLearningPlans')
    if (savedPlans) {
      try {
        const parsedPlans = JSON.parse(savedPlans)
        setPlans(parsedPlans)
      } catch (error) {
        console.error('加载学习计划失败:', error)
        toast.error('加载学习计划失败')
      }
    }
  }, [])

  // 当计划变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('userLearningPlans', JSON.stringify(plans))
  }, [plans])

  // 从localStorage加载已保存的笔记
  useEffect(() => {
    const savedNotes = localStorage.getItem('userNotes')
    if (savedNotes) {
      try {
        const parsedNotes = JSON.parse(savedNotes)
        setNotes(parsedNotes)
      } catch (error) {
        console.error('加载笔记失败:', error)
        toast.error('加载笔记失败')
      }
    }
  }, [])

  // 当笔记变化时保存到localStorage
  useEffect(() => {
    localStorage.setItem('userNotes', JSON.stringify(notes))
  }, [notes])

  // 学习统计相关useEffect
  useEffect(() => {
    // 从localStorage加载学习统计数据
    const loadLearningStats = () => {
      const savedStats = localStorage.getItem('userLearningStats')
      if (savedStats) {
        try {
          const parsedStats = JSON.parse(savedStats)
          setLearningStats(parsedStats)
        } catch (error) {
          console.error('加载学习统计失败:', error)
        }
      }
    }

    loadLearningStats()
    
    // 监听来自其他页面的学习活动消息
    const handleLearningActivity = (event: MessageEvent) => {
      if (event.data.type === 'LEARNING_ACTIVITY') {
        const { activity } = event.data
        updateLearningStats(activity)
      }
    }

    if (typeof window !== 'undefined') {
      window.addEventListener('message', handleLearningActivity)
      
      return () => {
        window.removeEventListener('message', handleLearningActivity)
      }
    }
  }, [])

  // 更新学习统计
  const updateLearningStats = (activity: any) => {
    setLearningStats(prev => {
      const newStats = { ...prev }
      
      // 根据活动类型更新统计
      if (activity.type === 'course_start') {
        newStats.totalCourses++
      } else if (activity.type === 'experiment_start') {
        newStats.totalExperiments++
      } else if (activity.type === 'study_time') {
        newStats.totalStudyTime += activity.duration || 0
        // 更新周进度（简化处理，实际应该按日期计算）
        const today = new Date().getDay()
        newStats.weeklyProgress[today] += activity.duration || 0
      } else if (activity.type === 'course_complete') {
        newStats.completedCourses++
      } else if (activity.type === 'experiment_complete') {
        newStats.completedExperiments++
      }
      
      // 添加最近活动
      newStats.recentActivities.unshift({
        id: Date.now().toString(),
        type: activity.type,
        title: activity.title || '学习活动',
        time: new Date().toISOString(),
        duration: activity.duration || 0
      })
      
      // 只保留最近10个活动
      newStats.recentActivities = newStats.recentActivities.slice(0, 10)
      
      // 保存到localStorage
      localStorage.setItem('userLearningStats', JSON.stringify(newStats))
      
      return newStats
    })
  }

  // 笔记相关函数
  const handleNoteInputChange = (field: string, value: string) => {
    setNoteForm(prev => ({ ...prev, [field]: value }))
  }

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setNoteForm({
        title: note.title,
        content: note.content,
        category: note.category,
        tags: note.tags.join(', ')
      })
      setEditingNoteId(noteId)
      setShowNoteForm(true)
    }
  }

  const handleDeleteNote = (noteId: string) => {
    if (confirm('确定要删除这个笔记吗？')) {
      setNotes(prev => prev.filter(n => n.id !== noteId))
      toast.success('笔记已删除')
    }
  }

  const handleUpdateNote = () => {
    if (!noteForm.title.trim()) {
      toast.error('请输入笔记标题')
      return
    }
    if (!noteForm.content.trim()) {
      toast.error('请输入笔记内容')
      return
    }

    const tags = noteForm.tags.trim() ? noteForm.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []

    if (editingNoteId) {
      // 更新现有笔记
      setNotes(prev => prev.map(note => 
        note.id === editingNoteId 
          ? {
              ...note,
              title: noteForm.title.trim(),
              content: noteForm.content.trim(),
              category: noteForm.category,
              tags,
              updatedAt: new Date().toISOString()
            }
          : note
      ))
      toast.success('笔记更新成功！')
    } else {
      // 创建新笔记
      const newNote = {
        id: Date.now().toString(),
        title: noteForm.title.trim(),
        content: noteForm.content.trim(),
        category: noteForm.category,
        tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      setNotes(prev => [newNote, ...prev])
      toast.success('笔记创建成功！')
    }

    setShowNoteForm(false)
    setEditingNoteId(null)
    setNoteForm({
      title: '',
      content: '',
      category: 'general',
      tags: ''
    })
  }

  // 如果未登录，重定向到首页
  if (!isLoggedIn || !user) {
    router.push('/')
    return null
  }

  const handleLogout = () => {
    logout()
    toast.success('已退出登录')
    router.push('/')
  }

  const handleCreatePlan = () => {
    if (!planForm.title.trim()) {
      toast.error('请输入计划标题')
      return
    }
    if (!planForm.startDate || !planForm.endDate) {
      toast.error('请选择开始和结束日期')
      return
    }
    
    // 创建新计划
    const newPlan = {
      id: Date.now().toString(),
      title: planForm.title.trim(),
      description: planForm.description.trim(),
      startDate: planForm.startDate,
      endDate: planForm.endDate,
      priority: planForm.priority,
      createdAt: new Date().toISOString(),
      completed: false
    }
    
    setPlans(prev => [newPlan, ...prev])
    toast.success('学习计划创建成功！')
    setShowPlanForm(false)
    setPlanForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'medium'
    })
  }

  const handlePlanInputChange = (field: string, value: string) => {
    setPlanForm(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleEditPlan = (planId: string) => {
    const plan = plans.find(p => p.id === planId)
    if (plan) {
      setPlanForm({
        title: plan.title,
        description: plan.description,
        startDate: plan.startDate,
        endDate: plan.endDate,
        priority: plan.priority
      })
      setEditingPlanId(planId)
      setShowPlanForm(true)
    }
  }

  const handleDeletePlan = (planId: string) => {
    if (confirm('确定要删除这个学习计划吗？')) {
      setPlans(prev => prev.filter(p => p.id !== planId))
      toast.success('学习计划已删除')
    }
  }

  const handleToggleComplete = (planId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? { ...plan, completed: !plan.completed }
        : plan
    ))
  }

  // 修改密码相关函数
  const handlePasswordInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }))
  }

  const handleChangePassword = async () => {
    // 验证表单
    if (!passwordForm.currentPassword.trim()) {
      toast.error('请输入当前密码')
      return
    }
    if (!passwordForm.newPassword.trim()) {
      toast.error('请输入新密码')
      return
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('新密码长度至少6位')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('两次输入的新密码不一致')
      return
    }

    setIsChangingPassword(true)
    try {
      // 调用API修改密码
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${useUserStore.getState().token}`
        },
        body: JSON.stringify({
          current_password: passwordForm.currentPassword,
          new_password: passwordForm.newPassword
        })
      })

      if (response.ok) {
        const data = await response.json()
        if (data.code === 200) {
          toast.success('密码修改成功！')
          setShowPasswordForm(false)
          setPasswordForm({
            currentPassword: '',
            newPassword: '',
            confirmPassword: ''
          })
        } else {
          toast.error(data.message || '密码修改失败')
        }
      } else {
        toast.error('密码修改失败，请稍后重试')
      }
    } catch (error) {
      console.error('修改密码错误:', error)
      toast.error('网络错误，请稍后重试')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // 头像更新处理函数
  const handleAvatarChange = (avatarUrl: string) => {
    useUserStore.getState().updateAvatar(avatarUrl)
    setShowAvatarForm(false)
  }

  const handleUpdatePlan = () => {
    if (!planForm.title.trim()) {
      toast.error('请输入计划标题')
      return
    }
    if (!planForm.startDate || !planForm.endDate) {
      toast.error('请选择开始和结束日期')
      return
    }
    
    if (editingPlanId) {
      // 更新现有计划
      setPlans(prev => prev.map(plan => 
        plan.id === editingPlanId 
          ? {
              ...plan,
              title: planForm.title.trim(),
              description: planForm.description.trim(),
              startDate: planForm.startDate,
              endDate: planForm.endDate,
              priority: planForm.priority
            }
          : plan
      ))
      toast.success('学习计划更新成功！')
      setEditingPlanId(null)
    } else {
      // 创建新计划
      const newPlan = {
        id: Date.now().toString(),
        title: planForm.title.trim(),
        description: planForm.description.trim(),
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        priority: planForm.priority,
        createdAt: new Date().toISOString(),
        completed: false
      }
      
      setPlans(prev => [newPlan, ...prev])
      toast.success('学习计划创建成功！')
    }
    
    setShowPlanForm(false)
    setPlanForm({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      priority: 'medium'
    })
  }

  const menuItems = [
    {
      id: 'overview',
      title: '概览',
      icon: Home
    },
    {
      id: 'statistics',
      title: '学习统计',
      icon: BarChart3
    },
    {
      id: 'courses',
      title: '我的笔记',
      icon: BookOpen
    },
    {
      id: 'calendar',
      title: '学习计划',
      icon: Calendar
    },

    {
      id: 'settings',
      title: '账户设置',
      icon: Settings
    }
  ]

  // 渲染不同的内容区域
  const renderContent = () => {
    switch (activeMenu) {
      case 'overview':
        return (
          <>
            {/* 欢迎信息 */}
            <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-0 shadow-sm mb-8">
              <CardContent className="pt-6 pb-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 overflow-hidden border-2 border-white shadow-lg">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="用户头像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <span className="text-white text-xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <h3 className="text-xl font-bold text-green-800 mb-3">
                    欢迎回来，{user.username}！
                  </h3>
                  <p className="text-green-700 text-lg leading-relaxed max-w-2xl mx-auto">
                    这里是您的个人学习中心，您可以在这里管理课程、查看学习进度和设置账户信息。
                    开始您的学习之旅吧！
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* 用户信息卡片 */}
            <Card className="mb-8 shadow-sm border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <User className="h-6 w-6 text-green-600" />
                  </div>
                  账户信息
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <User className="h-4 w-4 text-blue-500" />
                      <span className="font-medium">用户名</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">{user.username}</p>
                  </div>
                  
                  <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <Shield className="h-4 w-4 text-purple-500" />
                      <span className="font-medium">用户ID</span>
                    </div>
                    <p className="text-lg font-mono font-semibold text-gray-900">{user.id}</p>
                  </div>

                  {user.latest_login_time && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-green-500" />
                        <span className="font-medium">最后登录</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.latest_login_time).toLocaleString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {user.registered_at && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 text-orange-500" />
                        <span className="font-medium">注册时间</span>
                      </div>
                      <p className="text-sm font-medium text-gray-900">
                        {new Date(user.registered_at).toLocaleDateString('zh-CN')}
                      </p>
                    </div>
                  )}

                  {user.is_frozen !== undefined && (
                    <div className="space-y-3 p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Shield className="h-4 w-4 text-red-500" />
                        <span className="font-medium">账户状态</span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${
                        user.is_frozen 
                          ? 'bg-red-100 text-red-700 border border-red-200' 
                          : 'bg-green-100 text-green-700 border border-green-200'
                      }`}>
                        {user.is_frozen ? '已冻结' : '正常'}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 快速操作卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-blue-700">
                    <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-blue-300 transition-colors">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    我的笔记
                  </CardTitle>
                  <CardDescription className="text-blue-600">管理您的学习笔记</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-blue-700 mb-4">还没有创建任何笔记</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                    onClick={() => setShowNoteForm(true)}
                  >
                    创建笔记
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-green-700">
                    <div className="p-2 bg-blue-200 rounded-lg group-hover:bg-green-300 transition-colors">
                      <BarChart3 className="h-5 w-5 text-green-600" />
                    </div>
                    学习统计
                  </CardTitle>
                  <CardDescription className="text-green-600">查看学习数据和成就</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-green-700 mb-4">暂无学习数据</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-green-300 text-green-700 hover:bg-green-100"
                    onClick={() => setActiveMenu('statistics')}
                  >
                    查看统计
                  </Button>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-orange-700">
                    <div className="p-2 bg-orange-200 rounded-lg group-hover:bg-orange-300 transition-colors">
                      <Calendar className="h-5 w-5 text-orange-600" />
                    </div>
                    学习计划
                  </CardTitle>
                  <CardDescription className="text-orange-600">安排您的学习计划</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-orange-700 mb-4">还没有创建任何计划</p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full border-orange-300 text-orange-700 hover:bg-orange-100"
                    onClick={() => setActiveMenu('calendar')}
                  >
                    创建计划
                  </Button>
                </CardContent>
              </Card>

            </div>
          </>
        )

      case 'courses':
        return (
          <>
            {/* 笔记创建表单 */}
            {showNoteForm && (
              <Card className="border-0 shadow-sm bg-white mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    {editingNoteId ? '编辑笔记' : '创建新的笔记'}
                  </CardTitle>
                  <CardDescription>
                    {editingNoteId ? '修改您的笔记内容' : '记录您的学习心得和重要知识点'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">笔记标题 *</label>
                    <input
                      type="text"
                      placeholder="输入笔记标题"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={noteForm.title}
                      onChange={(e) => handleNoteInputChange('title', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">笔记分类</label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={noteForm.category}
                      onChange={(e) => handleNoteInputChange('category', e.target.value)}
                    >
                      <option value="general">通用</option>
                      <option value="course">课程笔记</option>
                      <option value="experiment">实验记录</option>
                      <option value="theory">理论知识</option>
                      <option value="practice">实践总结</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">标签</label>
                    <input
                      type="text"
                      placeholder="输入标签，用逗号分隔（如：碳交易, ESG, 实验）"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={noteForm.tags}
                      onChange={(e) => handleNoteInputChange('tags', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">笔记内容 *</label>
                    <textarea
                      placeholder="记录您的学习内容..."
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={noteForm.content}
                      onChange={(e) => handleNoteInputChange('content', e.target.value)}
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowNoteForm(false)
                        setEditingNoteId(null)
                        setNoteForm({
                          title: '',
                          content: '',
                          category: 'general',
                          tags: ''
                        })
                      }}
                      className="px-6"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleUpdateNote}
                      className="bg-blue-600 hover:bg-blue-700 px-6"
                    >
                      {editingNoteId ? '更新笔记' : '创建笔记'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 笔记列表 */}
            {notes.length > 0 && (
              <Card className="border-0 shadow-sm bg-white mb-6">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">我的笔记</CardTitle>
                      <CardDescription>
                        您已创建的笔记列表 
                        <span className="ml-2 text-sm">
                          (共 {notes.length} 篇)
                        </span>
                      </CardDescription>
                    </div>
                    <Button
                      onClick={() => setShowNoteForm(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      创建笔记
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {notes.map((note) => (
                      <div key={note.id} className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{note.title}</h3>
                            <div className="flex items-center gap-3 mb-2">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                note.category === 'course' ? 'bg-blue-100 text-blue-700' :
                                note.category === 'experiment' ? 'bg-green-100 text-green-700' :
                                note.category === 'theory' ? 'bg-purple-100 text-purple-700' :
                                note.category === 'practice' ? 'bg-orange-100 text-orange-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {note.category === 'general' ? '通用' :
                                 note.category === 'course' ? '课程笔记' :
                                 note.category === 'experiment' ? '实验记录' :
                                 note.category === 'theory' ? '理论知识' :
                                 note.category === 'practice' ? '实践总结' : '通用'}
                              </span>
                              <span className="text-sm text-gray-500">
                                {new Date(note.updatedAt).toLocaleDateString('zh-CN')}
                              </span>
                            </div>
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {note.tags.map((tag, index) => (
                                  <span key={index} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                            <p className="text-gray-600 text-sm line-clamp-3">
                              {note.content.length > 200 ? note.content.substring(0, 200) + '...' : note.content}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditNote(note.id)}
                              className="text-blue-600 hover:bg-blue-100"
                            >
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteNote(note.id)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 空状态 */}
            {notes.length === 0 && !showNoteForm && (
              <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl text-blue-800">我的笔记</CardTitle>
                  <CardDescription className="text-lg text-blue-600">管理您的学习笔记和知识整理</CardDescription>
                </CardHeader>
                <CardContent className="text-center pb-8">
                  <h3 className="text-xl font-semibold text-blue-900 mb-3">还没有创建笔记</h3>
                  <p className="text-blue-700 mb-6 text-lg">开始记录您的学习心得和重要知识点</p>
                  <Button 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-3"
                    onClick={() => setShowNoteForm(true)}
                  >
                    创建笔记
                  </Button>
                </CardContent>
              </Card>
            )}
          </>
        )

      case 'statistics':
        return (
          <>
            {/* 统计概览卡片 */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50 mb-6">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-green-800">学习统计概览</CardTitle>
                <CardDescription className="text-lg text-green-600">您的学习数据和进度统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{learningStats.totalCourses}</div>
                    <div className="text-sm text-green-700">总课程数</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{learningStats.totalExperiments}</div>
                    <div className="text-sm text-green-700">总实验数</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{Math.round(learningStats.totalStudyTime / 60)}</div>
                    <div className="text-sm text-green-700">总学习时长(小时)</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">{learningStats.completedCourses + learningStats.completedExperiments}</div>
                    <div className="text-sm text-green-700">已完成项目</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 周学习进度 */}
            <Card className="border-0 shadow-sm bg-white mb-6">
              <CardHeader>
                <CardTitle className="text-xl text-gray-800">本周学习进度</CardTitle>
                <CardDescription>每日学习时长统计</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-7 gap-2">
                    {['周日', '周一', '周二', '周三', '周四', '周五', '周六'].map((day, index) => (
                      <div key={day} className="text-center">
                        <div className="text-sm text-gray-600 mb-2">{day}</div>
                        <div className="h-20 bg-gray-100 rounded-lg flex items-end justify-center p-1">
                          <div 
                            className="w-full bg-green-500 rounded transition-all duration-300"
                            style={{ 
                              height: `${Math.min(100, (learningStats.weeklyProgress[index] / 60) * 100)}%`,
                              maxHeight: '100%'
                            }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {Math.round(learningStats.weeklyProgress[index] / 60 * 10) / 10}h
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 最近学习活动 */}
            {learningStats.recentActivities.length > 0 && (
              <Card className="border-0 shadow-sm bg-white mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">最近学习活动</CardTitle>
                  <CardDescription>您最近的学习记录</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {learningStats.recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-gray-700">{activity.title}</span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(activity.time).toLocaleString('zh-CN')}
                          {activity.duration > 0 && (
                            <span className="ml-2 text-green-600">
                              ({Math.round(activity.duration / 60 * 10) / 10}h)
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 开始学习按钮 */}
            <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-emerald-50">
              <CardContent className="text-center py-8">
                <h3 className="text-xl font-semibold text-green-900 mb-3">开始新的学习之旅</h3>
                <p className="text-green-700 mb-6 text-lg">探索更多课程和实验，丰富您的学习体验</p>
                <Button 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-700 px-8 py-3"
                  onClick={() => {
                    router.push('/resources')
                  }}
                >
                  开始学习
                </Button>
              </CardContent>
            </Card>
          </>
        )

      case 'calendar':
        return (
          <>
            <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-amber-50 mb-6">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl text-orange-800">学习计划</CardTitle>
                <CardDescription className="text-lg text-orange-600">安排您的学习计划</CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-8">
                <Button 
                  size="lg" 
                  className="bg-orange-600 hover:bg-orange-700 px-8 py-3"
                  onClick={() => setShowPlanForm(true)}
                >
                  创建计划
                </Button>
              </CardContent>
            </Card>

            {/* 计划创建表单 */}
            {showPlanForm && (
              <Card className="border-0 shadow-sm bg-white mb-6">
                <CardHeader>
                  <CardTitle className="text-xl text-gray-800">
                    {editingPlanId ? '编辑学习计划' : '创建新的学习计划'}
                  </CardTitle>
                  <CardDescription>
                    {editingPlanId ? '修改您的学习计划详情' : '填写计划详情，制定您的学习目标'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">计划标题 *</label>
                      <input
                        type="text"
                        placeholder="输入计划标题"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={planForm.title}
                        onChange={(e) => handlePlanInputChange('title', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">优先级</label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={planForm.priority}
                        onChange={(e) => handlePlanInputChange('priority', e.target.value)}
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">计划描述</label>
                    <textarea
                      placeholder="描述您的学习计划..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={planForm.description}
                      onChange={(e) => handlePlanInputChange('description', e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">开始日期 *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={planForm.startDate}
                        onChange={(e) => handlePlanInputChange('startDate', e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700">结束日期 *</label>
                      <input
                        type="date"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        value={planForm.endDate}
                        onChange={(e) => handlePlanInputChange('endDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowPlanForm(false)
                        setEditingPlanId(null)
                        setPlanForm({
                          title: '',
                          description: '',
                          startDate: '',
                          endDate: '',
                          priority: 'medium'
                        })
                      }}
                      className="px-6"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleUpdatePlan}
                      className="bg-orange-600 hover:bg-orange-700 px-6"
                    >
                      {editingPlanId ? '更新计划' : '创建计划'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* 计划列表 */}
            {plans.length > 0 && (
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl text-gray-800">我的学习计划</CardTitle>
                      <CardDescription>
                        您已创建的学习计划列表 
                        <span className="ml-2 text-sm">
                          (已完成: {plans.filter(p => p.completed).length}/{plans.length})
                        </span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {plans.map((plan) => (
                      <div 
                        key={plan.id} 
                        className={`p-4 border rounded-lg transition-all duration-200 hover:shadow-sm ${
                          plan.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() => handleToggleComplete(plan.id)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                  plan.completed
                                    ? 'bg-green-500 border-green-500 text-white'
                                    : 'border-gray-300 hover:border-green-400'
                                }`}
                              >
                                {plan.completed && (
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                )}
                              </button>
                              <h3 className={`text-lg font-semibold ${
                                plan.completed ? 'text-green-800 line-through' : 'text-gray-900'
                              }`}>
                                {plan.title}
                              </h3>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                plan.priority === 'high' 
                                  ? 'bg-red-100 text-red-700' 
                                  : plan.priority === 'medium' 
                                  ? 'bg-yellow-100 text-yellow-700' 
                                  : 'bg-green-100 text-green-700'
                              }`}>
                                {plan.priority === 'high' ? '高优先级' : plan.priority === 'medium' ? '中优先级' : '低优先级'}
                              </span>
                            </div>
                            {plan.description && (
                              <p className={`mb-3 ${
                                plan.completed ? 'text-green-700' : 'text-gray-600'
                              }`}>
                                {plan.description}
                              </p>
                            )}
                            <div className="flex items-center gap-6 text-sm text-gray-500">
                              <span>开始：{new Date(plan.startDate).toLocaleDateString('zh-CN')}</span>
                              <span>结束：{new Date(plan.endDate).toLocaleDateString('zh-CN')}</span>
                              <span>创建：{new Date(plan.createdAt).toLocaleDateString('zh-CN')}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditPlan(plan.id)}
                              className="text-blue-600 hover:bg-blue-100"
                              disabled={plan.completed}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeletePlan(plan.id)}
                              className="text-red-600 hover:bg-red-100"
                            >
                              删除
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {plans.length === 0 && !showPlanForm && (
              <Card className="border-0 shadow-sm bg-gray-50">
                <CardContent className="text-center py-12">
                  <div className="text-gray-500">
                    <p className="text-lg mb-2">还没有创建任何学习计划</p>
                    <p className="text-sm">点击上方的"创建计划"按钮开始制定您的学习目标</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )



      case 'settings':
        return (
          <Card className="border-0 shadow-sm bg-gradient-to-br from-gray-50 to-slate-50">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-gray-800">
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* 头像显示区域 */}
                <div className="text-center">
                  <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg mb-4">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="用户头像" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                        <span className="text-white text-2xl font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAvatarForm(true)}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    更新头像
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">用户名</label>
                    <p className="text-lg font-medium text-gray-900">{user.username}</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-gray-200">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">用户ID</label>
                    <p className="text-lg font-mono font-medium text-gray-900">{user.id}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200">
                  <Button 
                    variant="outline" 
                    size="lg" 
                    className="px-8 py-3"
                    onClick={() => setShowPasswordForm(true)}
                  >
                    修改密码
                  </Button>
                </div>

                {/* 修改密码表单 */}
                {showPasswordForm && (
                  <Card className="border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">修改密码</CardTitle>
                      <CardDescription>请输入当前密码和新密码</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">当前密码 *</label>
                        <input
                          type="password"
                          placeholder="请输入当前密码"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.currentPassword}
                          onChange={(e) => handlePasswordInputChange('currentPassword', e.target.value)}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">新密码 *</label>
                        <input
                          type="password"
                          placeholder="请输入新密码（至少6位）"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.newPassword}
                          onChange={(e) => handlePasswordInputChange('newPassword', e.target.value)}
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">确认新密码 *</label>
                        <input
                          type="password"
                          placeholder="请再次输入新密码"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
                          value={passwordForm.confirmPassword}
                          onChange={(e) => handlePasswordInputChange('confirmPassword', e.target.value)}
                        />
                      </div>

                      <div className="flex justify-end space-x-3 pt-4">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setShowPasswordForm(false)
                            setPasswordForm({
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: ''
                            })
                          }}
                          className="px-6"
                          disabled={isChangingPassword}
                        >
                          取消
                        </Button>
                        <Button
                          onClick={handleChangePassword}
                          className="bg-gray-600 hover:bg-gray-700 px-6"
                          disabled={isChangingPassword}
                        >
                          {isChangingPassword ? '修改中...' : '确认修改'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 头像上传表单 */}
                {showAvatarForm && (
                  <Card className="border-0 shadow-sm bg-white">
                    <CardHeader>
                      <CardTitle className="text-xl text-gray-800">更新头像</CardTitle>
                      <CardDescription>上传新的头像图片</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <AvatarUpload
                        currentAvatar={user.avatar}
                        onAvatarChange={handleAvatarChange}
                        onCancel={() => setShowAvatarForm(false)}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            </CardContent>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-gray-50">
        <Sidebar className="border-r border-gray-200 bg-white shadow-sm w-80 flex-shrink-0">
          <SidebarHeader className="border-b border-gray-200 p-6 bg-gradient-to-r from-green-50 to-emerald-50">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl overflow-hidden border-2 border-white shadow-lg">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt="用户头像" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">个人中心</h2>
                <p className="text-sm text-gray-600">欢迎回来，{user.username}</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2">
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton 
                        onClick={() => setActiveMenu(item.id)}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-100 transition-all duration-200 ${
                          activeMenu === item.id 
                            ? 'bg-green-100 text-green-700 border border-green-200 shadow-sm' 
                            : 'text-gray-700 hover:text-gray-900'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${
                          activeMenu === item.id 
                            ? 'bg-green-200 text-green-600' 
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          <item.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-semibold text-base">{item.title}</div>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-gray-200 p-4 bg-gray-50">
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full justify-start h-12 text-gray-700 hover:text-gray-900 hover:bg-white border-gray-300"
              >
                <Home className="h-5 w-5 mr-3" />
                返回首页
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="w-full justify-start h-12 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
              >
                <LogOut className="h-5 w-5 mr-3" />
                退出登录
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 min-w-0 overflow-auto">
          <div className="w-full h-full p-8 pl-20">
            {/* 顶部导航 */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {menuItems.find(item => item.id === activeMenu)?.title || '个人中心'}
                </h1>
              </div>
              <SidebarTrigger className="lg:hidden p-3 bg-white rounded-lg border border-gray-200 shadow-sm" />
            </div>

            {/* 动态内容区域 */}
            {renderContent()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}
