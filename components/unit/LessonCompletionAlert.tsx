import React from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface LessonCompletionAlertProps {
  currentLesson: { id: string | number };
  progressRecords: Array<{ lessonId: string | number; status: string }>; // 改为 lessonId
  toggleLessonCompletion: (lessonId: string | number) => void;
}

export function LessonCompletionAlert({
  currentLesson,
  progressRecords,
  toggleLessonCompletion,
}: LessonCompletionAlertProps) {
  const isCompleted = progressRecords.some(
    record =>
      record.lessonId === currentLesson?.id &&
      record.status?.toUpperCase() === 'COMPLETED' // 改为 lessonId
  );

  return (
    <Alert className='mt-4'>
      <AlertTitle>课程完成状态</AlertTitle>
      <AlertDescription className='flex items-center justify-between'>
        <span>{isCompleted ? '🎉 您已完成本课程' : '您尚未完成本课程'}</span>
        <Button
          onClick={() => toggleLessonCompletion(currentLesson?.id)}
          variant={isCompleted ? 'secondary' : 'outline'}
          className={
            isCompleted ? 'bg-green-700 hover:bg-green-800 text-white' : ''
          }
        >
          {isCompleted ? '已完成' : '标记为已完成'}
        </Button>
      </AlertDescription>
    </Alert>
  );
}