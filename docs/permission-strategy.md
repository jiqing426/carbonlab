# 平台权限策略说明

## 概述

本平台采用分层权限策略，为不同类型的用户提供差异化的访问体验：

- **游客用户**: 可以浏览所有课程内容，但无法访问实验功能
- **登录用户**: 可以访问所有课程内容和实验功能

## 权限矩阵

| 功能类型 | 游客访问 | 登录用户访问 | 说明 |
|---------|---------|-------------|------|
| **课程浏览** | ✅ 完全访问 | ✅ 完全访问 | 所有课程内容无需登录 |
| **课程学习** | ✅ 完全访问 | ✅ 完全访问 | 课程视频、文档、测验等 |
| **实验功能** | ❌ 无法访问 | ✅ 完全访问 | 需要登录验证 |
| **个人中心** | ❌ 无法访问 | ✅ 完全访问 | 需要登录验证 |
| **学习统计** | ❌ 无法访问 | ✅ 完全访问 | 需要登录验证 |

## 实现方式

### 1. 课程功能（无需登录）

#### 组件实现
```tsx
// 使用普通的Next.js Link组件
import Link from 'next/link';

<Link
  href={`/courses/${course.id}`}
  className="btn-primary"
>
  开始学习
</Link>
```

#### 适用场景
- 课程列表页面
- 课程详情页面
- 课程内容播放
- 课程文档下载

### 2. 实验功能（需要登录）

#### 组件实现
```tsx
// 使用ExperimentLink组件，自动拦截未登录用户
import { ExperimentLink } from "@/components/ui/feature-link";

<ExperimentLink
  href="/experiments/carbon-footprint"
  experimentName="产品碳足迹分析"
  className="btn-primary"
>
  开始实验
</ExperimentLink>
```

#### 登录拦截行为
1. **未登录用户**: 点击后显示登录弹窗，弹窗位于页面右上角
2. **已登录用户**: 直接跳转到实验页面
3. **弹窗内容**: "需要登录 - 请先登录后再开始[实验名称]"
4. **用户选择**: 可以选择"立即登录"或"我是游客，仅浏览"

### 3. 其他受保护功能

#### 个人中心
- 路径: `/dashboard/home`
- 访问方式: 通过首页"我的"按钮的下拉菜单
- 权限要求: 必须登录

#### 学习统计
- 路径: `/dashboard/home` 页面中的"学习统计"标签
- 功能: 跟踪学习进度、时长统计
- 权限要求: 必须登录

## 用户体验设计

### 游客用户
- **引导登录**: 通过实验功能的登录弹窗引导用户注册/登录
- **内容预览**: 可以浏览所有课程内容，了解平台价值
- **功能限制**: 明确告知哪些功能需要登录

### 登录用户
- **完整功能**: 访问所有课程和实验功能
- **个性化**: 学习进度跟踪、个人设置等
- **数据同步**: 学习数据跨设备同步

## 技术实现

### 登录状态管理
```tsx
import { useUserStore } from "@/lib/stores/user-store";

const { isLoggedIn, user } = useUserStore();
```

### 条件渲染
```tsx
{isLoggedIn ? (
  <ExperimentLink href="/experiments/..." experimentName="...">
    开始实验
  </ExperimentLink>
) : (
  <Button onClick={() => setShowLoginModal(true)}>
    开始实验
  </Button>
)}
```

### 路由保护
```tsx
// 在需要保护的页面组件中
useEffect(() => {
  if (!isLoggedIn) {
    router.push('/login');
  }
}, [isLoggedIn, router]);
```

## 权限策略优势

### 1. 用户转化
- 游客可以充分了解平台内容价值
- 通过功能限制自然引导用户注册
- 降低注册门槛，提高转化率

### 2. 内容安全
- 实验功能需要身份验证，保护核心功能
- 课程内容开放访问，提高平台影响力
- 平衡开放性和安全性

### 3. 用户体验
- 清晰的权限边界，用户知道能做什么
- 友好的登录提示，不会强制跳转
- 保持用户在当前页面的浏览状态

## 扩展说明

### 添加新的受保护功能
```tsx
// 1. 创建新的拦截组件
export function ProtectedFeatureLink({ href, children, featureName }) {
  const { isLoggedIn } = useUserStore();
  const [showModal, setShowModal] = useState(false);
  
  const handleClick = (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    router.push(href);
  };
  
  return (
    <>
      <a href={href} onClick={handleClick}>{children}</a>
      <LoginRequiredModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName={featureName}
      />
    </>
  );
}
```

### 修改权限策略
如需调整权限策略，请修改相应的组件实现：
- 课程权限: 修改 `CourseCard` 组件
- 实验权限: 修改 `ExperimentLink` 组件
- 其他功能: 参考上述模式实现

## 测试验证

### 测试页面
访问 `/test-login-modal` 可以测试：
- 课程链接的游客访问
- 实验链接的登录拦截
- 弹窗位置和样式

### 测试要点
1. **游客模式**: 课程可访问，实验显示登录弹窗
2. **登录模式**: 所有功能正常访问
3. **弹窗位置**: 显示在页面右上角
4. **弹窗内容**: 正确的功能名称和提示信息
