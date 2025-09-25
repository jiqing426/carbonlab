import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ProgressBar } from './ProgressBar';
import { UnitLessonList } from './UnitLessonList';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isCollapsed: boolean;
  toggleCollapse: () => void;
  unit: any; // 请根据实际类型替换 any
  currentLesson: any; // 请根据实际类型替换 any
  progressRecords: any; // 请根据实际类型替换 any
  unitId: string | number;
  unitTitle: string;
  router: any; // 请根据实际类型替换 any
  progress: number;
  completedCount: number;
  totalLessonsCount: number;
  courseId: string | number;
}

export function Sidebar({
  isCollapsed,
  toggleCollapse,
  unit,
  currentLesson,
  progressRecords,
  unitId,
  unitTitle,
  router,
  progress,
  courseId,
  completedCount,
  totalLessonsCount,
}: SidebarProps) {
  return (
    <div
      className={`border-r transition-all duration-300 ease-in-out flex flex-col bg-background relative flex-shrink-0 ${isCollapsed ? 'w-16' : 'w-80'}`}
    >
      <button
        onClick={toggleCollapse}
        className={cn(
          'absolute right-[-12px] top-16 border rounded-full p-1 transition-all duration-200',
          'bg-background hover:bg-primary/5 dark:hover:bg-primary/10',
          'hover:border-primary/50 dark:hover:border-primary/50',
          'text-foreground hover:text-primary'
        )}
      >
        {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      <div className='flex-grow overflow-hidden flex flex-col h-full'>
        <div className='flex items-center p-4'>
          {!isCollapsed && (
            <Button
              variant='ghost'
              size='sm'
              onClick={() => router.push(`/courses/${courseId}`)}
              className='mr-2'
            >
              <ArrowLeft className='h-4 w-4 mr-1' />
              返回课程
            </Button>
          )}
        </div>

        {!isCollapsed && (
          <>
            <div className='px-4'>
              <h2 className='text-xl font-bold truncate mb-4' title={unitTitle}>
                {unitTitle}
              </h2>
            </div>

            <div className='px-4 mb-4'>
              <h3 className='text-base font-semibold leading-none py-2'>
                课程进度
              </h3>
              <ProgressBar
                progress={progress}
                completedCount={completedCount}
                totalLessonsCount={totalLessonsCount}
              />
            </div>

            <ScrollArea className='flex-1'>
              <div className='px-4'>
                <UnitLessonList
                  unit={unit}
                  currentLesson={currentLesson}
                  progressRecords={progressRecords}
                  unitId={unitId.toString()}
                  router={router}
                />
              </div>
            </ScrollArea>
          </>
        )}
      </div>

      <div className='p-4 border-t'>
        {/* ThemeSwitcher removed for simplicity */}
      </div>
    </div>
  );
}