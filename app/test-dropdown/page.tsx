'use client'

import { Button } from '@/components/ui/button'
import { Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export default function TestDropdownPage() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <h1 className="text-3xl font-bold text-center mb-8">下拉菜单测试页面</h1>
      
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">桌面版下拉菜单测试</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                我的
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">移动版下拉菜单测试</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="w-full max-w-xs bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2">
                <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                  <div className="w-full h-full bg-white/20 flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                </div>
                我的
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="cursor-pointer">
                <Settings className="h-4 w-4 mr-2" />
                个人中心
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                退出登录
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">功能说明</h2>
          <div className="bg-gray-50 p-4 rounded-lg text-left max-w-2xl mx-auto">
            <p className="mb-2"><strong>测试步骤：</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600">
              <li>点击"我的"按钮，应该显示下拉菜单</li>
              <li>下拉菜单包含"个人中心"和"退出登录"两个选项</li>
              <li>菜单项有相应的图标和样式</li>
              <li>退出登录选项显示为红色</li>
              <li>点击菜单外部应该关闭下拉菜单</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}


