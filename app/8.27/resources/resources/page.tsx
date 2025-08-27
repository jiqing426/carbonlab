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
import JsonVisualEditor from '@/components/json-visual-editor';
import DocumentEditor from './document-editor';
import {
  getFolders,
  createFolder,
  deleteFolder,
  type FoldersQueryParams,
} from '@/lib/api/folders';
import { useTale } from '@/lib/contexts/TaleContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';

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
}

interface Document {
  [x: string]: unknown;
  id: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  repositoryId: string;
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

export default function DataManagement() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState<
    'repositories' | 'documents' | 'editor'
  >('repositories');
  const [selectedDocument] = useState<Document | null>(null);
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

  const { currentApp } = useTale();

  const loadRepositories = useCallback(async () => {
    if (!currentApp?.app_key) return;
    setLoading(true);
    setError(null);
    try {
      const params: FoldersQueryParams = {
        page: 0,
        size: 100,
      };
      const response = await getFolders(params, currentApp.app_key);
      const transformedRepos: Repository[] = response.data.content.map(
        folder => ({
          id: folder.id,
          folderName: folder.folderName,
          folderType: folder.folderType || [],
          folderAttr: folder.folderAttr,
          remark: folder.remark || '',
          createdAt: folder.createdAt,
          updatedAt: folder.updatedAt,
          supportedFileTypes: folder.folderType || [],
        })
      );
      setRepositories(transformedRepos);
    } catch (err) {
      setError('加载资料库失败');
      console.error('Failed to load repositories:', err);
    } finally {
      setLoading(false);
    }
  }, [currentApp?.app_key]);

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
    if (!currentApp?.app_key) return;
    try {
      await createFolder(
        {
          folderName: newRepo.folderName,
          folderType: newRepo.folderType,
          folderAttr: parseJsonAttr(newRepo.folderAttr),
          remark: newRepo.remark,
        },
        currentApp.app_key
      );
      setShowAddRepoDialog(false);
      setNewRepo({
        folderName: '',
        remark: '',
        folderType: [],
        folderAttr: '{}',
      });
      loadRepositories();
    } catch {
      setError('添加资料库失败');
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
    if (!deletingRepo || !currentApp?.app_key) return;

    if (confirmRepoName !== deletingRepo.folderName) {
      setError('输入的资料库名称不匹配');
      return;
    }

    try {
      await deleteFolder(deletingRepo.id, currentApp.app_key);
      setIsDeleteDialogOpen(false);
      setDeletingRepo(null);
      setConfirmRepoName('');
      loadRepositories();
    } catch {
      setError('删除资料库失败');
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
        <Breadcrumb />
      </div>
      <div className='p-6'>
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

        {currentPage === 'editor' ? (
          <DocumentEditor
            onBack={() => setCurrentPage('repositories')}
            document={
              selectedDocument
                ? {
                    id: selectedDocument.id,
                    title: selectedDocument.title,
                    citation: '',
                    createTime: selectedDocument.createdAt,
                    contentType: 'markdown' as const,
                    fileType: 'pdf' as const,
                    content: '',
                    fileName: '',
                    externalUrl: '',
                  }
                : null
            }
            repository={null}
          />
        ) : (
          <div className='w-full max-w-7xl mx-auto space-y-6'>
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
                            colSpan={5}
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
        )}

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
              <div className='space-y-2'>
                <Label>文件夹属性 (JSON)</Label>
                <div className='max-h-40 overflow-y-auto'>
                  <JsonVisualEditor
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    data={(newRepo.folderAttr as any) || {}}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onDataChange={(value: any) =>
                      setNewRepo({ ...newRepo, folderAttr: value })
                    }
                    className='h-full w-full'
                  />
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
    </>
  );
}
