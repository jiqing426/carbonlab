# 边界功能使用说明

## 概述

本项目实现了一个全局的边界功能系统，用于统一处理404页面和未开放功能，避免用户看到传统的404错误页面，而是显示友好的弹窗提示。

## 功能特性

- 🚫 **统一404处理**: 所有404页面都显示"功能暂未开放"弹窗
- 🎯 **右上角弹窗**: 弹窗位置统一在页面右上角
- 🔄 **多种操作选项**: 提供"返回上页"和"返回首页"按钮
- 🎨 **一致的设计风格**: 与整体UI风格保持一致
- 🛡️ **错误边界保护**: 捕获应用级别的错误
- 📍 **当前页面显示**: 弹框在当前页面显示，不跳转新页面

## 组件说明

### 1. ErrorBoundary (错误边界)
- 位置: `components/ui/error-boundary.tsx`
- 用途: 捕获React组件错误
- 特点: 显示全屏错误弹窗

### 2. NotFoundModal (404弹窗)
- 位置: `components/ui/not-found-modal.tsx`
- 用途: 显示功能暂未开放提示
- 特点: 右上角显示，支持自定义消息，在当前页面显示

### 3. FeatureLink (功能链接)
- 位置: `components/ui/feature-link.tsx`
- 用途: 处理未开放功能的链接点击
- 特点: 自动显示弹窗，无需手动处理，不跳转页面

## 使用方法

### 基本用法

```tsx
import { useError } from "@/contexts/error-context";

function MyComponent() {
  const { showError, handleNotFound, handleFeatureNotAvailable } = useError();

  const handleClick = () => {
    // 显示自定义错误消息
    showError("该功能正在开发中");
    
    // 或者使用预设的404处理
    handleNotFound();
    
    // 或者指定功能名称
    handleFeatureNotAvailable("用户管理");
  };

  return <button onClick={handleClick}>点击测试</button>;
}
```

### 使用FeatureLink组件

```tsx
import { FeatureLink, ExperimentLink, CourseLink } from "@/components/ui/feature-link";

// 基本用法
<FeatureLink 
  href="/some-page" 
  isAvailable={false}
  featureName="高级功能"
>
  点击进入
</FeatureLink>

// 实验链接（自动显示未开放提示）
<ExperimentLink 
  href="/experiments/advanced" 
  experimentName="高级实验"
>
  开始实验
</ExperimentLink>

// 课程链接（自动显示未开放提示）
<CourseLink 
  href="/courses/advanced" 
  courseName="高级课程"
>
  学习课程
</CourseLink>
```

### 在现有组件中集成

```tsx
// 替换现有的Link组件
import { FeatureLink } from "@/components/ui/feature-link";

// 原来的代码
<Link href="/some-page">链接</Link>

// 替换为
<FeatureLink 
  href="/some-page" 
  isAvailable={false}
  featureName="该功能"
>
  链接
</FeatureLink>
```

## 核心行为说明

### 弹框显示机制
- **当前页面显示**: 所有弹框都在当前页面显示，不会跳转到新页面
- **阻止默认行为**: 未开放功能的链接点击会被阻止，显示弹框而不是跳转
- **状态保持**: 弹框关闭后，用户仍然在当前页面，可以继续其他操作

### 用户体验优化
- **无页面跳转**: 避免了用户被带到空白页面的困惑
- **快速反馈**: 立即显示功能状态，无需等待页面加载
- **操作连贯**: 弹框关闭后可以继续在当前页面浏览

## 配置说明

### 弹窗位置
弹窗默认显示在页面右上角，可以通过修改 `NotFoundModal` 组件中的CSS类来调整位置：

```tsx
// 右上角 (默认)
<div className="absolute top-4 right-4 max-w-md w-full mx-4">

// 左上角
<div className="absolute top-4 left-4 max-w-md w-full mx-4">

// 居中
<div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-md w-full mx-4">
```

### 弹窗样式
弹窗样式可以通过修改 `NotFoundModal` 组件中的CSS类来自定义：

```tsx
// 修改背景色
<div className="bg-white rounded-lg shadow-xl border border-gray-200 p-6">

// 修改圆角
<div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">

// 修改阴影
<div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-6">
```

## 最佳实践

1. **统一使用**: 所有未开放的功能都应该使用这个系统
2. **友好提示**: 错误消息应该清晰、友好，避免技术术语
3. **操作引导**: 提供明确的后续操作选项
4. **样式一致**: 保持弹窗样式与整体设计风格一致
5. **性能考虑**: 弹窗组件使用React.memo优化渲染性能
6. **用户体验**: 确保弹框在当前页面显示，不打断用户浏览流程

## 故障排除

### 弹窗不显示
- 检查是否正确引入了 `ErrorProvider`
- 确认 `useError` Hook在组件内部使用
- 检查控制台是否有错误信息

### 弹窗位置不正确
- 检查CSS类是否正确设置
- 确认父容器的定位属性
- 验证z-index值是否足够高

### 样式问题
- 检查Tailwind CSS类是否正确
- 确认组件样式没有被覆盖
- 验证响应式设计是否正常工作

### 页面跳转问题
- 确认 `isAvailable` 属性设置正确
- 检查 `preventDefault()` 和 `stopPropagation()` 是否被调用
- 验证弹框是否在当前页面显示

## 扩展功能

### 添加新的错误类型
```tsx
// 在 useErrorHandler 中添加新的处理方法
const handleNetworkError = useCallback(() => {
  showError("网络连接异常，请检查网络设置后重试。");
}, [showError]);

// 在 ErrorContext 中暴露新方法
const value = {
  showError,
  handleNotFound,
  handleFeatureNotAvailable,
  handleNetworkError, // 新增
};
```

### 自定义弹窗内容
```tsx
// 创建自定义弹窗组件
function CustomErrorModal({ isOpen, onClose, title, content, actions }) {
  return (
    <NotFoundModal
      isOpen={isOpen}
      onClose={onClose}
      message={content}
    />
  );
}
```

## 测试验证

### 测试要点
1. **弹框显示**: 确认弹框在当前页面显示，不跳转新页面
2. **URL保持**: 验证页面URL在弹框显示期间没有改变
3. **状态保持**: 弹框关闭后，页面状态应该保持不变
4. **功能正常**: 已开放功能应该正常跳转，未开放功能显示弹框

### 测试页面
访问 `/test-boundary` 可以测试所有边界功能，包括当前页面状态显示。

## 总结

这个边界功能系统为项目提供了统一的错误处理机制，提升了用户体验，避免了传统404页面的突兀感。通过在当前页面显示弹框，用户可以：

- ✅ 立即了解功能状态
- ✅ 避免页面跳转的困惑
- ✅ 保持浏览的连贯性
- ✅ 获得友好的操作提示

通过合理使用这些组件，可以确保所有未开放功能都有友好的提示，同时保持代码的可维护性和一致性。 