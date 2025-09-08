'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FolderOpen,
  Edit,
  Trash2,
  FileText,
  Music,
  Video,
  FileImage,
  Link,
  RefreshCw,
  Cloud,
  CheckCircle,
  XCircle,
  Clock,
  ArrowLeftRight,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useUserStore } from '@/lib/stores/user-store';
import { Breadcrumb } from '@/components/breadcrumb';
import { resourceSyncService, LocalRepository } from '@/lib/services/resource-sync-service';

// 资料库接口类型
interface Repository {
  id: string;
  folderName: string;
  folderType: string[];
  folderAttr?: {
    icon?: string;
    color?: string;
  };
  remark: string;
  createdAt: string;
  updatedAt: string;
  supportedFileTypes: string[];
  // 新增字段：用于控制特定页面内容
  controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
  displayOrder?: number; // 显示顺序
  // 同步相关字段
  taleFolderId?: string; // Tale 平台文件夹 ID
  lastSyncTime?: string; // 最后同步时间
  syncStatus?: 'synced' | 'pending' | 'error'; // 同步状态
  syncError?: string; // 同步错误信息
}

const fileTypeOptions = [
  {
    value: 'AUDIO',
    label: '音频',
    icon: Music,
    description: 'MP3, WAV, AAC 等格式',
    color: 'text-green-600',
  },
  {
    value: 'VIDEO',
    label: '视频',
    icon: Video,
    description: 'MP4, AVI, MOV 等格式',
    color: 'text-purple-600',
  },
  {
    value: 'PDF',
    label: 'PDF',
    icon: FileText,
    description: 'PDF 文档格式',
    color: 'text-red-600',
  },
  {
    value: 'IMAGE',
    label: '图片',
    icon: FileImage,
    description: 'JPG, PNG, GIF 等格式',
    color: 'text-yellow-600',
  },
  {
    value: 'LINK',
    label: '外部链接',
    icon: Link,
    description: '网页链接、在线文档等',
    color: 'text-blue-600',
  },
  {
    value: 'MARKDOWN',
    label: 'Markdown',
    icon: FileText,
    description: 'MD 文档格式',
    color: 'text-indigo-600',
  },
  {
    value: 'DOC',
    label: '文档',
    icon: FileText,
    description: 'DOC, DOCX 等格式',
    color: 'text-orange-600',
  },
];

// 模拟资料库数据
const mockRepositories: Repository[] = [
  {
    id: 'repo_001',
    folderName: '最新政策',
    folderType: ['PDF'],
    remark: '存储最新的政策法规文件，控制主页"最新政策"栏目',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    supportedFileTypes: ['PDF'],
    controlTarget: 'latest-policy',
    displayOrder: 1,
  },
  {
    id: 'repo_002',
    folderName: '双碳快讯',
    folderType: ['EXCEL', 'LINK'],
    remark: '双碳相关新闻资讯，控制主页"热点新闻"栏目',
    createdAt: '2024-01-16T10:00:00Z',
    updatedAt: '2024-01-16T10:00:00Z',
    supportedFileTypes: ['EXCEL', 'LINK'],
    controlTarget: 'hot-news',
    displayOrder: 2,
  },
  {
    id: 'repo_003',
    folderName: '数据洞察',
    folderType: ['EXCEL', 'PDF'],
    remark: '数据分析和洞察报告，控制datasets页面内容',
    createdAt: '2024-01-17T10:00:00Z',
    updatedAt: '2024-01-17T10:00:00Z',
    supportedFileTypes: ['EXCEL', 'PDF'],
    controlTarget: 'global-data',
    displayOrder: 3,
  },
  {
    id: 'repo_004',
    folderName: '研究报告',
    folderType: ['PDF', 'LINK'],
    remark: '学术研究报告和论文，控制reports页面内容',
    createdAt: '2024-01-18T10:00:00Z',
    updatedAt: '2024-01-18T10:00:00Z',
    supportedFileTypes: ['PDF', 'LINK'],
    controlTarget: 'china-report',
    displayOrder: 4,
  }
];

export default function ResourcesManagement() {
  const router = useRouter();
  const { user } = useUserStore();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');


  const loadRepositories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 尝试从 localStorage 加载已保存的数据
      const savedRepos = localStorage.getItem('mockRepositories');
      let repositoriesToUse = mockRepositories;
      
      if (savedRepos) {
        try {
          repositoriesToUse = JSON.parse(savedRepos);
          console.log('Loaded repositories from localStorage:', repositoriesToUse);
        } catch (e) {
          console.warn('Failed to parse saved repositories, using default:', e);
          repositoriesToUse = mockRepositories;
        }
      } else {
        // 如果没有保存的数据，初始化默认数据到 localStorage
        const syncedRepositories = mockRepositories.map(repo => ({
          ...repo,
          supportedFileTypes: repo.folderType
        }));
        localStorage.setItem('mockRepositories', JSON.stringify(syncedRepositories));
        repositoriesToUse = syncedRepositories;
      }
      
      setRepositories(repositoriesToUse);
    } catch (err) {
      setError('加载资料库失败');
      console.error('Failed to load repositories:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRepositories();
  }, [loadRepositories]);


  const parseJsonAttr = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };


  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingRepo, setDeletingRepo] = useState<Repository | null>(null);
  const [confirmRepoName, setConfirmRepoName] = useState('');

  const handleDeleteClick = (repo: Repository) => {
    setDeletingRepo(repo);
    setConfirmRepoName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteRepository = async () => {
    if (!deletingRepo) {
      toast.error('未选择要删除的资料库');
      return;
    }

    if (confirmRepoName !== deletingRepo.folderName) {
      toast.error('输入的资料库名称不匹配，请重新输入');
      return;
    }

    try {
      // 显示删除进度
      toast.loading('正在删除资料库...', { id: 'delete-repo' });
      
      // 如果有关联的 Tale 文件夹，先从 Tale 平台删除
      if (deletingRepo.taleFolderId) {
        try {
          await resourceSyncService.deleteRepositoryFromTale(deletingRepo.taleFolderId);
        } catch (syncError) {
          console.warn('从 Tale 平台删除失败，继续本地删除:', syncError);
        }
      }
      
      // 模拟删除延迟，让用户感知到操作正在进行
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedRepositories = repositories.filter(repo => repo.id !== deletingRepo.id);
      setRepositories(updatedRepositories);
      
      // 保存到 localStorage
      localStorage.setItem('mockRepositories', JSON.stringify(updatedRepositories));
      
      // 同时删除相关的文件数据
      localStorage.removeItem(`files_${deletingRepo.id}`);
      
      // 关闭对话框并重置状态
      setIsDeleteDialogOpen(false);
      setDeletingRepo(null);
      setConfirmRepoName('');
      
      // 显示成功消息
      toast.success(`资料库「${deletingRepo.folderName}」已成功删除`, { id: 'delete-repo' });
      
      // 重新加载数据以确保界面同步
      loadRepositories();
    } catch (error) {
      toast.error('删除资料库失败，请稍后重试', { id: 'delete-repo' });
      console.error('Failed to delete repository:', error);
    }
  };

  const handleViewRepository = (repo: Repository) => {
    // 导航到资源详情页面
    router.push(`/dashboard/resources/${repo.id}`);
  };

  // 同步单个资源库
  const handleSyncRepository = async (repository: Repository) => {
    try {
      setSyncLoading(true);
      toast.info(`开始同步资源库 "${repository.folderName}"...`);
      
      const result = await resourceSyncService.syncRepositoryToTale(repository as LocalRepository);
      
      if (result.success) {
        // 更新资源库的同步状态
        const updatedRepositories = repositories.map(repo => 
          repo.id === repository.id 
            ? {
                ...repo,
                taleFolderId: result.data?.taleFolderId || repo.taleFolderId,
                lastSyncTime: result.data?.lastSyncTime,
                syncStatus: 'synced' as const,
                syncError: undefined
              }
            : repo
        );
        
        setRepositories(updatedRepositories);
        localStorage.setItem('mockRepositories', JSON.stringify(updatedRepositories));
        
        toast.success(result.message);
      } else {
        // 更新错误状态
        const updatedRepositories = repositories.map(repo => 
          repo.id === repository.id 
            ? {
                ...repo,
                syncStatus: 'error' as const,
                syncError: result.error
              }
            : repo
        );
        
        setRepositories(updatedRepositories);
        localStorage.setItem('mockRepositories', JSON.stringify(updatedRepositories));
        
        toast.error(`同步失败：${result.message}`);
      }
    } catch (error) {
      console.error('同步资源库失败:', error);
      toast.error('同步失败，请稍后重试');
    } finally {
      setSyncLoading(false);
    }
  };

  // 同步到 Tale 平台
  const handleBidirectionalSync = async () => {
    try {
      setSyncLoading(true);
      setSyncStatus('syncing');
      toast.info('开始同步资源库数据到 Tale 平台...');
      
      const result = await resourceSyncService.syncBidirectional();
      
      if (result.success) {
        // 重新加载数据
        await loadRepositories();
        setSyncStatus('success');
        toast.success(result.message);
      } else {
        setSyncStatus('error');
        toast.error(`同步失败：${result.message}`);
      }
    } catch (error) {
      console.error('同步失败:', error);
      setSyncStatus('error');
      toast.error('同步失败，请稍后重试');
    } finally {
      setSyncLoading(false);
    }
  };

  // 检查数据一致性
  const handleCheckConsistency = async () => {
    try {
      setSyncLoading(true);
      toast.info('正在检查数据一致性...');
      
      const consistency = await resourceSyncService.checkDataConsistency();
      
      if (consistency.isConsistent) {
        toast.success(`数据一致性检查通过：本地 ${consistency.localCount} 个，远程 ${consistency.remoteCount} 个资源库`);
      } else {
        toast.warning(`发现数据不一致：${consistency.inconsistencies.length} 个问题`);
        console.warn('数据不一致详情:', consistency.inconsistencies);
      }
    } catch (error) {
      console.error('检查数据一致性失败:', error);
      toast.error('检查数据一致性失败');
    } finally {
      setSyncLoading(false);
    }
  };

  const filteredRepositories = repositories.filter(repo => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      repo.folderName.toLowerCase().includes(searchLower) ||
      repo.remark.toLowerCase().includes(searchLower)
    );
  });

  return (
    <>
      <div className='flex h-16 items-center border-b bg-gradient-to-r from-blue-50 to-indigo-50 px-4 shadow-sm'>
        <SidebarTrigger />
      </div>
      <div className='min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/30 p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-6'>
            <Breadcrumb />
          </div>
          <div className='flex justify-between items-center mb-8'>
            <div className='space-y-2'>
              <h1 className='text-4xl font-bold gradient-text-blue tracking-tight'>
                资料库管理
              </h1>
              <p className='text-gray-600 text-lg'>管理和组织您的学习资源</p>
            </div>
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-red-600'>{error}</p>
            </div>
          )}

          <div className='w-full space-y-6'>
            {/* 头部区域 */}
            <Card className='shadow-lg border-0 bg-white/80 backdrop-blur-sm'>
              <CardHeader className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg'>
                <div className='flex items-center justify-between'>
                  <CardTitle className='text-xl font-semibold text-gray-800 flex items-center gap-2'>
                    <FolderOpen className='h-5 w-5 text-blue-600' />
                    资料库管理
                  </CardTitle>
                  <div className='flex items-center gap-2'>
                    <Button
                      variant='outline'
                      onClick={handleBidirectionalSync}
                      disabled={syncLoading}
                      className='bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200'
                    >
                      <ArrowLeftRight className={`mr-2 h-4 w-4 ${syncLoading ? 'animate-spin' : ''}`} />
                      同步到 Tale 平台
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
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4 items-end'>
                  <div className='flex-1'>
                    <div className='relative mt-1'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                      <Input
                        placeholder='搜索资料库名称、备注...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='pl-10'
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* 数据表格 */}
          <Card>
            <CardContent className='p-0'>
              {loading ? (
                <div className='flex items-center justify-center h-64'>
                  <div className='text-lg'>加载中...</div>
                </div>
              ) : (
                <Table className='border-0'>
                  <TableHeader>
                    <TableRow className='bg-gradient-to-r from-blue-50 to-indigo-50 border-0'>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        资料库名称
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        支持类型
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        控制目标
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        同步状态
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        创建时间
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 border-0'>
                        备注
                      </TableHead>
                      <TableHead className='font-semibold text-gray-800 text-right border-0'>
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRepositories.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={7}
                          className='text-center py-8 text-gray-500'
                        >
                          {searchTerm
                            ? '未找到匹配的资料库'
                            : '暂无资料库数据'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRepositories.map(repo => (
                        <TableRow key={repo.id} className='hover:bg-blue-50/50 transition-colors duration-200 border-0'>
                          <TableCell>
                            <div className='flex items-center space-x-3'>
                              <FolderOpen className='w-5 h-5 text-blue-600' />
                              <span className='font-medium text-gray-900'>
                                {repo.folderName}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className='flex flex-wrap gap-1'>
                              {repo.folderType.slice(0, 3).map(type => {
                                const option = fileTypeOptions.find(
                                  opt => opt.value === type
                                );
                                return option ? (
                                  <Badge
                                    key={type}
                                    variant='secondary'
                                    className='text-xs'
                                  >
                                    <option.icon
                                      className={`w-3 h-3 mr-1 ${option.color}`}
                                    />
                                    {option.label}
                                  </Badge>
                                ) : null;
                              })}
                              {repo.folderType.length > 3 && (
                                <Badge variant='outline' className='text-xs'>
                                  +{repo.folderType.length - 3}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            {repo.controlTarget ? (
                              <Badge 
                                variant='outline' 
                                className={`text-xs ${
                                  repo.controlTarget === 'latest-policy' ? 'border-blue-500 text-blue-600' :
                                  repo.controlTarget === 'hot-news' ? 'border-green-500 text-green-600' :
                                  repo.controlTarget === 'global-data' ? 'border-purple-500 text-purple-600' :
                                  'border-orange-500 text-orange-600'
                                }`}
                              >
                                {repo.controlTarget === 'latest-policy' ? '最新政策' :
                                 repo.controlTarget === 'hot-news' ? '热点新闻' :
                                 repo.controlTarget === 'global-data' ? '全球数据' :
                                 '中国报告'}
                              </Badge>
                            ) : (
                              <span className='text-gray-400 text-xs'>未设置</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              {repo.syncStatus === 'synced' ? (
                                <div className='flex items-center gap-1 text-green-600'>
                                  <CheckCircle className='h-4 w-4' />
                                  <span className='text-xs'>已同步</span>
                                </div>
                              ) : repo.syncStatus === 'pending' ? (
                                <div className='flex items-center gap-1 text-yellow-600'>
                                  <Clock className='h-4 w-4' />
                                  <span className='text-xs'>待同步</span>
                                </div>
                              ) : repo.syncStatus === 'error' ? (
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
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleSyncRepository(repo)}
                                disabled={syncLoading}
                                className='h-6 w-6 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                title='手动同步'
                              >
                                <RefreshCw className={`h-3 w-3 ${syncLoading ? 'animate-spin' : ''}`} />
                              </Button>
                            </div>
                            {repo.lastSyncTime && (
                              <div className='text-xs text-gray-400 mt-1'>
                                {new Date(repo.lastSyncTime).toLocaleString('zh-CN')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className='text-gray-600'>
                            {new Date(repo.createdAt).toLocaleDateString(
                              'zh-CN'
                            )}
                          </TableCell>
                          <TableCell className='text-gray-600'>
                            {repo.remark || '-'}
                          </TableCell>
                          <TableCell className='text-right'>
                            <div className='flex items-center justify-end gap-2'>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleViewRepository(repo)}
                                className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 hover:scale-105'
                                title='查看详情'
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteClick(repo)}
                                className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 transition-all duration-200 hover:scale-105'
                                title='删除资料库（需要二次确认）'
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
        </div>


        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border max-w-md'>
            <DialogHeader>
              <DialogTitle className='text-foreground flex items-center gap-2'>
                <Trash2 className='h-5 w-5 text-red-500' />
                确认删除资料库
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                <div className='space-y-2'>
                  <p>⚠️ <strong>警告：此操作无法撤销！</strong></p>
                  <p>删除资料库「<span className='font-semibold text-red-600'>{deletingRepo?.folderName}</span>」将会：</p>
                  <ul className='list-disc list-inside text-sm space-y-1 ml-4'>
                    <li>永久删除资料库及其所有文件</li>
                    <li>清除相关的页面内容控制</li>
                    <li>影响前端页面的数据展示</li>
                  </ul>
                  <p className='text-sm font-medium'>请输入资料库名称以确认删除：</p>
                </div>
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  资料库名称
                </label>
                <Input
                  placeholder={`请输入「${deletingRepo?.folderName}」`}
                  value={confirmRepoName}
                  onChange={e => setConfirmRepoName(e.target.value)}
                  className='bg-background border-border'
                  autoComplete='off'
                />
                {confirmRepoName && confirmRepoName !== deletingRepo?.folderName && (
                  <p className='text-xs text-red-500'>名称不匹配，请重新输入</p>
                )}
                {confirmRepoName === deletingRepo?.folderName && (
                  <p className='text-xs text-green-500'>✓ 名称匹配，可以删除</p>
                )}
              </div>
            </div>
            <DialogFooter className='gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsDeleteDialogOpen(false);
                  setDeletingRepo(null);
                  setConfirmRepoName('');
                }}
                className='flex-1'
              >
                取消
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDeleteRepository}
                disabled={confirmRepoName !== deletingRepo?.folderName}
                className='flex-1'
              >
                <Trash2 className='h-4 w-4 mr-2' />
                确认删除
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>
    </>
  );
}
