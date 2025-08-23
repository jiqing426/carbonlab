# 登录拦截弹窗功能

## 概述

本功能实现了统一的登录拦截机制，当用户在未登录状态下尝试访问需要登录的功能时，会显示一个统一样式的弹窗提示用户登录，而不是简单的toast通知。

## 功能特点

### 🎨 统一的视觉设计
- 弹窗显示在页面右上角，与未开放功能弹窗保持一致的位置和样式
- 使用相同的背景遮罩、圆角、阴影等视觉元素
- 图标使用蓝色的登录图标，区别于未开放功能的琥珀色警告图标

### 🚀 用户体验优化
- **无页面跳转**: 弹窗在当前页面显示，不会打断用户的浏览体验
- **操作便捷**: 提供"立即登录"和"我是游客，仅浏览"两个操作选项
- **信息清晰**: 根据不同功能类型显示相应的提示信息
- **游客友好**: "我是游客，仅浏览"按钮让用户可以轻松关闭弹窗继续浏览

### 🔧 技术实现
- 基于React Hook状态管理，支持动画过渡效果
- **使用React Portal**: 通过`createPortal`将弹窗渲染到`document.body`，确保弹窗在最顶层显示
- **固定定位**: 使用`fixed`定位确保弹窗相对于视口定位，不受父元素影响
- **最高层级**: 使用`z-[9999]`确保弹窗显示在所有其他元素之上
- 支持键盘ESC键关闭和点击遮罩关闭

## 组件架构

### LoginRequiredModal 组件
```tsx
interface LoginRequiredModalProps {
  isOpen: boolean;           // 控制弹窗显示/隐藏
  onClose: () => void;       // 关闭弹窗回调
  message?: string;          // 自定义提示信息
  featureName?: string;      // 功能名称，用于生成默认提示信息
}
```

### 集成组件
- **ExperimentLink**: 用于实验链接的登录拦截（必须登录）
- **课程链接**: 使用普通的Link组件，无需登录即可访问

## 使用方法

### 基本用法

```tsx
import { ExperimentLink } from "@/components/ui/feature-link";
import Link from 'next/link';

// 实验链接 - 需要登录
<ExperimentLink 
  href="/experiments/carbon-footprint" 
  experimentName="产品碳足迹分析"
  className="btn-primary"
>
  开始实验
</ExperimentLink>

// 课程链接 - 无需登录
<Link 
  href="/courses/carbon-basics" 
  className="btn-primary"
>
  开始学习
</Link>
```

### 自定义弹窗

```tsx
import { LoginRequiredModal } from "@/components/ui/login-required-modal";

function MyComponent() {
  const [showModal, setShowModal] = useState(false);
  
  return (
    <>
      <button onClick={() => setShowModal(true)}>
        访问受保护功能
      </button>
      
      <LoginRequiredModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        message="请先登录后再访问高级功能"
        featureName="高级分析工具"
      />
    </>
  );
}
```

## 弹窗样式

### 位置和尺寸
- **位置**: 固定在页面右上角 (`top-4 right-4`)
- **最大宽度**: 384px (`max-w-md`)
- **响应式**: 在小屏幕上自动适配边距

### 视觉元素
- **背景**: 白色背景 + 灰色边框
- **阴影**: `shadow-xl` 提供立体感
- **圆角**: `rounded-lg` 现代化外观
- **图标**: 蓝色登录图标 (`text-blue-500`)

### 动画效果
- **进入**: 透明度从0到100%的淡入效果
- **退出**: 透明度从100%到0的淡出效果
- **持续时间**: 200ms的平滑过渡

## 行为逻辑

### 触发条件
1. 用户未登录 (`!isLoggedIn`)
2. 点击需要登录的功能链接
3. 阻止默认的页面跳转行为

### 用户操作
1. **立即登录**: 关闭弹窗并跳转到登录页面 (`/login`)
2. **我是游客，仅浏览**: 关闭弹窗，用户可以继续浏览其他内容
3. **点击遮罩**: 关闭弹窗
4. **点击X按钮**: 关闭弹窗

### 状态管理
- 使用 `useUserStore` 获取登录状态
- 使用 `useState` 管理弹窗显示状态
- 使用 `useRouter` 处理页面导航

## 适用场景

### 主要应用
- **实验功能**: 碳足迹分析、碳交易模拟等实验功能（必须登录）
- **课程学习**: 所有课程内容无需登录，游客可直接访问
- **高级功能**: 需要用户身份验证的高级工具

### 扩展应用
- 可以轻松扩展到其他需要登录验证的功能
- 支持自定义提示信息和功能名称
- 可以集成到任何React组件中

## 技术细节

### 依赖项
- React Hooks (`useState`, `useEffect`)
- React DOM (`createPortal`)
- Next.js Router (`useRouter`)
- Lucide React Icons
- Tailwind CSS
- Zustand Store (`useUserStore`)

### 性能优化
- 使用条件渲染避免不必要的DOM创建
- 动画使用CSS transition而非JavaScript动画
- 组件懒加载，只在需要时渲染弹窗

### 可访问性
- 支持键盘导航
- 语义化的HTML结构
- 适当的ARIA属性
- 高对比度的视觉设计

## 问题解决

### 弹窗定位问题
如果弹窗没有显示在页面右上角，而是显示在父容器内部，这通常是由以下原因造成的：

#### 问题原因
- 使用了`absolute`定位而不是`fixed`定位
- 没有使用React Portal，导致弹窗受父元素定位影响
- z-index层级不够高

#### 解决方案
```tsx
// ✅ 正确的实现方式
return createPortal(
  <div className="fixed inset-0 z-[9999]">
    <div className="fixed top-4 right-4">
      {/* 弹窗内容 */}
    </div>
  </div>,
  document.body
);

// ❌ 错误的实现方式
return (
  <div className="absolute inset-0 z-50">
    <div className="absolute top-4 right-4">
      {/* 弹窗内容 */}
    </div>
  </div>
);
```

### 测试页面
访问 `/test-login-modal` 可以测试弹窗的显示效果和位置是否正确。

## 维护说明

### 样式更新
如需修改弹窗样式，请编辑 `components/ui/login-required-modal.tsx` 文件中的Tailwind CSS类。

### 功能扩展
如需添加新的登录拦截功能，可以参考 `ExperimentLink` 的实现模式。

### 消息定制
默认消息格式为："请先登录后再开始{featureName}"，可通过 `message` 属性完全自定义。
