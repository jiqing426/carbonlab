import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export function CourseHeaderSkeleton() {
  return (
    <div className='flex flex-col md:flex-row gap-8 mb-8'>
      <div className='md:w-1/3'>
        <Skeleton className='w-full h-[225px] rounded-lg' />
      </div>
      <div className='md:w-2/3'>
        <Skeleton className='h-8 w-3/4 mb-4' />
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-full mb-2' />
        <Skeleton className='h-4 w-3/4 mb-4' />
        <Skeleton className='h-6 w-1/4' />
      </div>
    </div>
  );
}

export function CourseContentSkeleton() {
  return (
    <div>
      <Skeleton className='h-6 w-1/4 mb-4' />
      <Skeleton className='h-4 w-full mb-2' />
      <Skeleton className='h-4 w-1/4 mb-8' />

      {[1, 2, 3].map((_, index) => (
        <div key={index} className='mb-4'>
          <Skeleton className='h-10 w-full mb-2' />
          <Skeleton className='h-8 w-full mb-1' />
          <Skeleton className='h-8 w-full mb-1' />
          <Skeleton className='h-8 w-3/4' />
        </div>
      ))}
    </div>
  );
}