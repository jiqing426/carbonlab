import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Circle } from 'lucide-react';

export function UnitLessonList({
  unit,
  currentLesson,
  progressRecords,
  unitId,
  router,
}: {
  unit: {
    id: string;
    title: string;
    lessons: Array<{
      id: string;
      title: string;
    }>;
  };
  currentLesson: { id: string } | null;
  progressRecords: Array<{
    lessonId: string; // 改为驼峰命名
    status: string;
  }>;
  unitId: string;
  router: {
    push: (url: string) => void;
  };
}) {
  if (!unit) return null;

  return (
    <ul className='space-y-2'>
      <li key={unit.id}>
        {unit.lessons.map((lesson: any) => (
          <Button
            key={lesson.id}
            variant={currentLesson?.id === lesson.id ? 'secondary' : 'ghost'}
            className='w-full justify-start'
            onClick={() =>
              router.push(`/units/${unit.id}?lesson_id=${lesson.id}`)
            }
          >
            <div className='flex items-center justify-between w-full'>
              <span className='flex items-center'>
                {progressRecords.some(
                  record =>
                    record.lessonId === lesson.id && // 改为 lessonId
                    record.status?.toUpperCase() === 'COMPLETED'
                ) ? (
                  <CheckCircle className='w-4 h-4 text-green-700 mr-2' />
                ) : (
                  <Circle className='w-4 h-4 mr-2' />
                )}
                <span className='truncate' title={lesson.title}>
                  {lesson.title.length > 16
                    ? `${lesson.title.slice(0, 16)}...`
                    : lesson.title}
                </span>
              </span>
            </div>
          </Button>
        ))}
        <Separator className='my-2' />
      </li>
    </ul>
  );
}