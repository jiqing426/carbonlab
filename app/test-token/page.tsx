'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { appTokenService } from '@/lib/services/app-token-service'
import { getUsers } from '@/lib/api/users'
import { getRoles } from '@/lib/api/roles'
import { API_CONFIG } from '@/lib/config/api'

export default function TestTokenPage() {
  const [tokenInfo, setTokenInfo] = useState<any>(null)
  const [userData, setUserData] = useState<any>(null)
  const [roleData, setRoleData] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  // 检查localStorage中的数据
  useEffect(() => {
    const checkLocalStorage = () => {
      const data: any = {}
      
      // 检查user-store
      try {
        const userStore = localStorage.getItem('user-store')
        if (userStore) {
          data.userStore = JSON.parse(userStore)
        }
      } catch (e) {
        console.error('解析user-store失败:', e)
      }
      
      // 检查userData
      try {
        const userData = localStorage.getItem('userData')
        if (userData) {
          data.userData = JSON.parse(userData)
        }
      } catch (e) {
        console.error('解析userData失败:', e)
      }
      
      // 检查其他可能的存储
      const keys = Object.keys(localStorage)
      data.allKeys = keys
      
      setUserData(data)
    }
    
    checkLocalStorage()
  }, [])

  // 测试获取token
  const testGetToken = async () => {
    try {
      setLoading(true)
      const appKey = API_CONFIG.APP.APP_KEY
      console.log('测试获取token，appKey:', appKey)
      
      const token = await appTokenService.getValidAppToken(appKey)
      console.log('获取到的token:', token)
      
      setTokenInfo({
        appKey,
        token,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('获取token失败:', error)
      setTokenInfo({
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  // 测试API调用
  const testAPI = async () => {
    try {
      setLoading(true)
      const appKey = API_CONFIG.APP.APP_KEY
      
      console.log('测试用户API调用...')
      const usersResponse = await getUsers({ page: 0, size: 10 }, appKey)
      console.log('用户API响应:', usersResponse)
      
      console.log('测试角色API调用...')
      const rolesResponse = await getRoles({ page: 0, size: 10 }, appKey)
      console.log('角色API响应:', rolesResponse)
      
      setRoleData({
        users: usersResponse,
        roles: rolesResponse,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('API调用失败:', error)
      setRoleData({
        error: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Token测试页面</h1>
      
      {/* 配置信息 */}
      <Card>
        <CardHeader>
          <CardTitle>配置信息</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><strong>APP_KEY:</strong> {API_CONFIG.APP.APP_KEY}</p>
            <p><strong>APP_SECRET:</strong> {API_CONFIG.APP.APP_SECRET}</p>
            <p><strong>BASE_URL:</strong> {API_CONFIG.BASE_URL}</p>
          </div>
        </CardContent>
      </Card>

      {/* 测试按钮 */}
      <div className="flex gap-4">
        <Button onClick={testGetToken} disabled={loading}>
          {loading ? '测试中...' : '测试获取Token'}
        </Button>
        <Button onClick={testAPI} disabled={loading}>
          {loading ? '测试中...' : '测试API调用'}
        </Button>
      </div>

      {/* Token信息 */}
      {tokenInfo && (
        <Card>
          <CardHeader>
            <CardTitle>Token信息</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto">
              {JSON.stringify(tokenInfo, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* 用户数据 */}
      {userData && (
        <Card>
          <CardHeader>
            <CardTitle>LocalStorage数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(userData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* API响应数据 */}
      {roleData && (
        <Card>
          <CardHeader>
            <CardTitle>API响应数据</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {JSON.stringify(roleData, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
