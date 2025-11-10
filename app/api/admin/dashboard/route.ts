import { NextRequest, NextResponse } from 'next/server';
import { experiments, courses } from '@/lib/database';

// 模拟用户数据 - 实际应该从数据库获取
const mockUsers = Array.from({ length: 234 }, (_, i) => ({
  id: `user_${i + 1}`,
  username: `用户${i + 1}`,
  email: `user${i + 1}@example.com`,
  roles: ['student'],
  lastLogin: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // 最近30天内的随机时间
  coursesProgress: Math.random(),
  experimentsProgress: Math.random()
}));

// 核心统计数据接口
interface CoreStats {
  totalUsers: number;
  totalCourses: number;
  totalExperiments: number;
  activeUsers: number;
  weeklyGrowth: {
    users: number;
    courses: number;
    activeUsers: number;
  };
}

// 课程完成情况接口
interface CourseCompletionData {
  name: string;
  completion: number;
  participants: number;
}

// 实验完成情况接口
interface ExperimentCompletionData {
  name: string;
  completion: number;
  participants: number;
}

// 课程人数分布接口
interface CourseDistributionData {
  name: string;
  count: number;
}

// 实验人数分布接口
interface ExperimentDistributionData {
  name: string;
  count: number;
}

// 班级完成率数据接口
interface ClassCompletionData {
  name: string;
  completion: number;
  courses: number;
  experiments: number;
}

// 活跃度趋势数据接口
interface ActivityTrendData {
  date: string;
  activeUsers: number;
  courseCompletions: number;
  experimentCompletions: number;
}

// 完成率分布数据接口
interface CompletionRateData {
  name: string;
  value: number;
  color: string;
}

// 计算活跃用户数（近7天内登录）
function calculateActiveUsers(): number {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  return mockUsers.filter(user =>
    new Date(user.lastLogin) >= sevenDaysAgo
  ).length;
}

// 生成课程完成情况数据
function generateCourseCompletionData(): CourseCompletionData[] {
  return courses.map(course => ({
    name: course.title,
    completion: Math.floor(Math.random() * 60) + 30, // 30-90% 的完成率
    participants: Math.floor(Math.random() * 200) + 50 // 50-250 参与人数
  }));
}

// 生成实验完成情况数据
function generateExperimentCompletionData(): ExperimentCompletionData[] {
  return experiments.map(experiment => ({
    name: experiment.title,
    completion: Math.floor(Math.random() * 70) + 20, // 20-90% 的完成率
    participants: Math.floor(Math.random() * 150) + 30 // 30-180 参与人数
  }));
}

// 生成课程人数分布数据
function generateCourseDistributionData(): CourseDistributionData[] {
  return courses.map(course => ({
    name: course.title.length > 15 ? course.title.substring(0, 15) + '...' : course.title,
    count: Math.floor(Math.random() * 200) + 50
  }));
}

// 生成实验人数分布数据
function generateExperimentDistributionData(): ExperimentDistributionData[] {
  return experiments.map(experiment => ({
    name: experiment.title.length > 15 ? experiment.title.substring(0, 15) + '...' : experiment.title,
    count: Math.floor(Math.random() * 150) + 30
  }));
}

// 生成班级完成率数据
function generateClassCompletionData(): ClassCompletionData[] {
  const classes = [
    '碳管理21班',
    '环境工程19班',
    '新能源技术20班',
    '化学工程22班',
    '材料科学21班'
  ];

  return classes.map(className => ({
    name: className,
    completion: Math.floor(Math.random() * 30) + 60, // 60-90% 的完成率
    courses: Math.floor(Math.random() * 25) + 70, // 70-95% 的课程完成率
    experiments: Math.floor(Math.random() * 30) + 55 // 55-85% 的实验完成率
  })).sort((a, b) => b.completion - a.completion);
}

// 生成活跃度趋势数据（最近7天）
function generateActivityTrendData(): ActivityTrendData[] {
  return Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));

    return {
      date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
      activeUsers: Math.floor(Math.random() * 50) + 30,
      courseCompletions: Math.floor(Math.random() * 20) + 10,
      experimentCompletions: Math.floor(Math.random() * 15) + 5
    };
  });
}

// 生成完成率分布数据
function generateCompletionRateData(): CompletionRateData[] {
  return [
    { name: '已完成', value: Math.floor(Math.random() * 20) + 60, color: '#00C49F' },
    { name: '进行中', value: Math.floor(Math.random() * 15) + 15, color: '#0088FE' },
    { name: '未开始', value: Math.floor(Math.random() * 10) + 5, color: '#FFBB28' }
  ];
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const classId = searchParams.get('classId') || 'all';

    // 获取核心统计数据
    const activeUsers = calculateActiveUsers();
    const coreStats: CoreStats = {
      totalUsers: mockUsers.length,
      totalCourses: courses.length,
      totalExperiments: experiments.length,
      activeUsers: activeUsers,
      weeklyGrowth: {
        users: Math.floor(Math.random() * 20) + 5, // 5-25% 增长
        courses: Math.floor(Math.random() * 3) + 1, // 1-4 门课程增长
        activeUsers: Math.floor(Math.random() * 15) + 3 // 3-18% 增长
      }
    };

    // 生成各类数据
    const courseCompletionData = generateCourseCompletionData();
    const experimentCompletionData = generateExperimentCompletionData();
    const courseDistributionData = generateCourseDistributionData();
    const experimentDistributionData = generateExperimentDistributionData();
    const classCompletionData = generateClassCompletionData();
    const activityTrendData = generateActivityTrendData();
    const completionRateData = generateCompletionRateData();

    // 根据筛选条件调整数据
    let filteredCourseCompletion = courseCompletionData;
    let filteredExperimentCompletion = experimentCompletionData;
    let filteredActivityTrend = activityTrendData;

    if (classId !== 'all') {
      // 如果选择了特定班级，模拟班级特定的数据
      filteredCourseCompletion = courseCompletionData.map(item => ({
        ...item,
        completion: Math.floor(item.completion * (Math.random() * 0.3 + 0.7)), // 完成率会略有下降
        participants: Math.floor(item.participants * 0.3) // 参与人数按班级规模缩减
      }));

      filteredExperimentCompletion = experimentCompletionData.map(item => ({
        ...item,
        completion: Math.floor(item.completion * (Math.random() * 0.3 + 0.7)),
        participants: Math.floor(item.participants * 0.3)
      }));
    }

    // 根据时间范围调整数据
    if (timeRange === '30d') {
      filteredActivityTrend = Array.from({ length: 30 }, (_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        return {
          date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
          activeUsers: Math.floor(Math.random() * 60) + 25,
          courseCompletions: Math.floor(Math.random() * 25) + 8,
          experimentCompletions: Math.floor(Math.random() * 18) + 3
        };
      });
    }

    const responseData = {
      coreStats,
      courseCompletion: filteredCourseCompletion,
      experimentCompletion: filteredExperimentCompletion,
      courseDistribution: courseDistributionData,
      experimentDistribution: experimentDistributionData,
      classCompletion: classCompletionData,
      activityTrend: filteredActivityTrend,
      completionRate: completionRateData,
      filters: {
        timeRange,
        classId
      }
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}