# 学习统计功能使用说明

## 功能概述

学习统计功能可以自动跟踪用户在课程和实验中的学习活动，包括：
- 课程开始/完成
- 实验开始/完成  
- 学习时长统计
- 周学习进度可视化
- 最近学习活动记录

## 使用方法

### 1. 在课程页面中记录学习活动

```typescript
import { trackCourseStart, trackCourseComplete, trackStudyTime } from '@/lib/utils/learning-tracker'

// 用户开始学习课程
trackCourseStart('碳交易模拟实验')

// 用户完成课程
trackCourseComplete('碳交易模拟实验')

// 记录学习时长（分钟）
trackStudyTime('碳交易模拟实验', 45)
```

### 2. 在实验页面中记录学习活动

```typescript
import { trackExperimentStart, trackExperimentComplete } from '@/lib/utils/learning-tracker'

// 用户开始实验
trackExperimentStart('ESG报告生成实验')

// 用户完成实验
trackExperimentComplete('ESG报告生成实验')
```

### 3. 在组件中使用

```typescript
import { trackLearningActivity } from '@/lib/utils/learning-tracker'

// 在课程组件中
const handleCourseStart = () => {
  trackLearningActivity({
    type: 'course_start',
    title: '课程名称',
    duration: 0
  })
}

// 在实验组件中
const handleExperimentComplete = () => {
  trackLearningActivity({
    type: 'experiment_complete',
    title: '实验名称',
    duration: 30
  })
}
```

## 支持的活动类型

- `course_start`: 开始课程
- `experiment_start`: 开始实验
- `study_time`: 学习时长
- `course_complete`: 完成课程
- `experiment_complete`: 完成实验

## 数据存储

学习统计数据会自动保存到：
1. **localStorage**: 作为本地备份
2. **消息传递**: 通过postMessage发送到统计页面
3. **实时更新**: 统计页面自动监听并更新显示

## 统计内容

### 概览统计
- 总课程数
- 总实验数
- 总学习时长（小时）
- 已完成项目数

### 周学习进度
- 每日学习时长柱状图
- 实时更新进度

### 最近学习活动
- 最近10个学习活动
- 活动类型、标题、时间、时长

## 注意事项

1. **学习时长单位**: 所有时长都以分钟为单位记录
2. **数据持久化**: 数据会保存到localStorage，刷新页面不会丢失
3. **实时更新**: 统计页面会实时显示最新的学习数据
4. **跨页面通信**: 支持从其他页面发送学习活动消息

## 示例场景

### 场景1: 用户开始学习课程
```typescript
// 在课程页面加载时
useEffect(() => {
  trackCourseStart('碳交易基础理论')
}, [])
```

### 场景2: 用户完成实验
```typescript
// 在实验完成时
const handleComplete = () => {
  trackExperimentComplete('ESG报告生成')
  // 其他完成逻辑...
}
```

### 场景3: 记录学习时长
```typescript
// 在用户离开页面时记录学习时长
useEffect(() => {
  const startTime = Date.now()
  
  return () => {
    const duration = Math.round((Date.now() - startTime) / 60000) // 转换为分钟
    trackStudyTime('当前页面标题', duration)
  }
}, [])
```

## 技术实现

- 使用 `postMessage` 进行跨页面通信
- 使用 `localStorage` 进行数据持久化
- 使用 `useEffect` 监听消息事件
- 支持实时数据更新和可视化展示


