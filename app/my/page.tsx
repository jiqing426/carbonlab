'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MyPageRedirect() {
  const router = useRouter()

  useEffect(() => {
    // 重定向到新的个人中心路径
    router.replace('/dashboard/home')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在跳转到个人中心...</p>
      </div>
    </div>
  )
}
