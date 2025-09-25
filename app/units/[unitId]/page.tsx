'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sidebar } from '@/components/unit/Sidebar';
import { MainContent } from '@/components/unit/MainContent';
import { UnitCopilot } from '@/components/unit/AICopilot';
import {
  getLessonByIdAPI,
  Lesson,
  getUnitWithLessonsAPI,
  UnitWithLessons,
  getCourseProgressRecordsAPI,
  ProgressRecord,
  updateLessonProgressAPI,
} from '@/lib/api/courses';
import { getOrCreateInteractionRecord } from '@/lib/interactions';
import { getAvatarPresignedUrl } from '@/lib/api/users';
import { getProcessedFileUri } from '@/lib/utils';
import { useUserStore } from '@/lib/stores/user-store';

const CACHE_EXPIRY = 1000 * 60 * 15; // 缓存有效期：15分钟

export default function CourseLearningPage({
  params,
}: {
  params: { unitId: string };
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [unit, setUnit] = useState<UnitWithLessons | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [progressRecords, setProgressRecords] = useState<ProgressRecord[]>([]);
  const [interactionRecord, setInteractionRecord] = useState<any>(null);
  const [mediaPreviewUrl, setMediaPreviewUrl] = useState<string | undefined>(
    undefined
  );
  const [loading, setLoading] = useState(true);
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const { unitId } = useParams();

  // 从 userStore 获取用户信息
  const { user } = useUserStore();
  const userId = user?.id;

  // 生成媒体预览URL的通用函数
  const generatePreviewUrl = async (
    coverImageKey: string
  ): Promise<string | null> => {
    try {
      let objectKey = coverImageKey;
      if (objectKey.startsWith('/')) {
        objectKey = objectKey.substring(1);
      }
      const presignedResponse = await getAvatarPresignedUrl(objectKey);
      const url = getProcessedFileUri(presignedResponse.presignedUrl);
      console.log('生成的媒体预览URL:', url);
      return url;
    } catch (error) {
      console.error('生成媒体预览URL失败:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!unitId || !userId) return;

      setLoading(true);
      try {
        const cacheKeyUnit = `unit_${unitId}`;
        const cacheKeyProgress = `progress_${unitId}`;

        // 检查缓存中的单元数据
        const cachedUnit = localStorage.getItem(cacheKeyUnit);
        let unitData: UnitWithLessons | null = null;

        if (cachedUnit) {
          const parsed = JSON.parse(cachedUnit);
          const now = new Date().getTime();
          if (now - parsed.timestamp < CACHE_EXPIRY) {
            unitData = parsed.data;
            console.log('使用缓存的单元数据');
          } else {
            // 移除过期的缓存
            localStorage.removeItem(cacheKeyUnit);
          }
        }

        if (!unitData) {
          unitData = await getUnitWithLessonsAPI(unitId as string, userId);
          if (unitData) {
            // 将数据缓存到localStorage
            localStorage.setItem(
              cacheKeyUnit,
              JSON.stringify({
                data: unitData,
                timestamp: new Date().getTime(),
              })
            );
          }
        }

        if (unitData) {
          setUnit(unitData);

          const lessonId = searchParams.get('lesson_id');
          const selectedLesson = lessonId
            ? unitData.lessons.find((lesson: Lesson) => lesson.id === lessonId)
            : unitData.lessons[0];

          if (selectedLesson) {
            setCurrentLesson(selectedLesson);

            // 生成媒体预览URL
            if (
              selectedLesson.coverImageKey &&
              ['PDF', 'VIDEO', 'AUDIO', 'DOC', 'PPT'].includes(
                selectedLesson.category?.toUpperCase() || ''
              )
            ) {
              const url = await generatePreviewUrl(
                selectedLesson.coverImageKey
              );
              setMediaPreviewUrl(url || undefined);
            } else {
              setMediaPreviewUrl(undefined);
            }

            // 获取或创建 InteractionRecord
            const record = await getOrCreateInteractionRecord(
              'lesson',
              selectedLesson.id
            );
            setInteractionRecord(record);
          }

          // 检查缓存中的进度记录
          const cachedProgress = localStorage.getItem(cacheKeyProgress);
          let progressData: ProgressRecord[] = [];

          if (cachedProgress) {
            const parsed = JSON.parse(cachedProgress);
            const now = new Date().getTime();
            if (now - parsed.timestamp < CACHE_EXPIRY) {
              progressData = parsed.data;
              console.log('使用缓存的进度数据');
            } else {
              // 移除过期的缓存
              localStorage.removeItem(cacheKeyProgress);
            }
          }

          if (progressData.length === 0) {
            progressData = await getCourseProgressRecordsAPI(
              unitData.courseId,
              userId
            );
            // 将进度数据缓存到localStorage
            localStorage.setItem(
              cacheKeyProgress,
              JSON.stringify({
                data: progressData,
                timestamp: new Date().getTime(),
              })
            );
          }

          setProgressRecords(progressData);
        }
      } catch (error) {
        console.error('获取单元数据失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [unitId, userId, searchParams]);

  const toggleLessonCompletion = async (lessonId: string) => {
    if (unit && currentLesson && userId && !isUpdatingProgress) {
      setIsUpdatingProgress(true);
      try {
        const currentRecord = progressRecords.find(
          record => record.lessonId === lessonId
        );
        const currentStatus = currentRecord?.status?.toLowerCase();
        const newStatus: 'in_progress' | 'completed' =
          currentStatus === 'completed' ? 'in_progress' : 'completed';

        // 使用新的API接口更新进度
        const result = await updateLessonProgressAPI({
          lessonId,
          unitId: unit.id,
          courseId: unit.courseId,
          userId,
          status: newStatus,
        });

        if (result.success) {
          // 更新进度记录状态
          let updatedRecords;

          if (currentRecord) {
            updatedRecords = progressRecords.map(record =>
              record.lessonId === lessonId
                ? { ...record, status: newStatus.toUpperCase() }
                : record
            );
          } else {
            const newRecord: ProgressRecord = {
              id: `temp_${lessonId}_${Date.now()}`,
              courseId: unit.courseId,
              unitId: unit.id,
              lessonId,
              userId,
              status: newStatus.toUpperCase(),
              startedAt: new Date().toISOString(),
              completedAt:
                newStatus === 'completed' ? new Date().toISOString() : null,
            };
            updatedRecords = [...progressRecords, newRecord];
          }

          setProgressRecords(updatedRecords);

          // 更新缓存中的进度记录
          const cacheKeyProgress = `progress_${unit.id}`;
          localStorage.setItem(
            cacheKeyProgress,
            JSON.stringify({
              data: updatedRecords,
              timestamp: Date.now(),
            })
          );
        } else {
          console.error('更新课程进度失败:', result.error);
          alert('更新进度失败，请稍后重试');
        }
      } catch (error) {
        console.error('更新课程进度失败:', error);
        alert('网络错误，请检查网络连接后重试');
      } finally {
        setIsUpdatingProgress(false);
      }
    }
  };

  const completedCount = progressRecords.filter(
    record => record.status?.toUpperCase() === 'COMPLETED'
  ).length;
  const totalLessonsCount = unit ? unit.lessons.length : 0;
  const progress =
    totalLessonsCount > 0 ? (completedCount / totalLessonsCount) * 100 : 0;

  const toggleCollapse = useCallback(() => setIsCollapsed(prev => !prev), []);

  // 如果用户未登录，显示加载状态或提示
  if (!userId) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>正在加载用户信息...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4'></div>
          <p className='text-gray-600'>加载中...</p>
        </div>
      </div>
    );
  }

  if (!unit || !currentLesson) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-gray-600'>未找到课程数据</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex h-screen overflow-hidden bg-background'>
      <Sidebar
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
        unit={unit}
        currentLesson={currentLesson}
        progressRecords={progressRecords}
        unitId={unitId.toString()}
        unitTitle={unit?.title || ''}
        router={router}
        progress={progress}
        courseId={unit?.courseId}
        completedCount={completedCount}
        totalLessonsCount={totalLessonsCount}
      />

      <MainContent
        currentLesson={currentLesson}
        progressRecords={progressRecords}
        toggleLessonCompletion={toggleLessonCompletion}
        mediaPreviewUrl={mediaPreviewUrl}
      />

      <UnitCopilot
        currentLesson={currentLesson}
        noteId={interactionRecord?.note_id || ''}
      />
    </div>
  );
}