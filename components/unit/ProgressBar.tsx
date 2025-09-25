import React from 'react';
import { Progress } from '@/components/ui/progress';

export function ProgressBar({
  progress,
  completedCount,
  totalLessonsCount,
}: {
  progress: number;
  completedCount: number;
  totalLessonsCount: number;
}) {
  return (
    <>
      <Progress value={progress} className='mb-2' />
      <p className='text-sm text-muted-foreground mb-4'>
        {completedCount === totalLessonsCount
          ? '已完成'
          : `完成 ${completedCount} / ${totalLessonsCount} 课程`}
      </p>
    </>
  );
}