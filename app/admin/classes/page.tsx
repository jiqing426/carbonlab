'use client';

import { ClassesTable } from '@/components/admin/ClassesTable';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

export default function AdminClassesPage() {
  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className='w-full max-w-7xl mx-auto space-y-6 p-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold text-gray-900'>班级管理</h1>
          <p className='text-gray-600'>管理班级信息，分配学生，查看统计</p>
        </div>
        <ClassesTable onCreateClass={() => {}} />
      </div>
    </>
  );
}

