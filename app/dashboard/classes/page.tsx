'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
  FolderOpen,
  RefreshCw,
  Cloud,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { useUserStore } from '@/lib/stores/user-store';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';
import { classSyncService, Class as ClassType } from '@/lib/services/class-sync-service';

// 班级表单验证模式
const classFormSchema = z.object({
  name: z.string().min(2, { message: '班级名称至少需要2个字符' }),
  description: z.string().optional(),
  maxStudents: z.number().min(1, { message: '最大学生数至少为1' }).max(100, { message: '最大学生数不能超过100' }),
  grade: z.string().min(1, { message: '请选择年级' }),
  remark: z.string().optional(),
});

// 班级接口
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
  // 同步相关字段
  taleGroupId?: string; // Tale 平台用户组 ID
  lastSyncTime?: string; // 最后同步时间
  syncStatus?: 'synced' | 'pending' | 'error'; // 同步状态
  syncError?: string; // 同步错误信息
}

// 模拟班级数据
const mockClasses: Class[] = [
  {
    id: "1",
    name: "碳经济管理1班",
    description: "专注于碳经济管理的实验班",
    maxStudents: 30,
    currentStudents: 0,
    grade: "2025级",
    remark: "重点培养碳经济管理人才",
    createdAt: "2024-01-01",
    status: 'ongoing',
    students: []
  },
  {
    id: "2",
    name: "碳交易模拟2班",
    description: "碳交易模拟实验班",
    maxStudents: 25,
    currentStudents: 0,
    grade: "2025级",
    remark: "培养碳交易实践能力",
    createdAt: "2024-01-02",
    status: 'ongoing',
    students: []
  },
  {
    id: "3",
    name: "碳足迹计算3班",
    description: "碳足迹计算与分析班",
    maxStudents: 35,
    currentStudents: 0,
    grade: "2025级",
    remark: "注重碳足迹计算技能",
    createdAt: "2024-01-03",
    status: 'pending',
    students: []
  }
];

export default function ClassesPage() {
  const router = useRouter();
  const { user } = useUserStore();
  
  // 权限检查：只有admin角色和carbon账号可以访问
  const userRoles = user?.roles || [];
  const primaryRole = Array.isArray(userRoles) && userRoles.length > 0 ? userRoles[0] : null;
  const isCarbon = user?.username === 'carbon';
  const canManageClasses = isCarbon || primaryRole === 'admin';
  
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [confirmClassName, setConfirmClassName] = useState('');
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<Record<string, 'synced' | 'pending' | 'error'>>({});
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

  // 年级选项
  const gradeOptions = [
    { value: "2025级", label: "2025级" },
    { value: "2024级", label: "2024级" },
    { value: "2023级", label: "2023级" },
    { value: "2022级", label: "2022级" },
    { value: "2021级", label: "2021级" },
  ];

  // 初始化数据
  useEffect(() => {
    const savedClasses = localStorage.getItem('carbonlab-classes');
    if (savedClasses) {
      try {
        setClasses(JSON.parse(savedClasses));
      } catch (error) {
        console.error('Failed to parse saved classes:', error);
        setClasses(mockClasses);
      }
    } else {
      setClasses(mockClasses);
    }
  }, []);

  // 保存班级数据到 localStorage
  const saveClassesToStorage = (classesData: Class[]) => {
    try {
      localStorage.setItem('carbonlab-classes', JSON.stringify(classesData));
    } catch (error) {
      console.error('Failed to save classes to localStorage:', error);
      toast.error("保存数据失败，请检查浏览器存储空间");
    }
  };

  // 加载数据
  const loadData = useCallback(
    async (keyword?: string) => {
      setLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 过滤数据
        const filteredData = classes.filter(cls => 
          !keyword || 
          cls.name.toLowerCase().includes(keyword.toLowerCase()) ||
          cls.description?.toLowerCase().includes(keyword.toLowerCase()) ||
          cls.grade.includes(keyword)
        );
        
        // 这里可以替换为实际的API调用
        // const response = await getClasses({ page: currentPage, size: pageSize, keyword });
        // setData(response);
        
      } catch (error) {
        console.log('Failed to load classes:', error);
        toast.error('加载班级列表失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, classes]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = () => {
    setCurrentPage(0);
    loadData(searchTerm);
  };

  // 创建班级
  const onCreateSubmit = async (values: z.infer<typeof classFormSchema>) => {
    try {
      const newClass: Class = {
        id: Date.now().toString(),
        name: values.name,
        description: values.description,
        maxStudents: values.maxStudents,
        currentStudents: 0,
        grade: values.grade,
        remark: values.remark,
        createdAt: new Date().toISOString().split('T')[0],
        status: 'pending',
        students: [],
        syncStatus: 'pending'
      };

      const updatedClasses = [newClass, ...classes];
      setClasses(updatedClasses);
      saveClassesToStorage(updatedClasses);

      // 自动同步到 Tale 平台
      try {
        setSyncLoading(true);
        const syncResult = await classSyncService.syncClassToTale(newClass);
        
        if (syncResult.success) {
          // 更新班级的同步信息
          const updatedClass = {
            ...newClass,
            taleGroupId: syncResult.data?.taleGroupId,
            lastSyncTime: syncResult.data?.lastSyncTime,
            syncStatus: 'synced' as const
          };
          
          const finalClasses = updatedClasses.map(cls => 
            cls.id === newClass.id ? updatedClass : cls
          );
          setClasses(finalClasses);
          saveClassesToStorage(finalClasses);
          
          toast.success(`新班级 "${values.name}" 已成功创建并同步到 Tale 平台。`);
        } else {
          toast.warning(`班级 "${values.name}" 创建成功，但同步到 Tale 平台失败：${syncResult.message}`);
        }
      } catch (syncError) {
        console.error('同步失败:', syncError);
        toast.warning(`班级 "${values.name}" 创建成功，但同步到 Tale 平台失败`);
      } finally {
        setSyncLoading(false);
      }

      createForm.reset();
      setIsCreateDialogOpen(false);
      loadData();
    } catch (error) {
      console.error('Failed to create class:', error);
      toast.error('创建班级失败，请稍后重试');
    }
  };

  // 跳转到班级详情页面
  const handleViewDetail = (cls: Class) => {
    router.push(`/dashboard/classes/${cls.id}?className=${encodeURIComponent(cls.name)}`);
  };

  // 处理分页
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // 手动同步单个班级
  const handleSyncClass = async (cls: Class) => {
    try {
      setSyncLoading(true);
      setSyncStatus(prev => ({ ...prev, [cls.id]: 'pending' }));
      
      const syncResult = await classSyncService.syncClassToTale(cls);
      
      if (syncResult.success) {
        // 更新班级的同步信息
        const updatedClass = {
          ...cls,
          taleGroupId: syncResult.data?.taleGroupId || cls.taleGroupId,
          lastSyncTime: syncResult.data?.lastSyncTime,
          syncStatus: 'synced' as const
        };
        
        const updatedClasses = classes.map(c => c.id === cls.id ? updatedClass : c);
        setClasses(updatedClasses);
        saveClassesToStorage(updatedClasses);
        
        setSyncStatus(prev => ({ ...prev, [cls.id]: 'synced' }));
        toast.success(`班级 "${cls.name}" 同步成功`);
      } else {
        setSyncStatus(prev => ({ ...prev, [cls.id]: 'error' }));
        toast.error(`同步失败：${syncResult.message}`);
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus(prev => ({ ...prev, [cls.id]: 'error' }));
      toast.error('同步失败，请稍后重试');
    } finally {
      setSyncLoading(false);
    }
  };



  // 双向同步
  const handleBidirectionalSync = async () => {
    try {
      setSyncLoading(true);
      toast.info('开始双向同步班级数据...');
      
      const result = await classSyncService.syncBidirectional();
      
      if (result.success) {
        // 更新本地班级列表
        const syncedClasses = result.data?.pullResult?.data?.classes || classes;
        setClasses(syncedClasses);
        saveClassesToStorage(syncedClasses);
        
        toast.success(result.message);
      } else {
        toast.error(`双向同步失败：${result.message}`);
      }
    } catch (error) {
      console.error('双向同步失败:', error);
      toast.error('双向同步失败，请稍后重试');
    } finally {
      setSyncLoading(false);
    }
  };

  // 检查数据一致性
  const handleCheckConsistency = async () => {
    try {
      setSyncLoading(true);
      const result = await classSyncService.checkDataConsistency();
      
      if (result.isConsistent) {
        toast.success(`数据一致：本地 ${result.localCount} 个班级，远程 ${result.remoteCount} 个班级`);
      } else {
        toast.warning(`数据不一致：${result.inconsistencies.length} 个问题`);
        console.log('数据不一致详情:', result.inconsistencies);
      }
    } catch (error) {
      console.error('检查数据一致性失败:', error);
      toast.error('检查数据一致性失败');
    } finally {
      setSyncLoading(false);
    }
  };

  // 删除班级
  const handleDeleteClick = (cls: Class) => {
    setDeletingClass(cls);
    setConfirmClassName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClass) {
      toast.error('未选择要删除的班级');
      return;
    }

    if (confirmClassName !== deletingClass.name) {
      toast.error('班级名称不匹配');
      return;
    }

    try {
      // 如果班级已同步到 Tale 平台，先删除用户组
      if (deletingClass.taleGroupId) {
        try {
          const deleteResult = await classSyncService.deleteClassFromTale(deletingClass.taleGroupId);
          if (!deleteResult.success) {
            console.warn('删除 Tale 用户组失败:', deleteResult.message);
            toast.warning('本地班级已删除，但 Tale 平台用户组删除失败');
          }
        } catch (error) {
          console.error('删除 Tale 用户组失败:', error);
          toast.warning('本地班级已删除，但 Tale 平台用户组删除失败');
        }
      }

      const updatedClasses = classes.filter(cls => cls.id !== deletingClass.id);
      setClasses(updatedClasses);
      saveClassesToStorage(updatedClasses);

      toast.success('班级已删除');
      setIsDeleteDialogOpen(false);
      setDeletingClass(null);
      setConfirmClassName('');
      loadData();
    } catch (error) {
      console.error('Failed to delete class:', error);
      toast.error('删除班级失败，请稍后重试');
    }
  };

  // 过滤班级数据
  const filteredClasses = classes.filter(cls => 
    !searchTerm || 
    cls.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cls.grade.includes(searchTerm)
  );

  // 分页处理
  const startIndex = currentPage * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedClasses = filteredClasses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredClasses.length / pageSize);

  // 如果没有权限，显示权限不足页面
  if (!canManageClasses) {
    return (
      <>
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
        </div>
        <div className="w-full max-w-7xl mx-auto space-y-6 p-6">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">权限不足</h1>
            <p className="text-gray-600">您没有权限访问班级管理功能</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='flex h-16 items-center border-b bg-gradient-to-r from-green-50 to-emerald-50 px-4 shadow-sm'>
        <SidebarTrigger />
      </div>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-green-50/30 to-emerald-50/30 w-full max-w-7xl mx-auto space-y-6 p-6'>
        {/* 面包屑导航 */}
        <div className='mb-4'>
          <Breadcrumb />
        </div>
        {/* 页面标题 */}
        <div className='space-y-2'>
          <h1 className='text-4xl font-bold gradient-text-green tracking-tight'>
            {isCarbon ? '超级班级管理' : '班级管理'}
          </h1>
          <p className='text-gray-600 text-lg'>
            {isCarbon ? '您拥有超级权限，可以查看和管理所有班级信息' : '管理班级信息，分配学生，查看统计'}
          </p>
        </div>

        {/* 搜索和添加区域 */}
        <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
          <CardContent className='p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-t-lg'>
            <div className='flex justify-between items-center gap-4'>
              {/* 搜索区域 */}
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

              {/* 操作按钮组 */}
              <div className='flex items-center gap-2 flex-wrap'>
                <Button
                  variant='outline'
                  onClick={handleBidirectionalSync}
                  disabled={syncLoading}
                  className='bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                >
                  <ArrowLeftRight className={`mr-2 h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
                  双向同步
                </Button>
                <Button
                  variant='outline'
                  onClick={handleCheckConsistency}
                  disabled={syncLoading}
                  className='bg-orange-50 hover:bg-orange-100 text-orange-700 border-orange-200'
                >
                  <Shield className={`mr-2 h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
                  检查一致性
                </Button>
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
            </div>
          </CardContent>
        </Card>



        {/* 班级列表 */}
        <Card>
          <CardContent className='p-6'>
            <div className='mb-4'>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>班级列表</h3>
              <p className='text-sm text-gray-600'>点击"查看详情"按钮查看详细班级信息和学生管理</p>
            </div>
          </CardContent>
          <CardContent className='p-0'>
            {loading ? (
              <div className='flex items-center justify-center h-64'>
                <div className='text-lg'>加载中...</div>
              </div>
            ) : (
              <Table className='border-0'>
                <TableHeader>
                  <TableRow className='bg-gradient-to-r from-green-50 to-emerald-50 border-0'>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      班级名称
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      描述
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      年级
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      学生数
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      状态
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      创建日期
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      备注
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      同步状态
                    </TableHead>
                    <TableHead className='font-semibold text-gray-800 border-0'>
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedClasses.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className='text-center py-8 text-gray-500'
                      >
                        {searchTerm ? '未找到匹配的班级' : '暂无班级数据'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedClasses.map(cls => (
                      <TableRow key={cls.id} className='hover:bg-green-50/50 transition-colors duration-200 border-0'>
                        <TableCell className='font-medium'>
                          {cls.name}
                        </TableCell>
                        <TableCell>{cls.description || '-'}</TableCell>
                        <TableCell>{cls.grade}</TableCell>
                        <TableCell>
                          {cls.currentStudents} / {cls.maxStudents}
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
                          {new Date(cls.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{cls.remark || '-'}</TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            {cls.syncStatus === 'synced' ? (
                              <div className='flex items-center gap-1 text-green-600'>
                                <CheckCircle className='h-4 w-4' />
                                <span className='text-xs'>已同步</span>
                              </div>
                            ) : cls.syncStatus === 'pending' ? (
                              <div className='flex items-center gap-1 text-yellow-600'>
                                <Clock className='h-4 w-4' />
                                <span className='text-xs'>待同步</span>
                              </div>
                            ) : cls.syncStatus === 'error' ? (
                              <div className='flex items-center gap-1 text-red-600'>
                                <XCircle className='h-4 w-4' />
                                <span className='text-xs'>同步失败</span>
                              </div>
                            ) : (
                              <div className='flex items-center gap-1 text-gray-500'>
                                <Cloud className='h-4 w-4' />
                                <span className='text-xs'>未同步</span>
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center gap-2'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleViewDetail(cls)}
                              className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-105'
                              title='查看详情'
                            >
                              <Eye className='h-4 w-4' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleSyncClass(cls)}
                              disabled={syncLoading}
                              className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 transition-all duration-200 hover:scale-105'
                              title='同步到 Tale 平台'
                            >
                              <RefreshCw className={`h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleDeleteClick(cls)}
                              className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105'
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
        {totalPages > 1 && (
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
        )}

        {/* 资料库管理入口 */}
        <Card className='mt-8'>
          <CardContent className='p-6'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-lg font-semibold text-gray-900 mb-2'>资料库管理</h3>
                <p className='text-sm text-gray-600'>管理教学资料、文档和资源文件</p>
              </div>
              <Button
                onClick={() => router.push('/dashboard/resources')}
                className='bg-blue-600 hover:bg-blue-700 text-white'
              >
                <FolderOpen className='w-4 h-4 mr-2' />
                进入资料库
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 删除确认弹框 */}
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
