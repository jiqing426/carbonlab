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
} from 'lucide-react';
import {
  getUserGroups,
  createUserGroup,
  deleteUserGroup,
  CreateUserGroupRequest,
} from '@/lib/api/user-groups';
import { UserGroup, UserGroupsResponse } from '@/types/tale';
import { useTale } from '@/lib/contexts/TaleContext';

const userGroupFormSchema = z.object({
  name: z.string().min(2, { message: '用户组名称至少需要2个字符' }),
  description: z.string().optional(),
  remark: z.string().optional(),
});

import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

export default function UserGroupsPage() {
  const { currentApp } = useTale();
  const router = useRouter();
  const [data, setData] = useState<UserGroupsResponse>({
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
  const [deletingGroup, setDeletingGroup] = useState<UserGroup | null>(null);
  const [confirmGroupName, setConfirmGroupName] = useState('');
  const pageSize = 10;

  const createForm = useForm<z.infer<typeof userGroupFormSchema>>({
    resolver: zodResolver(userGroupFormSchema),
    defaultValues: {
      name: '',
      description: '',
      remark: '',
    },
  });

  // 加载数据
  const loadData = useCallback(
    async (keyword?: string) => {
      if (!currentApp?.app_key) {
        console.log('No app key available');
        return;
      }

      setLoading(true);
      try {
        const response = await getUserGroups(
          {
            page: currentPage,
            size: pageSize,
            keyword: keyword || undefined,
          },
          currentApp.app_key
        );

        setData(response);
      } catch (error) {
        console.log('Failed to load user groups:', error);
        toast({
          title: '错误',
          description: '加载用户组列表失败，请稍后重试',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    },
    [currentPage, currentApp?.app_key]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadData(searchTerm);
  };

  // 创建用户组
  const onCreateSubmit = async (
    values: z.infer<typeof userGroupFormSchema>
  ) => {
    if (!currentApp?.app_key) {
      toast({
        title: '错误',
        description: '未选择应用，无法创建用户组',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createUserGroup(
        values as CreateUserGroupRequest,
        currentApp.app_key
      );
      toast({
        title: '用户组已创建',
        description: `新用户组 "${values.name}" 已成功创建。`,
      });
      createForm.reset();
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create user group:', error);
      toast({
        title: '错误',
        description: '创建用户组失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 跳转到用户组详情页面
  const handleViewDetail = (group: UserGroup) => {
    router.push(
      `/dashboard/users/groups/${group.groupId}?groupName=${encodeURIComponent(group.name)}`
    );
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 删除用户组
  const handleDeleteClick = (group: UserGroup) => {
    setDeletingGroup(group);
    setConfirmGroupName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingGroup || !currentApp?.app_key) {
      toast({
        title: '错误',
        description: '未选择应用，无法删除用户组',
        variant: 'destructive',
      });
      return;
    }

    if (confirmGroupName !== deletingGroup.name) {
      toast({
        title: '错误',
        description: '用户组名称不匹配',
        variant: 'destructive',
      });
      return;
    }

    try {
      await deleteUserGroup(deletingGroup.groupId, currentApp.app_key);
      toast({
        title: '成功',
        description: '用户组已删除',
      });
      setIsDeleteDialogOpen(false);
      setDeletingGroup(null);
      setConfirmGroupName('');
      loadData();
    } catch (error) {
      console.error('Failed to delete user group:', error);
      toast({
        title: '错误',
        description: '删除用户组失败，请稍后重试',
        variant: 'destructive',
      });
    }
  };

  // 计算总页数
  const totalPages = Math.ceil(data.total / pageSize);

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb />
      </div>
      <div className='w-full max-w-7xl mx-auto space-y-6 p-6'>
        {/* 页面标题 */}
        <div className='space-y-2'>
          <h1 className='text-2xl font-bold text-gray-900'>用户组管理</h1>
          <p className='text-gray-600'>管理应用中的用户组</p>
        </div>

        {/* 搜索和添加区域 */}
        <Card>
          <CardContent className='p-6'>
            <div className='flex justify-between items-center gap-4'>
              {/* 搜索区域 */}
              <div className='flex items-center gap-2 flex-1'>
                <div className='relative flex-1 max-w-md'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                  <Input
                    type='text'
                    placeholder='搜索用户组...'
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

              {/* 添加按钮 */}
              <Dialog
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
              >
                <DialogTrigger asChild>
                  <Button>
                    <PlusCircle className='mr-2 h-4 w-4' />
                    添加新用户组
                  </Button>
                </DialogTrigger>
                <DialogContent className='bg-background border-border'>
                  <DialogHeader>
                    <DialogTitle className='text-foreground'>
                      创建新用户组
                    </DialogTitle>
                    <DialogDescription className='text-muted-foreground'>
                      在此添加新的用户组。
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
                              用户组名称
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder='输入用户组名称'
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
                                placeholder='输入用户组描述'
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
                        <Button type='submit'>创建用户组</Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* 用户组列表 */}
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
                      用户组名称
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      描述
                    </TableHead>
                    <TableHead className='font-medium text-gray-700'>
                      成员数
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
                        colSpan={6}
                        className='text-center py-8 text-gray-500'
                      >
                        {searchTerm ? '未找到匹配的用户组' : '暂无用户组数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.content.map(group => (
                      <TableRow key={group.groupId} className='hover:bg-gray-50'>
                        <TableCell className='font-medium'>
                          {group.name}
                        </TableCell>
                        <TableCell>{group.description || '-'}</TableCell>
                        <TableCell>{group.memberCount}</TableCell>
                        <TableCell className='text-sm text-gray-600'>
                          {new Date(group.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{group.remark || '-'}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewDetail(group)}
                              className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                              title='查看详情'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteClick(group)}
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

        {/* 分页控件 */}
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

        {/* 删除确认弹框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>删除用户组</DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                 此操作将永久删除用户组「{deletingGroup?.name}」。
                 <br />
                 请输入用户组名称以确认删除。
               </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div>
                <label className='text-sm font-medium text-foreground'>
                  用户组名称
                </label>
                <Input
                  value={confirmGroupName}
                  onChange={e => setConfirmGroupName(e.target.value)}
                  placeholder={`请输入「${deletingGroup?.name}」以确认`}
                  className='mt-1 bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingGroup(null);
                  setConfirmGroupName('');
                }}
              >
                取消
              </Button>
              <Button
                variant='destructive'
                onClick={handleDeleteConfirm}
                disabled={confirmGroupName !== deletingGroup?.name}
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
