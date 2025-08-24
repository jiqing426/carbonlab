'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppTokenStore } from '@/lib/stores/app-token-store'
import { toast } from 'sonner'

export default function TestAppTokenPage() {
  const { 
    appToken, 
    appTokenExpiredAt, 
    isLoading, 
    error, 
    getAppToken, 
    refreshAppToken, 
    clearAppToken,
    isTokenValid,
    getRemainingTime
  } = useAppTokenStore()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleGetToken = async () => {
    try {
      setIsRefreshing(true)
      const token = await getAppToken()
      if (token) {
        toast.success('应用token获取成功！')
      } else {
        toast.error('获取应用token失败')
      }
    } catch (error) {
      toast.error('获取应用token失败')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleRefreshToken = async () => {
    try {
      setIsRefreshing(true)
      const token = await refreshAppToken()
      if (token) {
        toast.success('应用token刷新成功！')
      } else {
        toast.error('刷新应用token失败')
      }
    } catch (error) {
      toast.error('刷新应用token失败')
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleClearToken = () => {
    clearAppToken()
    toast.success('应用token已清除')
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '无'
    return new Date(dateString).toLocaleString('zh-CN')
  }

  const getStatusColor = (isValid: boolean) => {
    return isValid ? 'text-green-600' : 'text-red-600'
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">应用Token测试页面</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>操作按钮</CardTitle>
            <CardDescription>测试应用token的各种操作</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGetToken} 
              disabled={isRefreshing}
              className="w-full"
            >
              {isRefreshing ? '获取中...' : '获取Token'}
            </Button>
            
            <Button 
              onClick={handleRefreshToken} 
              disabled={isRefreshing}
              variant="outline"
              className="w-full"
            >
              {isRefreshing ? '刷新中...' : '刷新Token'}
            </Button>
            
            <Button 
              onClick={handleClearToken} 
              variant="destructive"
              className="w-full"
            >
              清除Token
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Token状态</CardTitle>
            <CardDescription>当前应用token的状态信息</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Token:</span>
              <span className="text-sm font-mono">
                {appToken ? `${appToken.substring(0, 10)}...` : '无'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">状态:</span>
              <span className={getStatusColor(isTokenValid())}>
                {isTokenValid() ? '有效' : '无效/过期'}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">剩余时间:</span>
              <span className="text-sm">
                {getRemainingTime()} 分钟
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="font-medium">过期时间:</span>
              <span className="text-sm">
                {formatDate(appTokenExpiredAt)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>详细信息</CardTitle>
          <CardDescription>应用token的完整信息</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium mb-2">完整Token:</h3>
              <div className="bg-gray-100 p-3 rounded font-mono text-sm break-all">
                {appToken || '暂无token'}
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">过期时间:</h3>
              <div className="bg-gray-100 p-3 rounded text-sm">
                {formatDate(appTokenExpiredAt)}
              </div>
            </div>
            
            {error && (
              <div>
                <h3 className="font-medium mb-2 text-red-600">错误信息:</h3>
                <div className="bg-red-100 p-3 rounded text-red-700 text-sm">
                  {error}
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="text-center py-4">
                <div className="text-blue-600">正在加载...</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>使用说明</CardTitle>
          <CardDescription>如何测试应用token功能</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600">
            <p>1. <strong>获取Token</strong>: 点击"获取Token"按钮，系统会自动调用API获取应用token</p>
            <p>2. <strong>刷新Token</strong>: 点击"刷新Token"按钮，强制刷新应用token</p>
            <p>3. <strong>清除Token</strong>: 点击"清除Token"按钮，清除当前存储的应用token</p>
            <p>4. <strong>自动获取</strong>: 用户登录成功后，系统会自动获取应用token</p>
            <p>5. <strong>状态监控</strong>: 实时显示token的有效状态和剩余有效期</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

