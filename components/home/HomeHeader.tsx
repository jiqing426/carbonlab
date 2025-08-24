"use client"

import { useEffect, useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, User, Settings, LogOut, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useUserStore } from "@/lib/stores/user-store"
import { toast } from "sonner"
import { getSearchSuggestions } from "@/lib/utils/search"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function HomeHeader() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const searchRef = useRef<HTMLDivElement>(null)
  const { isLoggedIn, user, logout } = useUserStore()

  const handleLogout = () => {
    logout()
    toast.success('已退出登录')
    router.push('/')
  }

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const mobileMenu = document.getElementById("mobile-menu")

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden")
      })
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const anchorElement = e.currentTarget as HTMLAnchorElement;
        const href = anchorElement?.getAttribute("href");
        if (href) {
          const element = document.querySelector(href)
          if (element) {
            element.scrollIntoView({
              behavior: "smooth",
            })

            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
              mobileMenu.classList.add("hidden")
            }
          }
        }
      })
    })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      setShowSuggestions(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchQuery(value)
    
    if (value.trim()) {
      const newSuggestions = getSearchSuggestions(value)
      setSuggestions(newSuggestions)
      setShowSuggestions(newSuggestions.length > 0)
    } else {
      setShowSuggestions(false)
      setSuggestions([])
    }
  }

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    router.push(`/search?q=${encodeURIComponent(suggestion)}`)
  }

  // 点击外部关闭搜索建议
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className="bg-green-50/80 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <span className="text-2xl font-semibold text-green-800">
              <i className="fas fa-leaf mr-2 text-green-600"></i>
              碳经济与管理AI实训平台
            </span>
          </div>
          {/* Desktop navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <a
              href="#about"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              关于平台
            </a>
            <a
              href="#courses"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              热门课程
            </a>
            <a
              href="#experiments"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              热门实验
            </a>
            <a
              href="#news"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              双碳快讯
            </a>
            <a
              href="#insight"
              className="px-3 py-2 rounded-md text-base font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
            >
              数智洞察
            </a>
            <form onSubmit={handleSearch} className="relative flex gap-2">
              <div className="relative" ref={searchRef}>
                <Input
                  type="search"
                  placeholder="搜索课程、实验..."
                  className="w-[160px] pl-9 text-sm"
                  value={searchQuery}
                  onChange={handleInputChange}
                />
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                
                {/* 搜索建议 */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1 min-w-[200px]">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={index}
                        className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <Button 
                type="submit"
                className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm"
              >
                搜索
              </Button>
            </form>
            
            {/* 用户登录按钮 */}
            <div className="flex items-center space-x-2 ml-4">
              {isLoggedIn ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      className="bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2"
                    >
                      <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                        {user?.avatar ? (
                          <img 
                            src={user.avatar} 
                            alt="用户头像" 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-white/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      我的
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem
                      onClick={() => router.push("/dashboard/home")}
                      className="cursor-pointer"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      个人中心
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      退出登录
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white font-medium text-base"
                  onClick={() => {
                    // 跳转到登录页面
                    router.push("/login");
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  登录
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center md:hidden">
            <button
              id="mobile-menu-button"
              className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-50 focus:outline-none"
            >
              <i className="fas fa-bars"></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div id="mobile-menu" className="hidden md:hidden bg-white shadow-sm">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <form onSubmit={handleSearch} className="relative px-3 py-2 flex gap-2">
            <div className="relative flex-1">
              <Input
                type="search"
                placeholder="搜索课程、实验..."
                className="w-full pl-9 text-sm"
                value={searchQuery}
                onChange={handleInputChange}
              />
              <Search className="absolute left-5 top-4 h-4 w-4 text-gray-500" />
              
              {/* 移动版搜索建议 */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 mt-1">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm text-gray-700 border-b border-gray-100 last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      {suggestion}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Button 
              type="submit"
              className="h-10 px-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-sm"
            >
              搜索
            </Button>
          </form>
          
          {/* 移动版登录按钮 */}
          <div className="px-3 py-2">
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2"
                  >
                    <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="用户头像" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-white/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                    </div>
                    我的
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => router.push("/dashboard/home")}
                    className="cursor-pointer"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    个人中心
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    退出登录
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-base"
                onClick={() => {
                  // 跳转到登录页面
                  router.push("/login");
                }}
              >
                <User className="h-4 w-4 mr-2" />
                登录
              </Button>
            )}
          </div>
          
          <a
            href="#about"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            关于平台
          </a>
          <a
            href="#courses"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            热门课程
          </a>
          <a
            href="#experiments"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            热门实验
          </a>
          <a
            href="#news"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            双碳快讯
          </a>
          <a
            href="#insight"
            className="block px-3 py-2 rounded-md text-lg font-bold text-gray-700 hover:text-indigo-600 hover:bg-gray-50"
          >
            数智洞察
          </a>
        </div>
      </div>
    </nav>
  )
}
