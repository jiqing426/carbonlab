'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  FolderOpen,
  Edit,
  Trash2,
  FileText,
  Music,
  Video,
  FileImage,
  Link,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
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
  const { currentApp } = useUserStore();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddRepoDialog, setShowAddRepoDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newRepo, setNewRepo] = useState({
    folderName: '',
    remark: '',
    folderType: [] as string[],
    folderAttr: '{}',
  });

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

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    setNewRepo(prev => ({
      ...prev,
      folderType: checked
        ? [...prev.folderType, fileType]
        : prev.folderType.filter(type => type !== fileType),
    }));
  };

  const parseJsonAttr = (jsonStr: string) => {
    try {
      return JSON.parse(jsonStr);
    } catch {
      return {};
    }
  };

  const handleAddRepository = async () => {
    try {
      if (!newRepo.folderName.trim()) {
        toast.error('请输入资料库名称');
        return;
      }

      if (newRepo.folderType.length === 0) {
        toast.error('请选择至少一种支持的文件类型');
        return;
      }

      const newRepository: Repository = {
        id: `repo_${Date.now()}`,
        folderName: newRepo.folderName.trim(),
        folderType: newRepo.folderType,
        remark: newRepo.remark.trim(),
        folderAttr: parseJsonAttr(newRepo.folderAttr),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        supportedFileTypes: newRepo.folderType
      };

      const updatedRepositories = [newRepository, ...repositories];
      setRepositories(updatedRepositories);
      
      // 保存到 localStorage
      localStorage.setItem('mockRepositories', JSON.stringify(updatedRepositories));
      
      setShowAddRepoDialog(false);
      setNewRepo({
        folderName: '',
        remark: '',
        folderType: [],
        folderAttr: '{}',
      });
      
      toast.success('资料库创建成功');
    } catch (error) {
      toast.error('创建资料库失败');
      console.error('Failed to create repository:', error);
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
    if (!deletingRepo) return;

    if (confirmRepoName !== deletingRepo.folderName) {
      toast.error('输入的资料库名称不匹配');
      return;
    }

    try {
      const updatedRepositories = repositories.filter(repo => repo.id !== deletingRepo.id);
      setRepositories(updatedRepositories);
      
      // 保存到 localStorage
      localStorage.setItem('mockRepositories', JSON.stringify(updatedRepositories));
      
      // 同时删除相关的文件数据
      localStorage.removeItem(`files_${deletingRepo.id}`);
      
      setIsDeleteDialogOpen(false);
      setDeletingRepo(null);
      setConfirmRepoName('');
      toast.success('资料库删除成功');
    } catch (error) {
      toast.error('删除资料库失败');
      console.error('Failed to delete repository:', error);
    }
  };

  const handleViewRepository = (repo: Repository) => {
    // 导航到资源详情页面
    router.push(`/dashboard/resources/${repo.id}`);
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
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
      </div>
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex justify-between items-center mb-8'>
            <h1 className='text-3xl font-bold text-foreground tracking-tight'>
              资料库管理
            </h1>
          </div>

          {error && (
            <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
              <p className='text-red-600'>{error}</p>
            </div>
          )}

          <div className='w-full space-y-6'>
            {/* 头部区域 */}
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <CardTitle>资料库管理</CardTitle>
                  <Button
                    onClick={() => {
                      setNewRepo({
                        folderName: '',
                        remark: '',
                        folderType: [],
                        folderAttr: '{}',
                      });
                      setShowAddRepoDialog(true);
                    }}
                    disabled={loading}
                  >
                    <Plus className='w-4 h-4 mr-2' />
                    添加资料库
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='flex gap-4 items-end'>
                  <div className='flex-1'>
                    <label className='text-sm font-medium text-gray-700'>
                      搜索资料库
                    </label>
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
                <Table>
                  <TableHeader>
                    <TableRow className='bg-gray-50'>
                      <TableHead className='font-semibold text-gray-900'>
                        资料库名称
                      </TableHead>
                      <TableHead className='font-semibold text-gray-900'>
                        支持类型
                      </TableHead>
                      <TableHead className='font-semibold text-gray-900'>
                        控制目标
                      </TableHead>
                      <TableHead className='font-semibold text-gray-900'>
                        创建时间
                      </TableHead>
                      <TableHead className='font-semibold text-gray-900'>
                        备注
                      </TableHead>
                      <TableHead className='font-semibold text-gray-900 text-right'>
                        操作
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRepositories.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className='text-center py-8 text-gray-500'
                        >
                          {searchTerm
                            ? '未找到匹配的资料库'
                            : '暂无资料库数据'}
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredRepositories.map(repo => (
                        <TableRow key={repo.id} className='hover:bg-gray-50'>
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
                                className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                                title='查看详情'
                              >
                                <Edit className='h-4 w-4' />
                              </Button>
                              <Button
                                variant='ghost'
                                size='sm'
                                onClick={() => handleDeleteClick(repo)}
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
        </div>

        {/* 添加资料库对话框 */}
        <Dialog open={showAddRepoDialog} onOpenChange={setShowAddRepoDialog}>
          <DialogContent className='max-w-2xl max-h-[80vh] overflow-y-auto'>
            <DialogHeader>
              <DialogTitle>添加资料库</DialogTitle>
              <DialogDescription>
                创建一个新的资料库来管理文档
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='folderName'>资料库名称</Label>
                <Input
                  id='folderName'
                  value={newRepo.folderName}
                  onChange={e =>
                    setNewRepo({ ...newRepo, folderName: e.target.value })
                  }
                  placeholder='输入资料库名称'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='remark'>备注</Label>
                <Input
                  id='remark'
                  value={newRepo.remark}
                  onChange={e =>
                    setNewRepo({ ...newRepo, remark: e.target.value })
                  }
                  placeholder='输入备注信息'
                />
              </div>
              <div className='space-y-2'>
                <Label>支持的文件类型</Label>
                <div className='grid grid-cols-2 gap-2 max-h-32 overflow-y-auto'>
                  {fileTypeOptions.map(option => (
                    <div
                      key={option.value}
                      className='flex items-center space-x-2'
                    >
                      <Checkbox
                        id={option.value}
                        checked={newRepo.folderType.includes(option.value)}
                        onCheckedChange={checked =>
                          handleFileTypeChange(option.value, checked as boolean)
                        }
                      />
                      <Label
                        htmlFor={option.value}
                        className='flex items-center gap-2'
                      >
                        <option.icon className={`w-4 h-4 ${option.color}`} />
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className='sticky bottom-0 bg-white pt-4 border-t'>
              <Button
                variant='outline'
                onClick={() => setShowAddRepoDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleAddRepository}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                确认删除资料库
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                此操作无法撤销。请输入资料库名称「{deletingRepo?.folderName}
                」来确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  请输入资料库名称确认
                </label>
                <Input
                  placeholder='输入资料库名称'
                  value={confirmRepoName}
                  onChange={e => setConfirmRepoName(e.target.value)}
                  className='bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDeleteDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDeleteRepository}
                disabled={confirmRepoName !== deletingRepo?.folderName}
              >
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
