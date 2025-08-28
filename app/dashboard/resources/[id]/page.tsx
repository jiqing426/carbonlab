'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  FileText,
  Music,
  Video,
  FileImage,
  Link,
  ArrowLeft,
  Calendar,
  User,
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
import { SidebarTrigger } from '@/components/ui/sidebar';
import { toast } from 'sonner';
import { useUserStore } from '@/lib/stores/user-store';

// 文件类型选项
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

// 资料库接口类型
interface Repository {
  id: string;
  folderName: string;
  folderType: string[];
  remark: string;
  createdAt: string;
  updatedAt: string;
  supportedFileTypes: string[];
  // 新增字段：用于控制特定页面内容
  controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
  displayOrder?: number; // 显示顺序
}

// 文件接口类型
interface FileData {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: string;
  uploader: string;
  description?: string;
  url?: string;
}

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

// 模拟文件数据
const mockFiles: FileData[] = [
  {
    id: 'file_001',
    fileName: '碳交易政策解读.pdf',
    fileType: 'PDF',
    fileSize: 2048576,
    uploadTime: '2024-01-15T10:00:00Z',
    uploader: '张老师',
    description: '最新的碳交易政策解读文档',
    url: '#'
  },
  {
    id: 'file_002',
    fileName: '碳足迹计算方法.docx',
    fileType: 'DOC',
    fileSize: 1048576,
    uploadTime: '2024-01-16T10:00:00Z',
    uploader: '李老师',
    description: '碳足迹计算方法和案例',
    url: '#'
  },
  {
    id: 'file_003',
    fileName: '碳金融产品设计指南.pdf',
    fileType: 'PDF',
    fileSize: 3145728,
    uploadTime: '2024-01-17T10:00:00Z',
    uploader: '王老师',
    description: '碳金融产品设计理论和实践',
    url: '#'
  }
];

export default function RepositoryDetail() {
  const params = useParams();
  const router = useRouter();
  const repositoryId = params.id as string;
  const { user } = useUserStore();

  const [repository, setRepository] = useState<Repository | null>(null);
  const [files, setFiles] = useState<FileData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddFileDialog, setShowAddFileDialog] = useState(false);
  const [showEditRepoDialog, setShowEditRepoDialog] = useState(false);
  const [isDeleteFileDialogOpen, setIsDeleteFileDialogOpen] = useState(false);
  const [deletingFile, setDeletingFile] = useState<FileData | null>(null);
  const [showEditFileDialog, setShowEditFileDialog] = useState(false);
  const [editingFile, setEditingFile] = useState<FileData | null>(null);

  const [newFile, setNewFile] = useState({
    fileName: '',
    description: '',
    url: ''
  });

  const [editRepo, setEditRepo] = useState({
    folderName: '',
    remark: '',
    folderType: [] as string[]
  });

  useEffect(() => {
    // 初始化默认数据到 localStorage（如果不存在）
    if (!localStorage.getItem('mockRepositories')) {
      // 确保默认数据中 supportedFileTypes 和 folderType 同步
      const syncedRepositories = mockRepositories.map(repo => ({
        ...repo,
        supportedFileTypes: repo.folderType
      }));
      localStorage.setItem('mockRepositories', JSON.stringify(syncedRepositories));
    }
    if (!localStorage.getItem(`files_${repositoryId}`)) {
      // 根据资料库类型生成示例文件
      const repository = mockRepositories.find(repo => repo.id === repositoryId);
      let sampleFiles: any[] = [];
      
      if (repository) {
        switch (repository.controlTarget) {
          case 'latest-policy':
            sampleFiles = [
              {
                id: 'policy-1',
                fileName: '生态环境部发布《关于做好2025年碳排放权交易市场数据质量监督管理相关工作的通知》',
                description: '最新政策文件',
                url: 'https://www.mee.gov.cn/ywdt/xwfb/202407/t20240722_1082192.shtml',
                fileType: 'PDF',
                repositoryId: repositoryId,
                createdAt: '2025-07-18T10:00:00Z',
                updatedAt: '2025-07-18T10:00:00Z',
                uploader: user?.username || '未知用户'
              },
              {
                id: 'policy-2',
                fileName: '工信部：加快推进工业领域碳达峰碳中和，大力发展绿色制造',
                description: '工业碳达峰政策',
                url: 'https://www.miit.gov.cn/zwgk/zcgg/art/2025/art_123456789.html',
                fileType: 'PDF',
                repositoryId: repositoryId,
                createdAt: '2025-07-16T10:00:00Z',
                updatedAt: '2025-07-16T10:00:00Z',
                uploader: user?.username || '未知用户'
              }
            ];
            break;
          case 'hot-news':
            sampleFiles = [
              {
                id: 'news-1',
                fileName: '全球碳市场发展趋势与中国碳市场建设研讨会在京召开',
                description: '热点新闻',
                url: 'https://www.example.com/news/global-carbon-market-trends',
                fileType: 'LINK',
                repositoryId: repositoryId,
                createdAt: '2025-07-18T10:00:00Z',
                updatedAt: '2025-07-18T10:00:00Z',
                uploader: user?.username || '未知用户'
              },
              {
                id: 'news-2',
                fileName: '首批国家级绿色供应链管理企业名单公布，多家企业入选',
                description: '绿色供应链新闻',
                url: 'https://www.example.com/news/green-supply-chain-enterprises',
                fileType: 'LINK',
                repositoryId: repositoryId,
                createdAt: '2025-07-17T10:00:00Z',
                updatedAt: '2025-07-17T10:00:00Z',
                uploader: user?.username || '未知用户'
              }
            ];
            break;
          case 'global-data':
            sampleFiles = [
              {
                id: 'data-1',
                fileName: '2025年可再生能源容量统计数据（IRENA）',
                description: '全球可再生能源数据',
                url: 'https://www.irena.org/Publications/2025/Mar/Renewable-capacity-statistics-2025',
                fileType: 'LINK',
                repositoryId: repositoryId,
                createdAt: '2025-07-18T10:00:00Z',
                updatedAt: '2025-07-18T10:00:00Z',
                uploader: user?.username || '未知用户'
              }
            ];
            break;
          case 'china-report':
            sampleFiles = [
              {
                id: 'report-1',
                fileName: '全国碳市场发展报告 2024',
                description: '中国碳市场年度报告',
                url: 'https://www.mee.gov.cn/ywdt/xwfb/202407/t20240722_1082192.shtml',
                fileType: 'PDF',
                repositoryId: repositoryId,
                createdAt: '2025-07-18T10:00:00Z',
                updatedAt: '2025-07-18T10:00:00Z',
                uploader: user?.username || '未知用户'
              }
            ];
            break;
          default:
            // 使用默认的模拟文件
            sampleFiles = mockFiles
              .filter(file => 
                file.fileType === 'PDF' || file.fileType === 'DOC' || file.fileType === 'LINK'
              )
              .map(file => ({
                ...file,
                uploader: user?.username || '未知用户'
              }));
        }
      }
      
      localStorage.setItem(`files_${repositoryId}`, JSON.stringify(sampleFiles));
    }
    
    loadRepository();
    loadFiles();
  }, [repositoryId]);

  const loadRepository = () => {
    setLoading(true);
    try {
      console.log('Loading repository with ID:', repositoryId);
      
      // 尝试从 localStorage 加载已保存的数据
      let repositoriesToUse = mockRepositories;
      const savedRepos = localStorage.getItem('mockRepositories');
      if (savedRepos) {
        try {
          repositoriesToUse = JSON.parse(savedRepos);
          console.log('Loaded repositories from localStorage:', repositoriesToUse);
        } catch (e) {
          console.warn('Failed to parse saved repositories, using default:', e);
        }
      }
      
      console.log('Available repositories:', repositoriesToUse);
      
      const foundRepo = repositoriesToUse.find(repo => repo.id === repositoryId);
      console.log('Found repository:', foundRepo);
      
      if (foundRepo) {
        // 确保 supportedFileTypes 和 folderType 同步
        const repoWithSyncTypes = {
          ...foundRepo,
          supportedFileTypes: foundRepo.folderType
        };
        
        setRepository(repoWithSyncTypes);
        setEditRepo({
          folderName: foundRepo.folderName,
          remark: foundRepo.remark,
          folderType: foundRepo.folderType
        });
        console.log('Repository loaded successfully');
      } else {
        console.log('Repository not found, redirecting...');
        toast.error('资料库不存在');
        router.push('/dashboard/resources');
      }
    } catch (error) {
      console.error('Error loading repository:', error);
      toast.error('加载资料库失败');
    } finally {
      setLoading(false);
    }
  };

  const loadFiles = () => {
    try {
      // 尝试从 localStorage 加载已保存的文件
      const savedFiles = localStorage.getItem(`files_${repositoryId}`);
      let repoFiles: FileData[] = [];
      
      if (savedFiles) {
        try {
          repoFiles = JSON.parse(savedFiles);
          console.log('Loaded files from localStorage:', repoFiles);
          
          // 更新旧文件的上传者为当前用户名
          repoFiles = repoFiles.map(file => ({
            ...file,
            uploader: user?.username || '未知用户'
          }));
        } catch (e) {
          console.warn('Failed to parse saved files, using default:', e);
          // 如果解析失败，使用默认的模拟数据
          repoFiles = mockFiles
            .filter(file => 
              file.fileType === 'PDF' || file.fileType === 'DOC' || file.fileType === 'LINK'
            )
            .map(file => ({
              ...file,
              uploader: user?.username || '未知用户'
            }));
        }
      } else {
        // 如果没有保存的文件，使用默认的模拟数据
        repoFiles = mockFiles
          .filter(file => 
            file.fileType === 'PDF' || file.fileType === 'DOC' || file.fileType === 'LINK'
          )
          .map(file => ({
            ...file,
            uploader: user?.username || '未知用户'
          }));
      }
      
      setFiles(repoFiles);
      
      // 保存更新后的文件到 localStorage（包含新的用户名）
      localStorage.setItem(`files_${repositoryId}`, JSON.stringify(repoFiles));
    } catch (error) {
      console.error('Failed to load files:', error);
    }
  };

  // 移除文件类型选择函数，因为不再需要

  const handleAddFile = async () => {
    try {
      if (!newFile.fileName.trim()) {
        toast.error('请输入文件名');
        return;
      }

      // 自动选择第一个支持的文件类型
      const defaultFileType = repository?.supportedFileTypes[0] || 'LINK';

      const newFileData: FileData = {
        id: `file_${Date.now()}`,
        fileName: newFile.fileName.trim(),
        fileType: defaultFileType,
        fileSize: Math.floor(Math.random() * 5000000) + 100000, // 随机文件大小
        uploadTime: new Date().toISOString(),
        uploader: user?.username || '未知用户',
        description: newFile.description.trim(),
        url: newFile.url.trim() || '#'
      };

      // 更新本地状态
      setFiles(prev => [newFileData, ...prev]);
      
      // 保存到 localStorage
      const allFiles = [...files, newFileData];
      localStorage.setItem(`files_${repositoryId}`, JSON.stringify(allFiles));
      
      setShowAddFileDialog(false);
      setNewFile({
        fileName: '',
        description: '',
        url: ''
      });
      
      toast.success('文件添加成功');
    } catch (error) {
      toast.error('添加文件失败');
      console.error('Failed to add file:', error);
    }
  };

  const handleEditRepository = async () => {
    try {
      if (!editRepo.folderName.trim()) {
        toast.error('请输入资料库名称');
        return;
      }

      if (editRepo.folderType.length === 0) {
        toast.error('请选择至少一种支持的文件类型');
        return;
      }

      if (repository) {
        const updatedRepo = {
          ...repository,
          folderName: editRepo.folderName.trim(),
          remark: editRepo.remark.trim(),
          folderType: editRepo.folderType,
          supportedFileTypes: editRepo.folderType, // 同步更新支持的文件类型
          updatedAt: new Date().toISOString()
        };
        
        // 更新本地状态
        setRepository(updatedRepo);
        
        // 从 localStorage 获取当前的资料库列表并更新
        const savedRepos = localStorage.getItem('mockRepositories');
        let currentRepos = mockRepositories;
        
        if (savedRepos) {
          try {
            currentRepos = JSON.parse(savedRepos);
          } catch (e) {
            console.warn('Failed to parse saved repositories, using default:', e);
          }
        }
        
        // 更新对应的资料库
        const repoIndex = currentRepos.findIndex(repo => repo.id === repositoryId);
        if (repoIndex !== -1) {
          currentRepos[repoIndex] = updatedRepo;
        }
        
        // 保存更新后的资料库列表到 localStorage
        localStorage.setItem('mockRepositories', JSON.stringify(currentRepos));
        
        setShowEditRepoDialog(false);
        toast.success('资料库更新成功');
      }
    } catch (error) {
      toast.error('更新资料库失败');
      console.error('Failed to update repository:', error);
    }
  };

  const handleEditFileClick = (file: FileData) => {
    setEditingFile(file);
    setShowEditFileDialog(true);
  };

  const handleDeleteFileClick = (file: FileData) => {
    setDeletingFile(file);
    setIsDeleteFileDialogOpen(true);
  };

  const handleSaveEditFile = async () => {
    if (!editingFile) return;

    try {
      if (!editingFile.fileName.trim()) {
        toast.error('请输入文件名');
        return;
      }

      const updatedFiles = files.map(file => 
        file.id === editingFile.id 
          ? {
              ...file,
              fileName: editingFile.fileName.trim(),
              description: editingFile.description?.trim() || '',
              url: editingFile.url?.trim() || '#'
            }
          : file
      );

      setFiles(updatedFiles);
      
      // 保存到 localStorage
      localStorage.setItem(`files_${repositoryId}`, JSON.stringify(updatedFiles));
      
      setShowEditFileDialog(false);
      setEditingFile(null);
      toast.success('文件更新成功');
    } catch (error) {
      toast.error('更新文件失败');
      console.error('Failed to update file:', error);
    }
  };

  const handleDeleteFile = async () => {
    if (!deletingFile) return;

    try {
      const updatedFiles = files.filter(f => f.id !== deletingFile.id);
      setFiles(updatedFiles);
      
      // 保存到 localStorage
      localStorage.setItem(`files_${repositoryId}`, JSON.stringify(updatedFiles));
      
      setIsDeleteFileDialogOpen(false);
      setDeletingFile(null);
      toast.success('文件删除成功');
    } catch (error) {
      toast.error('删除文件失败');
      console.error('Failed to delete file:', error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      file.fileName.toLowerCase().includes(searchLower) ||
      file.description?.toLowerCase().includes(searchLower) ||
      file.uploader.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <>
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
        </div>
        <div className='p-6'>
          <div className='flex items-center justify-center h-64'>
            <div className='text-lg'>加载中...</div>
          </div>
        </div>
      </>
    );
  }

  if (!repository) {
    return (
      <>
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
        </div>
        <div className='p-6'>
          <div className='text-center'>
            <p className='text-lg text-gray-600'>资料库不存在</p>
            <Button onClick={() => router.push('/dashboard/resources')} className='mt-4'>
              返回资料库列表
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
      </div>
      <div className='p-6'>
        <div className='max-w-7xl mx-auto'>
          {/* 头部区域 */}
          <div className='flex items-center justify-between mb-6'>
            <div className='flex items-center space-x-4'>
            <Button
              variant='ghost'
              onClick={() => router.push('/dashboard/resources')}
              className='p-2'
            >
              <ArrowLeft className='w-5 h-5' />
            </Button>
            <div>
              <h1 className='text-3xl font-bold text-foreground tracking-tight'>
                {repository.folderName}
              </h1>
              <p className='text-gray-600 mt-1'>{repository.remark}</p>
            </div>
          </div>
          <div className='flex space-x-2'>
            <Button
              variant='outline'
              onClick={() => setShowEditRepoDialog(true)}
            >
              <Edit className='w-4 h-4 mr-2' />
              编辑资料库
            </Button>
            <Button
              onClick={() => setShowAddFileDialog(true)}
            >
              <Plus className='w-4 h-4 mr-2' />
              添加文件
            </Button>
          </div>
        </div>

          <div className='w-full space-y-6'>
            {/* 资料库信息卡片 */}
            <Card>
              <CardHeader>
                <CardTitle>资料库信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>基本信息</h4>
                    <div className='space-y-2 text-sm text-gray-600'>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='w-4 h-4' />
                        <span>创建时间：{new Date(repository.createdAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                      <div className='flex items-center space-x-2'>
                        <Calendar className='w-4 h-4' />
                        <span>更新时间：{new Date(repository.updatedAt).toLocaleDateString('zh-CN')}</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className='font-medium text-gray-900 mb-2'>支持的文件类型</h4>
                    <div className='flex flex-wrap gap-2'>
                      {repository.folderType.map(type => {
                        const option = fileTypeOptions.find(opt => opt.value === type);
                        return option ? (
                          <Badge key={type} variant='secondary' className='text-xs'>
                            <option.icon className={`w-3 h-3 mr-1 ${option.color}`} />
                            {option.label}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

          {/* 文件管理区域 */}
          <Card>
            <CardHeader>
              <div className='flex items-center justify-between'>
                <CardTitle>文件管理</CardTitle>
                <div className='flex gap-4 items-end'>
                  <div className='w-64'>
                    <label className='text-sm font-medium text-gray-700'>
                      搜索文件
                    </label>
                    <div className='relative mt-1'>
                      <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
                      <Input
                        placeholder='搜索文件名、描述...'
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className='pl-10'
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className='p-0'>
              <Table>
                <TableHeader>
                  <TableRow className='bg-gray-50'>
                    <TableHead className='font-semibold text-gray-900'>
                      文件名
                    </TableHead>
                    <TableHead className='font-semibold text-gray-900'>
                      类型
                    </TableHead>
                    <TableHead className='font-semibold text-gray-900'>
                      大小
                    </TableHead>
                    <TableHead className='font-semibold text-gray-900'>
                      上传时间
                    </TableHead>
                    <TableHead className='font-semibold text-gray-900'>
                      上传者
                    </TableHead>
                    <TableHead className='font-semibold text-gray-900 text-right'>
                      操作
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFiles.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className='text-center py-8 text-gray-500'
                      >
                        {searchTerm
                          ? '未找到匹配的文件'
                          : '暂无文件'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredFiles.map(file => (
                      <TableRow key={file.id} className='hover:bg-gray-50'>
                        <TableCell>
                          <div className='flex items-center space-x-3'>
                            <FileText className='w-5 h-5 text-blue-600' />
                            <div>
                              <span className='font-medium text-gray-900'>
                                {file.fileName}
                              </span>
                              {file.description && (
                                <p className='text-sm text-gray-500 mt-1'>
                                  {file.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {(() => {
                            const option = fileTypeOptions.find(opt => opt.value === file.fileType);
                            return option ? (
                              <Badge variant='secondary' className='text-xs'>
                                <option.icon className={`w-3 h-3 mr-1 ${option.color}`} />
                                {option.label}
                              </Badge>
                            ) : (
                              <Badge variant='outline' className='text-xs'>
                                {file.fileType}
                              </Badge>
                            );
                          })()}
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          {formatFileSize(file.fileSize)}
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          {new Date(file.uploadTime).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className='text-gray-600'>
                          <div className='flex items-center space-x-2'>
                            <User className='w-4 h-4' />
                            <span>{file.uploader}</span>
                          </div>
                        </TableCell>
                                                 <TableCell className='text-right'>
                           <div className='flex items-center justify-end gap-2'>
                             <Button
                               variant='ghost'
                               size='sm'
                               onClick={() => window.open(file.url, '_blank')}
                               className='h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50'
                               title='查看文件'
                             >
                               <FileText className='h-4 w-4' />
                             </Button>
                             <Button
                               variant='ghost'
                               size='sm'
                               onClick={() => handleEditFileClick(file)}
                               className='h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50'
                               title='编辑'
                             >
                               <Edit className='h-4 w-4' />
                             </Button>
                             <Button
                               variant='ghost'
                               size='sm'
                               onClick={() => handleDeleteFileClick(file)}
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
            </CardContent>
          </Card>
        </div>

        {/* 添加文件对话框 */}
        <Dialog open={showAddFileDialog} onOpenChange={setShowAddFileDialog}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>添加文件</DialogTitle>
              <DialogDescription>
                向资料库中添加新文件
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='fileName'>文件名</Label>
                <Input
                  id='fileName'
                  value={newFile.fileName}
                  onChange={e =>
                    setNewFile({ ...newFile, fileName: e.target.value })
                  }
                  placeholder='输入文件名'
                />
              </div>
                             <div className='space-y-2'>
                 <Label>文件类型</Label>
                 <div className='text-sm text-gray-600 p-3 bg-gray-50 rounded-md'>
                   将自动设置为：{repository?.supportedFileTypes[0] ? (
                     (() => {
                       const option = fileTypeOptions.find(opt => opt.value === repository.supportedFileTypes[0]);
                       return option ? (
                         <span className='inline-flex items-center gap-2'>
                           <option.icon className={`w-4 h-4 ${option.color}`} />
                           {option.label}
                         </span>
                       ) : repository.supportedFileTypes[0];
                     })()
                   ) : '外部链接'}
                   <br />
                   <span className='text-xs text-gray-500 mt-1 block'>
                     支持的文件类型：{repository?.supportedFileTypes.map(type => {
                       const option = fileTypeOptions.find(opt => opt.value === type);
                       return option ? option.label : type;
                     }).join('、')}
                   </span>
                 </div>
               </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>描述</Label>
                <Input
                  id='description'
                  value={newFile.description}
                  onChange={e =>
                    setNewFile({ ...newFile, description: e.target.value })
                  }
                  placeholder='输入文件描述'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='url'>文件链接</Label>
                <Input
                  id='url'
                  value={newFile.url}
                  onChange={e =>
                    setNewFile({ ...newFile, url: e.target.value })
                  }
                  placeholder='输入文件链接（可选）'
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowAddFileDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleAddFile}>添加</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑资料库对话框 */}
        <Dialog open={showEditRepoDialog} onOpenChange={setShowEditRepoDialog}>
          <DialogContent className='max-w-2xl'>
            <DialogHeader>
              <DialogTitle>编辑资料库</DialogTitle>
              <DialogDescription>
                修改资料库信息
              </DialogDescription>
            </DialogHeader>
            <div className='grid gap-4 py-4'>
              <div className='space-y-2'>
                <Label htmlFor='editFolderName'>资料库名称</Label>
                <Input
                  id='editFolderName'
                  value={editRepo.folderName}
                  onChange={e =>
                    setEditRepo({ ...editRepo, folderName: e.target.value })
                  }
                  placeholder='输入资料库名称'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='editRemark'>备注</Label>
                <Input
                  id='editRemark'
                  value={editRepo.remark}
                  onChange={e =>
                    setEditRepo({ ...editRepo, remark: e.target.value })
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
                        id={`edit_${option.value}`}
                        checked={editRepo.folderType.includes(option.value)}
                        onCheckedChange={checked => {
                          if (checked) {
                            setEditRepo(prev => ({
                              ...prev,
                              folderType: [...prev.folderType, option.value]
                            }));
                          } else {
                            setEditRepo(prev => ({
                              ...prev,
                              folderType: prev.folderType.filter(type => type !== option.value)
                            }));
                          }
                        }}
                      />
                      <Label
                        htmlFor={`edit_${option.value}`}
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
            <DialogFooter>
              <Button
                variant='outline'
                onClick={() => setShowEditRepoDialog(false)}
              >
                取消
              </Button>
              <Button onClick={handleEditRepository}>保存</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* 编辑文件对话框 */}
        <Dialog open={showEditFileDialog} onOpenChange={setShowEditFileDialog}>
           <DialogContent className='max-w-2xl'>
             <DialogHeader>
               <DialogTitle>编辑文件</DialogTitle>
               <DialogDescription>
                 修改文件信息
               </DialogDescription>
             </DialogHeader>
             <div className='grid gap-4 py-4'>
               <div className='space-y-2'>
                 <Label htmlFor='editFileName'>文件名</Label>
                 <Input
                   id='editFileName'
                   value={editingFile?.fileName || ''}
                   onChange={e =>
                     setEditingFile(prev => prev ? { ...prev, fileName: e.target.value } : null)
                   }
                   placeholder='输入文件名'
                 />
               </div>
               <div className='space-y-2'>
                 <Label htmlFor='editFileDescription'>描述</Label>
                 <Input
                   id='editFileDescription'
                   value={editingFile?.description || ''}
                   onChange={e =>
                     setEditingFile(prev => prev ? { ...prev, description: e.target.value } : null)
                   }
                   placeholder='输入文件描述'
                 />
               </div>
               <div className='space-y-2'>
                 <Label htmlFor='editFileUrl'>文件链接</Label>
                 <Input
                   id='editFileUrl'
                   value={editingFile?.url || ''}
                   onChange={e =>
                     setEditingFile(prev => prev ? { ...prev, url: e.target.value } : null)
                   }
                   placeholder='输入文件链接'
                 />
               </div>
             </div>
             <DialogFooter>
               <Button
                 variant='outline'
                 onClick={() => setShowEditFileDialog(false)}
               >
                 取消
               </Button>
               <Button onClick={handleSaveEditFile}>保存</Button>
             </DialogFooter>
           </DialogContent>
         </Dialog>

        {/* 删除文件确认对话框 */}
        <Dialog open={isDeleteFileDialogOpen} onOpenChange={setIsDeleteFileDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>确认删除文件</DialogTitle>
              <DialogDescription>
                此操作无法撤销。确定要删除文件「{deletingFile?.fileName}」吗？
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                type='button'
                variant='outline'
                onClick={() => setIsDeleteFileDialogOpen(false)}
              >
                取消
              </Button>
              <Button
                type='button'
                variant='destructive'
                onClick={handleDeleteFile}
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
