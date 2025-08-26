'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { createUser } from '@/lib/api/users'
import { authAPI } from '@/lib/api/auth'
import { API_CONFIG } from '@/lib/config/api'

export default function TestAuthPage() {
  const [createUserForm, setCreateUserForm] = useState({
    username: '',
    phone: '',
    password: ''
  })
  
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: ''
  })
  
  const [testResults, setTestResults] = useState<string[]>([])

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  // 测试创建用户
  const testCreateUser = async () => {
    try {
      addResult('开始测试创建用户...')
      
      if (!createUserForm.username.trim()) {
        addResult('❌ 用户名为空')
        toast.error('用户名不能为空')
        return
      }

      const userData = {
        username: createUserForm.username.trim(),
        phone: createUserForm.phone.trim() || undefined,
        password_encrypted: createUserForm.password.trim() || undefined
      }
      
      addResult(`创建用户数据: ${JSON.stringify(userData)}`)
      addResult(`使用的APP_KEY: ${API_CONFIG.APP.APP_KEY}`)
      
      const result = await createUser(userData, API_CONFIG.APP.APP_KEY)
      
      addResult(`✅ 创建用户成功: ${JSON.stringify(result)}`)
      toast.success('创建用户成功')
      
      // 清空表单
      setCreateUserForm({ username: '', phone: '', password: '' })
      
    } catch (error: any) {
      const errorMessage = error.message || '创建用户失败'
      addResult(`❌ 创建用户失败: ${errorMessage}`)
      toast.error(`创建用户失败: ${errorMessage}`)
    }
  }

  // 测试用户登录
  const testUserLogin = async () => {
    try {
      addResult('开始测试用户登录...')
      
      if (!loginForm.username.trim() || !loginForm.password.trim()) {
        addResult('❌ 用户名或密码为空')
        toast.error('请输入用户名和密码')
        return
      }

      const credentials = {
        app_key: API_CONFIG.APP.APP_KEY,
        username: loginForm.username.trim(),
        password: loginForm.password.trim()
      }
      
      addResult(`登录凭据: ${JSON.stringify({ ...credentials, password: '***' })}`)
      addResult(`使用的APP_KEY: ${API_CONFIG.APP.APP_KEY}`)
      
      const result = await authAPI.loginWithUsernamePassword(credentials)
      
      addResult(`✅ 登录成功: ${JSON.stringify(result)}`)
      toast.success('登录成功')
      
      // 清空表单
      setLoginForm({ username: '', password: '' })
      
    } catch (error: any) {
      const errorMessage = error.message || '登录失败'
      addResult(`❌ 登录失败: ${errorMessage}`)
      toast.error(`登录失败: ${errorMessage}`)
    }
  }

  // 测试App Token获取
  const testAppToken = async () => {
    try {
      addResult('开始测试App Token获取...')
      addResult(`使用的APP_KEY: ${API_CONFIG.APP.APP_KEY}`)
      
      // 这里可以添加App Token获取的测试
      addResult('App Token测试功能开发中...')
      
    } catch (error: any) {
      const errorMessage = error.message || 'App Token测试失败'
      addResult(`❌ App Token测试失败: ${errorMessage}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">认证系统测试页面</h1>
          <p className="text-gray-600 mt-2">用于测试用户创建、登录和权限系统</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 创建用户测试 */}
          <Card>
            <CardHeader>
              <CardTitle>测试创建用户</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="create-username">用户名 *</Label>
                <Input
                  id="create-username"
                  value={createUserForm.username}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <Label htmlFor="create-phone">手机号（可选）</Label>
                <Input
                  id="create-phone"
                  value={createUserForm.phone}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <Label htmlFor="create-password">密码（可选）</Label>
                <Input
                  id="create-password"
                  type="password"
                  value={createUserForm.password}
                  onChange={(e) => setCreateUserForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="请输入密码"
                />
              </div>
              <Button onClick={testCreateUser} className="w-full">
                测试创建用户
              </Button>
            </CardContent>
          </Card>

          {/* 用户登录测试 */}
          <Card>
            <CardHeader>
              <CardTitle>测试用户登录</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="login-username">用户名</Label>
                <Input
                  id="login-username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                  placeholder="请输入用户名"
                />
              </div>
              <div>
                <Label htmlFor="login-password">密码</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="请输入密码"
                />
              </div>
              <Button onClick={testUserLogin} className="w-full">
                测试用户登录
              </Button>
            </CardContent>
          </Card>

          {/* App Token测试 */}
          <Card>
            <CardHeader>
              <CardTitle>测试App Token</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-gray-600">
                测试App Token获取和验证功能
              </div>
              <Button onClick={testAppToken} className="w-full">
                测试App Token
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* 测试结果 */}
        <Card>
          <CardHeader>
            <CardTitle>测试结果日志</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
              {testResults.length === 0 ? (
                <div className="text-gray-500">暂无测试结果，请开始测试...</div>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="mb-1">
                    {result}
                  </div>
                ))
              )}
            </div>
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => setTestResults([])}
                size="sm"
              >
                清空日志
              </Button>
              <div className="text-sm text-gray-600">
                共 {testResults.length} 条测试记录
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
