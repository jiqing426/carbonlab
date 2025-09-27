import { platoApiPost, platoApiGet } from './base';

// 课程数据接口
export interface Quiz {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  status: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
}

// API响应接口
export interface QuizListResponse {
  data: Quiz[];
  total: number;
}

// 根据ID获取单个课程
export const getCourseById = async (courseId: string): Promise<Quiz | null> => {
  try {
    const response = await platoApiGet<Quiz[]>(`/api/v1/courses/batch?ids=${courseId}`);
    
    return response.data?.[0] || null;
  } catch (error) {
    console.error('获取课程失败:', error);
    return null;
  }
};

// 根据ID列表获取课程
export const getQuizzesByIds = async (quizIds: string[]): Promise<Quiz[]> => {
  try {
    // 使用批量接口一次性获取所有课程
    const idsParam = quizIds.join(',');
    const response = await platoApiGet<Quiz[]>(`/api/v1/courses/batch?ids=${idsParam}`);
    
    return response.data || [];
  } catch (error) {
    console.error('获取课程列表失败:', error);
    return [];
  }
};