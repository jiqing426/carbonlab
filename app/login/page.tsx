'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Eye,
  EyeOff,
  Phone,
  User,
  Lock,
  MessageSquare,
  AlertCircle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useUserStore } from '@/lib/stores/user-store'
import { API_CONFIG } from '@/lib/config/api'
import { sendSmsCode, verifySmsCode } from '@/lib/api/sms'

export default function LoginPage() {
  const router = useRouter()
  const { login } = useUserStore()
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState('')
  const [phoneCode, setPhoneCode] = useState('')
  const [smsId, setSmsId] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  // 发送验证码
  const sendVerificationCode = async () => {
    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/
    if (!phoneRegex.test(phone)) {
      toast.error('请输入正确的手机号')
      return
    }

    try {
      setIsLoading(true)
      console.log('开始发送短信验证码到:', phone)
      
      // 调用真实的发送验证码API
      const result = await sendSmsCode(phone, 'login', API_CONFIG.APP.APP_KEY)
      
      console.log('短信验证码发送成功，记录ID:', result.id)
      setSmsId(parseInt(result.id))
      setCountdown(60)
      toast.success('验证码已发送，请注意查收')

      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (error) {
      console.error('发送短信验证码失败:', error)
      toast.error(error instanceof Error ? error.message : '发送验证码失败，请稍后重试')
    } finally {
      setIsLoading(false)
    }
  }

  // 用户名密码登录
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      console.log('开始登录，用户名:', username.trim())
      
      // 调用真实的登录API
      await login({
        app_key: API_CONFIG.APP.APP_KEY, // 从配置文件中获取的app_key
        username: username.trim(),
        password: password.trim()
      })
      
      console.log('登录成功，跳转到首页')
      toast.success('登录成功')
      // 登录成功后跳转到首页
      router.push('/')
    } catch (error) {
      console.error('登录失败:', error)
      setError(error instanceof Error ? error.message : '登录失败，请检查用户名和密码')
      toast.error(error instanceof Error ? error.message : '登录失败，请检查用户名和密码')
    } finally {
      setIsLoading(false)
    }
  }

  // 手机号验证码登录
  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!smsId || !phoneCode.trim()) {
      toast.error('请先发送验证码并输入验证码')
      return
    }

    try {
      setIsLoading(true)
      setError('')
      
      console.log('开始验证短信验证码，记录ID:', smsId, '验证码:', phoneCode)
      
      // 验证短信验证码
      const isValid = await verifySmsCode(smsId.toString(), phoneCode.trim(), API_CONFIG.APP.APP_KEY)
      
      if (isValid) {
        console.log('短信验证码验证成功')
        toast.success('验证码验证成功')
        
        // 这里可以调用手机号登录API
        // 目前暂时跳转到首页，实际应该调用登录API
        toast.info('手机验证码登录功能开发中，请使用用户名密码登录')
        setError('手机验证码登录功能开发中，请使用用户名密码登录')
      } else {
        console.log('短信验证码验证失败')
        toast.error('验证码错误，请重新输入')
        setError('验证码错误，请重新输入')
      }
    } catch (error) {
      console.error('验证短信验证码失败:', error)
      setError(error instanceof Error ? error.message : '验证失败，请稍后重试')
      toast.error(error instanceof Error ? error.message : '验证失败，请稍后重试')
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
          <CardTitle className='text-2xl text-center'>欢迎登录</CardTitle>
          <CardDescription className='text-center'>
            选择您喜欢的登录方式
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue='password' className='w-full'>
            <TabsList className='grid w-full grid-cols-2'>
              <TabsTrigger value='password' className='flex items-center gap-2'>
                <Lock className='h-4 w-4' />
                密码登录
              </TabsTrigger>
              <TabsTrigger value='phone' className='flex items-center gap-2' disabled>
                <Phone className='h-4 w-4' />
                验证码登录
                <span className='text-xs text-gray-400'>(暂不可用)</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value='password' className='space-y-4'>
              {error && (
                <div className='flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handlePasswordLogin} className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='username'>用户名</Label>
                  <div className='relative'>
                    <User className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='username'
                      value={username}
                      onChange={e => setUsername(e.target.value)}
                      placeholder='请输入用户名'
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
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder='请输入密码'
                      className='pl-10 pr-10'
                      required
                      disabled={isLoading}
                    />
                    <Button
                      type='button'
                      variant='ghost'
                      size='sm'
                      className='absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent'
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className='h-4 w-4 text-muted-foreground' />
                      ) : (
                        <Eye className='h-4 w-4 text-muted-foreground' />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='flex items-center justify-between'>
                  <label className='flex items-center space-x-2 text-sm'>
                    <input type='checkbox' className='rounded' />
                    <span>记住我</span>
                  </label>
                  <Button 
                    variant='link' 
                    className='px-0 text-sm'
                    onClick={() => {
                      // 这里可以实现忘记密码的逻辑
                      // 比如跳转到忘记密码页面，或者打开忘记密码弹窗
                      toast.info('忘记密码功能正在开发中，请联系管理员重置密码')
                      // 或者跳转到忘记密码页面
                      // router.push('/forgot-password')
                    }}
                  >
                    忘记密码？
                  </Button>
                </div>
                <Button type='submit' className='w-full bg-green-600 hover:bg-green-700' disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value='phone' className='space-y-4'>
              <div className='flex items-center gap-2 p-3 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md'>
                <AlertCircle className='h-4 w-4' />
                <span>短信验证码登录功能暂时不可用，请使用用户名密码登录</span>
              </div>
              
              {error && (
                <div className='flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md'>
                  <AlertCircle className='h-4 w-4' />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handlePhoneLogin} className='space-y-4 opacity-50 pointer-events-none'>
                <div className='space-y-2'>
                  <Label htmlFor='phone'>手机号</Label>
                  <div className='relative'>
                    <Phone className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                    <Input
                      id='phone'
                      type='tel'
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder='请输入手机号'
                      className='pl-10'
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='code'>验证码</Label>
                  <div className='flex space-x-2'>
                    <div className='relative flex-1'>
                      <MessageSquare className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                      <Input
                        id='code'
                        placeholder='请输入验证码'
                        className='pl-10'
                        value={phoneCode}
                        onChange={e => setPhoneCode(e.target.value)}
                        required
                      />
                    </div>
                    <Button
                      type='button'
                      variant='outline'
                      onClick={sendVerificationCode}
                      disabled={countdown > 0 || isLoading}
                      className='whitespace-nowrap'
                    >
                      {countdown > 0 ? `${countdown}s` : '发送验证码'}
                    </Button>
                  </div>
                </div>
                <Button type='submit' className='w-full bg-green-600 hover:bg-green-700' disabled={isLoading}>
                  {isLoading ? '登录中...' : '登录'}
                </Button>
                
                {/* 调试按钮 - 仅用于调试 */}
                <Button
                  type='button'
                  variant='outline'
                  className='w-full mt-2'
                  onClick={() => {
                    console.log('=== 短信发送调试信息 ===')
                    console.log('当前手机号:', phone)
                    console.log('当前APP_KEY:', API_CONFIG.APP.APP_KEY)
                    console.log('当前环境:', process.env.NODE_ENV)
                    console.log('API基础URL:', process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com')
                    toast.info('调试信息已输出到控制台')
                  }}
                >
                  调试信息
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className='mt-6 text-center text-sm text-muted-foreground hidden'>
            还没有账号？{' '}
            <Link href='/register'>
              <Button variant='link' className='px-0 text-sm'>
                立即注册
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
