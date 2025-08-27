'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumb } from '@/components/breadcrumb';
import DocumentEditor from '../../document-editor';
import { getFileById } from '@/lib/api/files';
import { getFolderById } from '@/lib/api/folders';
import { useTale } from '@/lib/contexts/TaleContext';
import { useAuthStore } from '@/lib/stores/auth-store';

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

export default function DocumentEditorPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, currentApp } = useTale();
  const { autoSelectFirstApp, isAuthenticated } = useAuthStore();

  const repositoryId = params.id as string;
  const documentId = searchParams.get('docId');

  const [repository, setRepository] = useState<Repository | null>(null);
  const [document, setDocument] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appInitialized, setAppInitialized] = useState(false);

  // 加载资料库信息
  const loadRepository = async () => {
    if (!token?.token || !repositoryId) return;

    // 必须有 currentApp 才能继续
    if (!currentApp?.app_key) {
      console.log('No app key available for repository loading');
      setError('应用未正确初始化，请刷新页面或重新选择应用');
      return;
    }

    try {
      const response = await getFolderById(repositoryId, currentApp.app_key);
      // 映射Folder类型到Repository类型
      const mappedRepository: Repository = {
        ...response,
        supportedFileTypes: response.folderType || [],
      };
      setRepository(mappedRepository);
    } catch (err) {
      console.error('Error loading repository:', err);
      if (err instanceof Error && err.message.includes('No app key provided')) {
        setError('应用密钥未提供，请确保已选择正确的应用');
      } else {
        setError('加载资料库信息时发生错误');
      }
    }
  };

  // 加载文档信息（如果是编辑模式）
  const loadDocument = async () => {
    if (!token?.token || !documentId) return;

    // 必须有 currentApp 才能继续
    if (!currentApp?.app_key) {
      console.log('No app key available for document loading');
      setError('应用未正确初始化，请刷新页面或重新选择应用');
      return;
    }

    try {
      const response = await getFileById(documentId, currentApp.app_key);
      // 映射FileData类型到DocumentData类型
      const mappedDocument: DocumentData = {
        id: response.id,
        title: response.fileName,
        citation: response.remark || '',
        createTime: response.createdAt,
        contentType: 'markdown', // 默认值，可根据实际情况调整
        fileType: response.fileType as
          | 'pdf'
          | 'audio'
          | 'video'
          | 'image'
          | 'link'
          | 'markdown'
          | 'doc'
          | 'other',
        content: response.content || '',
        fileName: response.fileName,
        externalUrl: response.linkUrl || '',
        fileAttr: response.fileAttr as Record<string, unknown> | undefined,
        linkUrl: response.linkUrl,
        remark: response.remark,
      };
      setDocument(mappedDocument);
    } catch (err) {
      console.error('Error loading document:', err);
      if (err instanceof Error && err.message.includes('No app key provided')) {
        setError('应用密钥未提供，请确保已选择正确的应用');
      } else {
        setError('加载文档信息时发生错误');
      }
    }
  };

  // 确保应用已初始化
  useEffect(() => {
    const initializeApp = async () => {
      if (isAuthenticated && !currentApp && !appInitialized) {
        console.log('编辑器页面：检测到未选择应用，尝试自动选择第一个应用');
        try {
          await autoSelectFirstApp();
          setAppInitialized(true);
        } catch (error) {
          console.error('自动选择应用失败:', error);
          setError('无法初始化应用，请先在应用管理中选择一个应用');
          setAppInitialized(true);
        }
      } else if (currentApp) {
        setAppInitialized(true);
      }
    };

    initializeApp();
  }, [isAuthenticated, currentApp, autoSelectFirstApp, appInitialized]);

  useEffect(() => {
    const loadData = async () => {
      // 只有在应用已初始化、有token且有currentApp时才加载数据
      if (!token?.token || !appInitialized || !currentApp?.app_key) {
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        await loadRepository();
        if (documentId) {
          await loadDocument();
        }
      } catch (err) {
        console.error('加载数据失败:', err);
        if (err instanceof Error && err.message.includes('No app key provided')) {
          setError('应用未正确初始化，请刷新页面或重新选择应用');
        } else {
          setError('加载数据时发生错误，请稍后重试');
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [token, repositoryId, documentId, appInitialized, currentApp?.app_key]);

  const handleBack = () => {
    router.push(`/dashboard/resources/${repositoryId}`);
  };

  if (loading || !appInitialized) {
    return (
      <>
        {/* Header */}
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
          <Breadcrumb
            items={[
              { label: '资料库管理', href: '/dashboard/resources' },
              {
                label: repository?.folderName || '加载中...',
                href: `/dashboard/resources/${repositoryId}`,
              },
              { label: documentId ? '编辑文档' : '新建文档' },
            ]}
          />
        </div>

        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4'></div>
            <p className='text-gray-600'>
              {!appInitialized ? '正在初始化应用...' : '加载中...'}
            </p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        {/* Header */}
        <div className='flex h-16 items-center border-b px-4'>
          <SidebarTrigger />
          <Breadcrumb
            items={[
              { label: '资料库管理', href: '/dashboard/resources' },
              {
                label: repository?.folderName || '资料库',
                href: `/dashboard/resources/${repositoryId}`,
              },
              { label: documentId ? '编辑文档' : '新建文档' },
            ]}
          />
        </div>

        <div className='flex items-center justify-center h-64'>
          <div className='text-center max-w-md mx-auto'>
            <div className='mb-4'>
              <svg className='mx-auto h-12 w-12 text-red-400' fill='none' viewBox='0 0 24 24' stroke='currentColor'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z' />
              </svg>
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-2'>加载失败</h3>
            <p className='text-red-600 mb-4'>{error}</p>
            <div className='space-y-2'>
              <button
                onClick={() => {
                  setError(null);
                  setAppInitialized(false);
                  window.location.reload();
                }}
                className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2'
              >
                重新加载
              </button>
              <button
                onClick={handleBack}
                className='px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600'
              >
                返回资料库
              </button>
            </div>
            {error.includes('应用') && (
              <p className='text-sm text-gray-500 mt-4'>
                提示：如果问题持续存在，请尝试在左侧边栏重新选择应用
              </p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Header */}
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        <Breadcrumb
          items={[
            { label: '资料库管理', href: '/dashboard/resources' },
            {
              label: repository?.folderName || '资料库',
              href: `/dashboard/resources/${repositoryId}`,
            },
            { label: documentId ? '编辑文档' : '新建文档' },
          ]}
        />
      </div>

      {/* Document Editor */}
      <div className='flex-1 overflow-auto'>
        <DocumentEditor
          onBack={handleBack}
          document={document}
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
      </div>
    </>
  );
}
