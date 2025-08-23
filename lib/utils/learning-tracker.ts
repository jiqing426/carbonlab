// 学习统计跟踪工具
export interface LearningActivity {
  type: 'course_start' | 'experiment_start' | 'study_time' | 'course_complete' | 'experiment_complete'
  title: string
  duration?: number // 学习时长（分钟）
  metadata?: Record<string, any> // 额外信息
}

// 记录学习活动
export const trackLearningActivity = (activity: LearningActivity) => {
  // 发送消息到父窗口（如果存在）
  if (window.parent && window.parent !== window) {
    window.parent.postMessage({
      type: 'LEARNING_ACTIVITY',
      activity
    }, '*')
  }

  // 发送消息到当前窗口（用于同页面监听）
  window.postMessage({
    type: 'LEARNING_ACTIVITY',
    activity
  }, '*')

  // 同时保存到localStorage作为备份
  const savedStats = localStorage.getItem('userLearningStats')
  if (savedStats) {
    try {
      const stats = JSON.parse(savedStats)
      
      // 更新统计
      if (activity.type === 'course_start') {
        stats.totalCourses = (stats.totalCourses || 0) + 1
      } else if (activity.type === 'experiment_start') {
        stats.totalExperiments = (stats.totalExperiments || 0) + 1
      } else if (activity.type === 'study_time') {
        stats.totalStudyTime = (stats.totalStudyTime || 0) + (activity.duration || 0)
        // 更新周进度
        const today = new Date().getDay()
        stats.weeklyProgress = stats.weeklyProgress || [0, 0, 0, 0, 0, 0, 0]
        stats.weeklyProgress[today] += (activity.duration || 0)
      } else if (activity.type === 'course_complete') {
        stats.completedCourses = (stats.completedCourses || 0) + 1
      } else if (activity.type === 'experiment_complete') {
        stats.completedExperiments = (stats.completedExperiments || 0) + 1
      }

      // 添加最近活动
      stats.recentActivities = stats.recentActivities || []
      stats.recentActivities.unshift({
        id: Date.now().toString(),
        type: activity.type,
        title: activity.title,
        time: new Date().toISOString(),
        duration: activity.duration || 0
      })

      // 只保留最近10个活动
      stats.recentActivities = stats.recentActivities.slice(0, 10)

      localStorage.setItem('userLearningStats', JSON.stringify(stats))
    } catch (error) {
      console.error('更新学习统计失败:', error)
    }
  } else {
    // 如果没有现有数据，创建初始数据
    const initialStats = {
      totalCourses: 0,
      totalExperiments: 0,
      totalStudyTime: 0,
      completedCourses: 0,
      completedExperiments: 0,
      weeklyProgress: [0, 0, 0, 0, 0, 0, 0],
      recentActivities: [{
        id: Date.now().toString(),
        type: activity.type,
        title: activity.title,
        time: new Date().toISOString(),
        duration: activity.duration || 0
      }]
    }

    // 根据活动类型设置初始值
    if (activity.type === 'course_start') {
      initialStats.totalCourses = 1
    } else if (activity.type === 'experiment_start') {
      initialStats.totalExperiments = 1
    } else if (activity.type === 'study_time') {
      initialStats.totalStudyTime = activity.duration || 0
      const today = new Date().getDay()
      initialStats.weeklyProgress[today] = activity.duration || 0
    } else if (activity.type === 'course_complete') {
      initialStats.completedCourses = 1
    } else if (activity.type === 'experiment_complete') {
      initialStats.completedExperiments = 1
    }

    localStorage.setItem('userLearningStats', JSON.stringify(initialStats))
  }

  console.log('学习活动已记录:', activity)
}

// 便捷函数
export const trackCourseStart = (title: string) => {
  trackLearningActivity({ type: 'course_start', title })
}

export const trackExperimentStart = (title: string) => {
  trackLearningActivity({ type: 'experiment_start', title })
}

export const trackStudyTime = (title: string, duration: number) => {
  trackLearningActivity({ type: 'study_time', title, duration })
}

export const trackCourseComplete = (title: string) => {
  trackLearningActivity({ type: 'course_complete', title })
}

export const trackExperimentComplete = (title: string) => {
  trackLearningActivity({ type: 'experiment_complete', title })
}
