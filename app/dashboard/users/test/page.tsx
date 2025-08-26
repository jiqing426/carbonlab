"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestPage() {
  const router = useRouter()

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 p-6">
      <Card>
        <CardHeader>
          <CardTitle>用户路由测试页面</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>这是一个测试页面，用于验证用户相关的路由是否正常工作。</p>
          
          <div className="flex gap-4">
            <Button onClick={() => router.push('/dashboard/users')}>
              返回用户列表
            </Button>
            <Button onClick={() => router.push('/dashboard/users/1')}>
              查看用户1详情
            </Button>
            <Button onClick={() => router.push('/dashboard/users/2')}>
              查看用户2详情
            </Button>
            <Button onClick={() => router.push('/dashboard/home')}>
              返回主页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
