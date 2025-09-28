'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  PlusCircle,
  Eye,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  FileText,
} from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

const classFormSchema = z.object({
  name: z.string().min(2, { message: '班级名称至少需要2个字符' }),
  description: z.string().optional(),
  maxStudents: z.number().min(1, { message: '最大学生数至少为1' }).max(100, { message: '最大学生数不能超过100' }),
  grade: z.string().min(1, { message: '请选择年级' }),
  remark: z.string().optional(),
});

interface Class {
  id: string;
  name: string;
  description?: string;
  maxStudents: number;
  currentStudents: number;
  grade: string;
  remark?: string;
  createdAt: string;
  status: 'ongoing' | 'completed' | 'pending';
  students: string[];
  taleGroupId?: string;
  lastSyncTime?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  syncError?: string;
}

interface ClassesResponse {
  total: number;
  content: Class[];
  pageable: {
    sort: { orders: unknown[] };
    pageNumber: number;
    pageSize: number;
  };
}

export default function ClassesPage() {
  const router = useRouter();
  const [data, setData] = useState<ClassesResponse>({
    total: 0,
    content: [],
    pageable: {
      sort: { orders: [] },
      pageNumber: 0,
      pageSize: 10,
    },
  });
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [confirmClassName, setConfirmClassName] = useState('');
  const pageSize = 10;

  const createForm = useForm<z.infer<typeof classFormSchema>>({
    resolver: zodResolver(classFormSchema),
    defaultValues: {
      name: '',
      description: '',
      maxStudents: 30,
      grade: '2025级',
      remark: '',
    },
  });

  const gradeOptions = [
    { value: "2025级", label: "2025级" },
    { value: "2024级", label: "2024级" },
    { value: "2023级", label: "2023级" },
    { value: "2022级", label: "2022级" },
    { value: "2021级", label: "2021级" },
  ];

  const loadData = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        const response = await getClasses(
          {
            page: currentPage,
            size: pageSize,
            keyword: keyword || undefined,
          }
        );
        setData(response);
      } catch (error) {
        console.log('Failed to load classes:', error);
        toast({
          title: '错误',
          description: '加载班级列表失败，请稍后重试',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [currentPage]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadData(searchTerm);
  };

  const onCreateSubmit = async (values: z.infer<typeof classFormSchema>) => {
    try {
      await createClass(values as CreateClassRequest);
      toast({
        title: '班级已创建',
        description: `新班级 "${values.name}" 已成功创建。`,
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create class:', error);
      toast({
        title: '错误',
        description: '创建班级失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const handleViewDetail = (cls: Class) => {
    router.push(
      `/dashboard/classes/${cls.id}?className=${encodeURIComponent(cls.name)}`
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleDeleteClick = (cls: Class) => {
    setDeletingClass(cls);
    setConfirmClassName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) {
      toast({
        title: '错误',
        description: '未选择要删除的班级',
        variant: 'destructive',
      });
      return;
    }

    if (confirmClassName !== deletingClass.name) {
      toast({
        title: '错误',
        description: '班级名称不匹配',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteClass(deletingClass.id);
      toast({
        title: '成功',
        description: '班级已删除',
      });
      setIsDeleteDialogOpen(false);
      setDeletingClass(null);
      setConfirmClassName('');
      loadData();
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast({
        title: '错误',
        description: '删除班级失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  const totalPages = Math.ceil(data.total / pageSize);

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

        <Card>
          <CardContent className='p-6'>
            <div className='flex justify-between items-center gap-4'>
              <div className='flex items-center gap-2 flex-1'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    type='text'
                    placeholder='搜索班级...'
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className='pl-10'
                    onKeyPress={e => e.key === 'Enter' && handleSearch()}
                  />
                </div>
                <Button onClick={handleSearch} disabled={loading}>
                  搜索
                </Button>
              </div>

              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    添加新班级
                  </Button>
                </DialogTrigger>
                <DialogContent className='bg-background border-border'>
                  <DialogHeader>
                    <DialogTitle className='text-foreground'>
                      创建新班级
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground'>
                      在此添加新的班级。
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...createForm}>
                    <form
                      onSubmit={createForm.handleSubmit(onCreateSubmit)}
                      className='space-y-4'
                    >
                      <FormField
                        control={createForm.control}
                        name='name'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground'>
                              班级名称
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='输入班级名称'
                                {...field}
                                className='bg-background border-border'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name='description'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground'>
                              描述
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='输入班级描述'
                                {...field}
                                className='bg-background border-border'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name='maxStudents'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground'>
                              最大学生数
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                placeholder='输入最大学生数'
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                className='bg-background border-border'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name='grade'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground'>
                              年级
                            </FormLabel>
                            <FormControl>
                              <select
                                {...field}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-background border-border"
                              >
                                {gradeOptions.map(option => (
                                  <option key={option.value} value={option.value}>
                                    {option.label}
                                  </option>
                                ))}
                              </select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={createForm.control}
                        name='remark'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className='text-foreground'>
                              备注
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='输入备注'
                                {...field}
                                className='bg-background border-border'
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <DialogFooter>
                        <Button type='submit'>创建班级</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className='p-0'>
            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>加载中...</div>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50'>
                    <TableHead className='font-medium text-gray-700'>
                      班级名称
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      描述
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      年级
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      学生数
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      状态
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      创建日期
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      备注
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.content.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className='text-center py-8 text-gray-500'
                      >
                        {searchTerm ? '未找到匹配的班级' : '暂无班级数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.content.map(cls => (
                      <TableRow
                        key={cls.id}
                        className='hover:bg-gray-50'
                      >
                        <TableCell className='font-medium'>
                          {cls.name}
                        </TableCell>
                        <TableCell>{cls.description || '-'}</TableCell>
                        <TableCell>{cls.grade}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Users className='h-4 w-4 text-gray-500' />
                            {cls.currentStudents} / {cls.maxStudents}
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            cls.status === 'ongoing' ? 'bg-green-100 text-green-800' :
                            cls.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cls.status === 'ongoing' ? '进行中' :
                             cls.status === 'completed' ? '已结课' : '待开始'}
                          </span>
                        </TableCell>
                        <TableCell className='text-sm text-gray-600'>
                          <div className='flex items-center gap-2'>
                            <Calendar className='h-4 w-4 text-gray-500' />
                            {new Date(cls.createdAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-gray-500' />
                            {cls.remark || '-'}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewDetail(cls)}
                              className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              title='查看详情'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteClick(cls)}
                              className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                              title='删除'
                            >
                              <Trash2 className='h-4 w-4' />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className='flex items-center justify-between'>
          <Button
            variant='outline'
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || loading}
            className='flex items-center gap-2'
          >
            <ChevronLeft className='h-4 w-4' />
            上一页
          </Button>

          <span className='text-sm text-gray-600'>
            第 {currentPage + 1} 页，共 {totalPages} 页
          </span>

          <Button
            variant='outline'
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages - 1 || loading}
            className='flex items-center gap-2'
          >
            下一页
            <ChevronRight className='h-4 w-4' />
          </Button>
        </div>

        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>删除班级</DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                此操作将永久删除班级「{deletingClass?.name}」。
                <br />
                请输入班级名称以确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  班级名称
                </label>
                <Input
                  value={confirmClassName}
                  onChange={e => setConfirmClassName(e.target.value)}
                  placeholder={`请输入「${deletingClass?.name}」以确认`}
                  className='mt-1 bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingClass(null);
                  setConfirmClassName('');
                }}
              >
                取消
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteConfirm}
                disabled={confirmClassName !== deletingClass?.name}
              >
                删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

interface ClassesQueryParams {
  page: number;
  size: number;
  keyword?: string;
}

interface CreateClassRequest {
  name: string;
  description?: string;
  maxStudents: number;
  grade: string;
  remark?: string;
}

async function getClasses(params?: ClassesQueryParams): Promise<ClassesResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  const queryParams = new URLSearchParams();
  if (params?.page !== undefined)
    queryParams.append('page', params.page.toString());
  if (params?.size !== undefined)
    queryParams.append('size', params.size.toString());
  if (params?.keyword) queryParams.append('keyword', params.keyword);

  const response = await fetch(`${API_BASE_URL}/classes?${queryParams}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function createClass(classData: CreateClassRequest): Promise<Class> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  const response = await fetch(`${API_BASE_URL}/classes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(classData),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

async function deleteClass(classId: string): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

  const response = await fetch(`${API_BASE_URL}/classes/${classId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
}