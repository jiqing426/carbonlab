# 用户下拉菜单功能说明

## 功能概述

用户下拉菜单功能为登录后的用户提供了便捷的导航选项，包括"个人中心"和"退出登录"两个主要功能。用户可以通过鼠标悬停或点击"我的"按钮来访问这些选项。

## 功能特性

### 1. 下拉菜单触发
- **触发方式**: 点击"我的"按钮
- **视觉提示**: 按钮右侧显示向下箭头图标
- **响应式设计**: 支持桌面版和移动版

### 2. 菜单选项
- **个人中心**: 跳转到用户个人中心页面
- **退出登录**: 退出当前用户登录状态
- **分隔线**: 两个选项之间有清晰的分隔

### 3. 样式设计
- **图标支持**: 每个选项都有相应的图标
- **颜色区分**: 退出登录选项使用红色突出显示
- **悬停效果**: 鼠标悬停时有视觉反馈

## 技术实现

### 1. 组件结构
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button>我的</Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent>
    <DropdownMenuItem>个人中心</DropdownMenuItem>
    <DropdownMenuSeparator />
    <DropdownMenuItem>退出登录</DropdownMenuItem>
  </DropdownMenuContent>
</DropdownMenu>
```

### 2. 导入的组件
```typescript
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
```

### 3. 图标导入
```typescript
import { Settings, LogOut, ChevronDown } from 'lucide-react'
```

## 使用方法

### 1. 桌面版
- 在首页右上角找到"我的"按钮
- 点击按钮显示下拉菜单
- 选择"个人中心"进入个人中心页面
- 选择"退出登录"退出登录状态

### 2. 移动版
- 在移动端菜单中找到"我的"按钮
- 点击按钮显示下拉菜单
- 功能与桌面版相同

## 代码实现

### 1. 桌面版下拉菜单
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2">
      <div className="w-6 h-6 rounded-full overflow-hidden border border-white">
        {user?.avatar ? (
          <img src={user.avatar} alt="用户头像" className="w-full h-full object-cover" />
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
```

### 2. 移动版下拉菜单
```typescript
<DropdownMenu>
  <DropdownMenuTrigger asChild>
    <Button className="w-full bg-green-600 hover:bg-green-700 text-white font-medium text-base flex items-center gap-2">
      {/* 头像和文字内容 */}
      我的
      <ChevronDown className="h-4 w-4 ml-1" />
    </Button>
  </DropdownMenuTrigger>
  <DropdownMenuContent align="end" className="w-48">
    {/* 菜单选项 */}
  </DropdownMenuContent>
</DropdownMenu>
```

## 样式特性

### 1. 按钮样式
- **背景色**: `bg-green-600` (绿色)
- **悬停效果**: `hover:bg-green-700` (深绿色)
- **文字颜色**: `text-white` (白色)
- **字体大小**: `text-base` (基础大小)

### 2. 下拉菜单样式
- **宽度**: `w-48` (192px)
- **对齐方式**: `align="end"` (右对齐)
- **分隔线**: 使用 `DropdownMenuSeparator`

### 3. 菜单项样式
- **个人中心**: 默认样式，带有设置图标
- **退出登录**: 红色文字 `text-red-600`，带有退出图标

## 交互行为

### 1. 触发方式
- 点击"我的"按钮显示下拉菜单
- 点击菜单外部自动关闭下拉菜单
- 支持键盘导航

### 2. 点击行为
- **个人中心**: 跳转到 `/dashboard/home` 页面
- **退出登录**: 调用 `logout()` 函数，显示成功提示，跳转到首页

### 3. 状态管理
- 使用 `useUserStore` 管理用户状态
- 退出登录后清除用户信息
- 自动跳转到首页

## 响应式设计

### 1. 桌面版
- 按钮位于右上角导航栏
- 下拉菜单右对齐显示
- 支持鼠标悬停和点击

### 2. 移动版
- 按钮位于移动端菜单中
- 下拉菜单居中显示
- 触摸友好的交互设计

## 测试功能

### 1. 测试页面
访问 `/test-dropdown` 页面可以测试下拉菜单功能：
- 桌面版下拉菜单测试
- 移动版下拉菜单测试
- 功能说明和测试步骤

### 2. 测试要点
- 下拉菜单正常显示
- 菜单选项可点击
- 图标和样式正确
- 响应式效果良好

## 注意事项

1. **依赖组件**: 需要安装 `@radix-ui/react-dropdown-menu`
2. **图标库**: 使用 `lucide-react` 图标库
3. **状态管理**: 依赖 `useUserStore` 进行用户状态管理
4. **路由跳转**: 使用 Next.js 的 `useRouter` 进行页面跳转

## 扩展功能

### 1. 更多菜单选项
- 用户设置
- 帮助中心
- 关于我们

### 2. 个性化菜单
- 根据用户角色显示不同选项
- 动态菜单项
- 用户偏好设置

### 3. 快捷键支持
- 键盘导航
- 快捷键绑定
- 无障碍访问

## 故障排除

### 1. 菜单不显示
- 检查组件是否正确导入
- 确认 CSS 样式是否加载
- 检查 z-index 层级

### 2. 点击无响应
- 检查事件处理函数
- 确认路由配置
- 验证状态管理

### 3. 样式异常
- 检查 Tailwind CSS 配置
- 确认组件样式覆盖
- 验证响应式断点
