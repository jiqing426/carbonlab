'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  User,
  Lock,
  Mail,
  Phone,
  ArrowLeft,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('两次输入的密码不一致')
      return
    }

    if (formData.password.length < 6) {
      toast.error('密码长度至少6位')
      return
    }

    try {
      setIsLoading(true)
      // 这里可以调用实际的注册API
      // await register(formData)
      
      // 模拟注册成功
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success('注册成功！请登录')
      router.push('/login')
    } catch (error) {
      toast.error('注册失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center mb-4'>
            <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-green-600 text-white'>
              <User className='h-6 w-6' />
            </div>
          </div>
          <CardTitle className='text-2xl text-center'>用户注册</CardTitle>
          <CardDescription className='text-center'>
            创建您的账户，开始学习之旅
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='username'>用户名</Label>
              <div className='relative'>
                <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='username'
                  name='username'
                  value={formData.username}
                  onChange={handleInputChange}
                  placeholder='请输入用户名'
                  className='pl-10'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='email'>邮箱</Label>
              <div className='relative'>
                <Mail className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='email'
                  name='email'
                  type='email'
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='请输入邮箱'
                  className='pl-10'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='phone'>手机号</Label>
              <div className='relative'>
                <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='phone'
                  name='phone'
                  type='tel'
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder='请输入手机号'
                  className='pl-10'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='password'>密码</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='password'
                  name='password'
                  type='password'
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder='请输入密码'
                  className='pl-10'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <div className='space-y-2'>
              <Label htmlFor='confirmPassword'>确认密码</Label>
              <div className='relative'>
                <Lock className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                <Input
                  id='confirmPassword'
                  name='confirmPassword'
                  type='password'
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder='请再次输入密码'
                  className='pl-10'
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            
            <Button type='submit' className='w-full bg-green-600 hover:bg-green-700' disabled={isLoading}>
              {isLoading ? '注册中...' : '注册'}
            </Button>
          </form>

          <div className='mt-6 text-center text-sm text-muted-foreground'>
            已有账号？{' '}
            <Link href='/login'>
              <Button variant='link' className='px-0 text-sm'>
                立即登录
              </Button>
            </Link>
          </div>
          
          <div className='mt-4 text-center'>
            <Button
              variant='ghost'
              onClick={() => router.push('/')}
              className='text-sm text-muted-foreground hover:text-gray-900'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              返回首页
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

