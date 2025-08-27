'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Settings,
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';
import DocumentEditor from '../document-editor';
import { getFiles, deleteFile, createFile, type FilesQueryParams, type CreateFileRequest } from '@/lib/api/files';
import { getFolderById, updateFolder } from '@/lib/api/folders';
import { useTale } from '@/lib/contexts/TaleContext';

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

// 定义与DocumentEditor兼容的DocumentData接口
interface DocumentData {
  id?: string;
  title: string;
  citation: string;
  createTime: string;
  contentType: 'markdown' | 'file' | 'link';
  fileType:
    | 'pdf'
    | 'audio'
    | 'video'
    | 'image'
    | 'link'
    | 'markdown'
    | 'doc'
    | 'other';
  content: string;
  fileName: string;
  externalUrl: string;
  fileAttr?: Record<string, unknown>;
  linkUrl?: string;
  remark?: string;
}

// 修复 Document 接口，包含所有必需字段
interface Document {
  id: string;
  title: string;
  createdAt: string;
  publishedAt: string;
  repositoryId: string;
  citation: string;
  createTime: string;
  contentType: 'markdown' | 'file' | 'link';
  fileType:
    | 'pdf'
    | 'audio'
    | 'video'
    | 'image'
    | 'link'
    | 'markdown'
    | 'doc'
    | 'other';
  content: string;
  fileName: string;
  externalUrl: string;
  fileAttr?: Record<string, unknown>;
  linkUrl?: string;
  remark?: string;
}

// 根据文件类型获取对应的图标和标签信息
const getFileTypeInfo = (fileType: string) => {
  const normalizedType = fileType.toUpperCase();
  return fileTypeOptions.find(option => option.value === normalizedType) || {
    value: 'OTHER',
    label: '其他',
    icon: FileText,
    color: 'text-gray-600',
  };
};

export default function RepositoryDocuments() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params.id as string;
  const { currentApp } = useTale();

  const [currentPage, setCurrentPage] = useState<'documents' | 'editor'>(
    'documents'
  );
  const [selectedDocument] = useState<DocumentData | null>(null);
  const [repository, setRepository] = useState<Repository | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingDocument, setDeletingDocument] = useState<Document | null>(
    null
  );
  const [confirmDocName, setConfirmDocName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newDocumentTitle, setNewDocumentTitle] = useState('');
  const [newDocumentType, setNewDocumentType] = useState('');

  // 加载资料库信息
  const loadRepository = async () => {
    if (!currentApp?.app_key) {
      console.log('No app key available');
      setError('请先选择应用');
      return;
    }

    try {
      setError(null);
      const repo = await getFolderById(repositoryId, currentApp.app_key);

      if (repo) {
        setRepository({
          ...repo,
          supportedFileTypes: repo.folderType,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取资料库信息失败');
    }
  };

  // 加载文件列表
  const loadDocuments = async (params?: FilesQueryParams) => {
    if (!currentApp?.app_key) {
      console.log('No app key available');
      setError('请先选择应用');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await getFiles(
        {
          page: 0,
          size: 50,
          sortBy: 'createdAt',
          folderId: repositoryId,
          keyword: searchTerm || undefined,
          ...params,
        },
        currentApp.app_key
      );

      if (response.code === 200) {
        const docs: Document[] =
          response.data?.content?.map(file => ({
            id: file.id,
            title: file.fileName,
            createdAt: new Date(file.createdAt).toLocaleString('zh-CN'),
            publishedAt: new Date(file.updatedAt).toLocaleString('zh-CN'),
            repositoryId: file.folderId,
            citation: file.remark || '',
            createTime: new Date(file.createdAt).toLocaleString('zh-CN'),
            contentType: 'markdown' as const,
            fileType: (file.fileType?.toLowerCase() ||
              'pdf') as Document['fileType'],
            content: file.content || '',
            fileName: file.fileName,
            externalUrl: file.linkUrl || '',
            fileAttr:
              (file.fileAttr as Record<string, unknown>) ||
              ({} as Record<string, unknown>),
            linkUrl: file.linkUrl || '',
            remark: file.remark || '',
          })) || [];
        setDocuments(docs);
      } else {
        setError(response.msg || '获取文件列表失败');
        setDocuments([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '获取文件列表失败');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  // 初始加载
  useEffect(() => {
    if (repositoryId) {
      loadRepository();
      loadDocuments();
    }
  }, [repositoryId]); // eslint-disable-line react-hooks/exhaustive-deps

  // 搜索
  const handleSearch = () => {
    loadDocuments();
  };

  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddDocument = () => {
    // 打开创建资源对话框
    setIsCreateDialogOpen(true);
  };

  // 处理创建新文档
  const handleCreateDocument = async () => {
    if (!newDocumentTitle.trim() || !newDocumentType) {
      return;
    }

    if (!currentApp?.app_key) {
      setError('请先选择应用');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // 创建文件请求数据
      const createData: CreateFileRequest = {
        folderId: repositoryId,
        fileName: newDocumentTitle.trim(),
        fileType: newDocumentType,
        content: '', // 初始内容为空
        remark: '',
      };

      // 调用API创建文件
      const newFile = await createFile(createData, currentApp.app_key);

      // 关闭对话框并重置表单
      setIsCreateDialogOpen(false);
      setNewDocumentTitle('');
      setNewDocumentType('');

      // 跳转到编辑页面
      router.push(
        `/dashboard/resources/${repositoryId}/editor?mode=edit&docId=${newFile.id}`
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : '创建文档失败');
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = async (doc: Document) => {
    // 跳转到编辑文档页面
    router.push(
      `/dashboard/resources/${repositoryId}/editor?mode=edit&docId=${doc.id}`
    );
  };

  const handleDeleteClick = (doc: Document) => {
    setDeletingDocument(doc);
    setConfirmDocName('');
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteDocument = async () => {
    if (!deletingDocument || !currentApp?.app_key) {
      return;
    }

    if (confirmDocName !== deletingDocument.title) {
      setError('输入的文档标题不匹配');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await deleteFile(deletingDocument.id, currentApp.app_key);
      // 重新加载文档列表
      await loadDocuments();
      setIsDeleteDialogOpen(false);
      setDeletingDocument(null);
      setConfirmDocName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : '删除文件失败');
    } finally {
      setLoading(false);
    }
  };

  // 更新资料库信息
  const handleUpdateRepository = async () => {
    if (!repository) return;

    if (!currentApp?.app_key) {
      console.log('No app key available');
      setError('请先选择应用');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await updateFolder(
        repository.id,
        {
          folderName: repository.folderName,
          folderType: repository.folderType,
          folderAttr: repository.folderAttr || {},
          remark: repository.remark,
        },
        currentApp.app_key
      );

      setIsEditMode(false);
      // 重新加载资料库信息
      await loadRepository();
    } catch (err) {
      setError(err instanceof Error ? err.message : '更新资料库失败');
    } finally {
      setLoading(false);
    }
  };

  const handleFileTypeChange = (fileType: string, checked: boolean) => {
    if (!repository) return;

    setRepository({
      ...repository,
      folderType: checked
        ? [...repository.folderType, fileType]
        : repository.folderType.filter(type => type !== fileType),
    });
  };

  if (currentPage === 'editor') {
    return (
      <DocumentEditor
        onBack={() => {
          setCurrentPage('documents');
          // 保存完资源后刷新列表
          loadDocuments();
        }}
        document={selectedDocument}
        repository={
          repository
            ? {
                id: repository.id,
                supportedFileTypes: repository.supportedFileTypes || [],
                folderName: repository.folderName,
              }
            : null
        }
      />
    );
  }

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb
          items={[
            { label: '仪表板', href: '/dashboard' },
            { label: '资料库管理', href: '/dashboard/resources' },
            { label: repository?.folderName || '资料库详情' },
          ]}
        />
      </div>
      <div className='p-6 max-w-7xl mx-auto'>
        {error && (
          <div className='mb-4 p-4 bg-red-50 border border-red-200 rounded-md'>
            <p className='text-red-600'>{error}</p>
          </div>
        )}

        {/* Document List Header */}
        <div className='flex justify-between items-start mb-6'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900 mb-1'>
              {repository?.folderName || '文档列表'}
            </h1>
            <p className='text-gray-600'>管理资料库下的所有文档</p>
          </div>
          <Button onClick={handleAddDocument}>
            <Plus className='w-4 h-4 mr-2' />
            添加资源
          </Button>
        </div>

        {/* 资料库信息卡片 */}
        {repository && (
          <Card className='mb-6'>
            <CardContent className='p-6'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-semibold text-gray-900'>资料库信息</h3>
                    <div className='flex items-center gap-2'>
                      {isEditMode ? (
                        <>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              setIsEditMode(false);
                              // 重新加载资料库信息以恢复原始数据
                              loadRepository();
                            }}
                            className='h-8 px-3'
                          >
                            取消
                          </Button>
                          <Button
                            size='sm'
                            onClick={handleUpdateRepository}
                            disabled={loading}
                            className='h-8 px-3'
                          >
                            {loading ? '保存中...' : '保存'}
                          </Button>
                        </>
                      ) : (
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => setIsEditMode(true)}
                          className='h-8 px-3'
                        >
                          <Settings className='w-4 h-4 mr-2' />
                          编辑资料库
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='folderName'>资料库名称</Label>
                      {isEditMode ? (
                        <Input
                          id='folderName'
                          value={repository.folderName}
                          onChange={e =>
                            setRepository({
                              ...repository,
                              folderName: e.target.value,
                            })
                          }
                          placeholder='输入资料库名称'
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                          {repository.folderName}
                        </div>
                      )}
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='remark'>备注</Label>
                      {isEditMode ? (
                        <Input
                          id='remark'
                          value={repository.remark || ''}
                          onChange={e =>
                            setRepository({
                              ...repository,
                              remark: e.target.value,
                            })
                          }
                          placeholder='输入备注信息'
                        />
                      ) : (
                        <div className='px-3 py-2 text-sm bg-muted/30 rounded-md'>
                          {repository.remark || '无'}
                        </div>
                      )}
                    </div>

                    <div>
                      <Label>支持的文件类型</Label>
                      {isEditMode ? (
                        <div className='grid grid-cols-2 gap-3 mt-2'>
                          {fileTypeOptions.map(option => (
                            <div
                              key={option.value}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={`edit-${option.value}`}
                                checked={repository.folderType.includes(
                                  option.value
                                )}
                                onCheckedChange={checked =>
                                  handleFileTypeChange(
                                    option.value,
                                    checked as boolean
                                  )
                                }
                              />
                              <Label
                                htmlFor={`edit-${option.value}`}
                                className='text-sm flex items-center gap-2'
                              >
                                <option.icon
                                  className={`w-4 h-4 ${option.color}`}
                                />
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {repository.folderType.map(type => {
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
                          {repository.folderType.length === 0 && (
                            <span className='text-gray-500 text-sm'>
                              未设置支持类型
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className='space-y-1 text-sm'>
                      <p>
                        <span className='text-gray-600'>创建时间：</span>
                        {new Date(repository.createdAt).toLocaleDateString(
                          'zh-CN'
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <div className='flex gap-2 mb-6'>
          <div className='relative flex-1 max-w-md'>
            <Input
              placeholder='搜索文档...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-3'
              onKeyPress={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button
            variant='outline'
            onClick={handleSearch}
            disabled={loading}
            size='icon'
          >
            <Search className='w-4 h-4' />
          </Button>
        </div>

        {/* Document Table */}
        <div className='bg-white rounded-lg border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>文档标题</TableHead>
                <TableHead>文件类型</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>发布时间</TableHead>
                <TableHead className='text-right'>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className='text-center py-8'>
                    <div className='flex items-center justify-center'>
                      <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600'></div>
                      <span className='ml-2'>加载中...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredDocuments.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className='text-center py-8 text-gray-500'
                  >
                    暂无文档
                  </TableCell>
                </TableRow>
              ) : (
                filteredDocuments.map(doc => {
                  const fileTypeInfo = getFileTypeInfo(doc.fileType);
                  const IconComponent = fileTypeInfo.icon;
                  return (
                    <TableRow key={doc.id} className='hover:bg-gray-50'>
                      <TableCell className='font-medium max-w-md'>
                        <div className='truncate' title={doc.title}>
                          {doc.title}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <IconComponent className={`w-4 h-4 ${fileTypeInfo.color}`} />
                          <span className='text-sm text-gray-600'>{fileTypeInfo.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {doc.createdAt}
                      </TableCell>
                      <TableCell className='text-gray-600'>
                        {doc.publishedAt}
                      </TableCell>
                    <TableCell className='text-right'>
                      <div className='flex items-center justify-end gap-2'>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleEditDocument(doc)}
                          className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                          title='编辑文档'
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          onClick={() => handleDeleteClick(doc)}
                          className='h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50'
                          title='删除文档'
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* 创建资源对话框 */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>创建新资源</DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                选择资源类型并输入标题来创建新的资源文件。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='document-type'>资源类型</Label>
                <Select value={newDocumentType} onValueChange={setNewDocumentType}>
                  <SelectTrigger>
                    <SelectValue placeholder='选择资源类型' />
                  </SelectTrigger>
                  <SelectContent>
                    {fileTypeOptions
                      .filter(option => 
                        repository?.supportedFileTypes?.includes(option.value) ||
                        repository?.folderType?.includes(option.value)
                      )
                      .map(option => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className='flex items-center gap-2'>
                              <IconComponent className={`w-4 h-4 ${option.color}`} />
                              <span>{option.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='document-title'>资源标题</Label>
                <Input
                  id='document-title'
                  placeholder='输入资源标题'
                  value={newDocumentTitle}
                  onChange={e => setNewDocumentTitle(e.target.value)}
                  className='bg-background border-border'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setNewDocumentTitle('');
                  setNewDocumentType('');
                }}
              >
                取消
              </Button>
              <Button
                type='button'
                onClick={handleCreateDocument}
                disabled={!newDocumentTitle.trim() || !newDocumentType || loading}
              >
                {loading ? '创建中...' : '创建并编辑'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 删除确认对话框 */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className='bg-background border-border'>
            <DialogHeader>
              <DialogTitle className='text-foreground'>
                确认删除文档
              </DialogTitle>
              <DialogDescription className='text-muted-foreground'>
                此操作无法撤销。请输入文档标题「{deletingDocument?.title}
                」来确认删除。
              </DialogDescription>
            </DialogHeader>
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-foreground'>
                  请输入文档标题确认
                </label>
                <Input
                  placeholder='输入文档标题'
                  value={confirmDocName}
                  onChange={e => setConfirmDocName(e.target.value)}
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
                onClick={handleDeleteDocument}
                disabled={confirmDocName !== deletingDocument?.title}
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
