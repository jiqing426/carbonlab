'use server';

import {
  subscribeToCourseAPI,
  checkCourseSubscriptionAPI,
} from '@/lib/api/courses';

// 检查用户是否订阅了特定课程
export async function checkCourseSubscription(
  courseId: string
): Promise<boolean> {
  // 使用新的API接口
  // 这里需要从用户store获取用户ID，但由于是server action，我们需要通过参数传入
  // 暂时返回false，实际使用时需要从客户端传入用户ID
  return false;
}

// 订阅课程
export async function subscribeToCourse(courseId: string): Promise<boolean> {
  // 使用新的API接口
  // 这里需要从用户store获取用户ID，但由于是server action，我们需要通过参数传入
  // 暂时返回false，实际使用时需要从客户端传入用户ID
  return false;
}