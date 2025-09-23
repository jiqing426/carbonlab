'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, Edit } from 'lucide-react';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { CustomBreadcrumb } from '@/components/custom-breadcrumb';
import dynamic from 'next/dynamic';

// 动态导入 PDFViewer 以避免 SSR 问题
const PDFViewer = dynamic(() => import('@/components/reader/PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className='flex items-center justify-center h-full bg-muted'>
      <div className='text-center'>
        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
        <p className='text-muted-foreground'>正在加载 PDF 查看器...</p>
      </div>
    </div>
  ),
});
// 动态导入 VideoPlayer 以避免 SSR 问题
const DynamicVideoPlayer = dynamic(
  () =>
    import('@/components/reader/VideoPlayer').then(mod => ({
      default: mod.VideoPlayer,
    })),
  {
    ssr: false,
    loading: () => (
      <div className='flex items-center justify-center h-full bg-muted'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p className='text-muted-foreground'>正在加载视频播放器...</p>
        </div>
      </div>
    ),
  }
);
import DocxViewer from '@/components/reader/DocxViewer';
import PptViewer from '@/components/reader/PptViewer';
import MarkdownViewer from '@/components/reader/MarkdownViewer';
import { getFileById, type FileData } from '@/lib/api/files';
import { getFolderById, type Folder } from '@/lib/api/folders';
import { truncateDocumentTitle } from '@/lib/utils/text';

// 获取预签名URL的异步函数
const getPresignedFileUrl = async (
  fileData: FileData,
  appKey: string
): Promise<string | null> => {
  if (!fileData.oss_url) {
    return null;
  }

  // 如果oss_url已经是完整的URL，直接返回
  if (fileData.oss_url.startsWith('http')) {
    return fileData.oss_url;
  }

  try {
    // 直接调用后端 API 获取预签名 URL
    const { getFilePresignedUrl } = await import('@/lib/api/files');
    const response = await getFilePresignedUrl(fileData.id, appKey);
    return response.presigned_url;
  } catch (error) {
    console.error('获取预签名URL失败:', error);
    // 失败时返回null，让上层处理
    return null;
  }
};

// 获取最终文件URL的辅助函数
const getFinalFileUrl = (
  fileData: FileData,
  presignedUrls: Record<string, string>
): string | null => {
  // 优先使用link_url，然后是content
  if (fileData.link_url) {
    return fileData.link_url;
  }

  // 如果有oss_url，使用预签名URL或原始oss_url
  if (fileData.oss_url) {
    if (fileData.oss_url.startsWith('http')) {
      return fileData.oss_url;
    }
    return presignedUrls[fileData.oss_url] || null;
  }

  return fileData.content || null;
};

// 检查是否正在获取预签名URL
const isPresignedUrlLoading = (
  fileData: FileData,
  presignedUrls: Record<string, string>
): boolean => {
  return (
    fileData.oss_url !== undefined &&
    !fileData.oss_url.startsWith('http') &&
    presignedUrls[fileData.oss_url] === undefined
  );
};

// 支持的文件类型映射（全部使用大写，便于比较）
const SUPPORTED_FILE_TYPES = {
  PDF: ['PDF'],
  VIDEO: ['VIDEO', 'MP4', 'AVI', 'MOV'],
  AUDIO: ['AUDIO', 'MP3', 'WAV', 'AAC'],
  IMAGE: ['IMAGE', 'JPG', 'JPEG', 'PNG', 'GIF', 'WEBP'],
  DOCX: ['DOCX'],
  PPT: ['PPT', 'PPTX'],
  DOCUMENT: ['DOC', 'TXT'],
  MARKDOWN: ['MD', 'MARKDOWN'],
  LINK: ['LINK'],
};

// 获取文件类型分类
const getFileCategory = (fileType: string): string => {
  const normalizedType = fileType.toUpperCase();

  if (SUPPORTED_FILE_TYPES.PDF.includes(normalizedType)) return 'PDF';
  if (SUPPORTED_FILE_TYPES.VIDEO.includes(normalizedType)) return 'VIDEO';
  if (SUPPORTED_FILE_TYPES.AUDIO.includes(normalizedType)) return 'AUDIO';
  if (SUPPORTED_FILE_TYPES.IMAGE.includes(normalizedType)) return 'IMAGE';
  if (SUPPORTED_FILE_TYPES.DOCX.includes(normalizedType)) return 'DOCX';
  if (SUPPORTED_FILE_TYPES.PPT.includes(normalizedType)) return 'PPT';
  if (SUPPORTED_FILE_TYPES.DOCUMENT.includes(normalizedType)) return 'DOCUMENT';
  if (SUPPORTED_FILE_TYPES.MARKDOWN.includes(normalizedType)) return 'MARKDOWN';
  if (SUPPORTED_FILE_TYPES.LINK.includes(normalizedType)) return 'LINK';

  return 'UNSUPPORTED';
};

// URL 安全性和兼容性检查
const checkUrlCompatibility = (url: string) => {
  try {
    const urlObj = new URL(url);
    const protocol = urlObj.protocol;
    const hostname = urlObj.hostname;

    // 协议检查
    const isSecure = protocol === 'https:';
    const isHttp = protocol === 'http:';
    const isValid = isSecure || isHttp;

    // 常见的不支持 iframe 嵌入的域名
    const restrictedDomains = [
      'youtube.com',
      'youtu.be',
      'vimeo.com',
      'facebook.com',
      'twitter.com',
      'x.com',
      'instagram.com',
      'linkedin.com',
      'github.com',
      'stackoverflow.com',
      'google.com',
      'bing.com',
      'baidu.com',
      'amazon.com',
      'apple.com',
    ];

    const isRestricted = restrictedDomains.some(
      domain => hostname.includes(domain) || hostname.endsWith(`.${domain}`)
    );

    return {
      isValid,
      isSecure,
      isHttp,
      isRestricted,
      protocol,
      hostname,
      warnings: [
        ...(!isSecure && isHttp ? ['该链接使用非安全的 HTTP 协议'] : []),
        ...(isRestricted ? ['该域名通常不允许 iframe 嵌入'] : []),
        ...(!isValid ? ['不支持的协议类型'] : []),
      ],
    };
  } catch {
    return {
      isValid: false,
      isSecure: false,
      isHttp: false,
      isRestricted: false,
      protocol: '',
      hostname: '',
      warnings: ['无效的 URL 格式'],
    };
  }
};

export default function FileViewerPage() {
  const params = useParams();
  const router = useRouter();
  const { setOpen } = useSidebar();
  const hasAutoCollapsed = useRef(false);

  const fileId = params.fileId as string;
  const folderId = params.folderId as string;
  const appKey = process.env.NEXT_PUBLIC_TALE_APP_KEY || 'oa_HBamFxnA';
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [folderData, setFolderData] = useState<Folder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [iframeError, setIframeError] = useState(false);
  const [presignedUrls, setPresignedUrls] = useState<Record<string, string>>(
    {}
  );

  // 加载文件详情
  const loadFile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const file = await getFileById(fileId, appKey);
      setFileData(file);

      // 如果文件有oss_url，获取预签名URL
      if (file.oss_url && !file.oss_url.startsWith('http')) {
        try {
          const presignedUrl = await getPresignedFileUrl(
            file,
            appKey
          );
          if (presignedUrl) {
            setPresignedUrls(prev => ({
              ...prev,
              [file.oss_url!]: presignedUrl,
            }));
          }
        } catch (error) {
          console.error('获取预签名URL失败:', error);
          // 不阻止文件加载，只是无法获取预签名URL
        }
      }

      // 获取资料库信息
      if (file.folder_id) {
        try {
          const folder = await getFolderById(
            file.folder_id,
            appKey
          );
          setFolderData(folder);
        } catch (folderErr) {
          console.error('获取资料库信息失败:', folderErr);
          // 不阻止文件加载，只是无法显示资料库名称
        }
      }
    } catch (err) {
      console.error('加载文件失败:', err);
      setError(err instanceof Error ? err.message : '加载文件失败');
    } finally {
      setLoading(false);
    }
  }, [fileId, appKey]);

  useEffect(() => {
    if (fileId) {
      loadFile();
    }
  }, [fileId, loadFile]);

  // 页面首次加载时自动折叠sidebar，但允许用户手动展开
  useEffect(() => {
    if (!hasAutoCollapsed.current) {
      setOpen(false);
      hasAutoCollapsed.current = true;
    }
  }, [setOpen]);

  // 处理 iframe 加载失败的情况
  useEffect(() => {
    if (!fileData || getFileCategory(fileData.file_type) !== 'LINK') return;

    // 重置加载状态
    setIframeLoading(true);
    setIframeError(false);

    const timer = setTimeout(() => {
      // 如果超时仍在加载，自动隐藏加载指示器
      console.warn(
        'iframe 加载超时，可能存在跨域限制或网络问题，自动隐藏加载指示器'
      );
      setIframeLoading(false);
    }, 3000); // 3秒超时，更短的时间

    return () => clearTimeout(timer);
  }, [fileData, fileId, iframeLoading, iframeError]);

  // 根据文件类型渲染不同的查看器
  const renderViewer = () => {
    if (!fileData) return null;

    const fileCategory = getFileCategory(fileData.file_type);

    switch (fileCategory) {
      case 'PDF':
        if (isPresignedUrlLoading(fileData, presignedUrls)) {
          return (
            <div className='flex items-center justify-center h-full bg-muted'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在获取文件访问链接...</p>
              </div>
            </div>
          );
        }

        const pdfUrl = getFinalFileUrl(fileData, presignedUrls);
        return pdfUrl ? (
          <PDFViewer pdfUrl={pdfUrl} />
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>PDF 文件</p>
              <p className='text-muted-foreground'>
                该 PDF 文件没有可用的链接或内容
              </p>
            </div>
          </div>
        );

      case 'VIDEO':
        if (isPresignedUrlLoading(fileData, presignedUrls)) {
          return (
            <div className='flex items-center justify-center h-full bg-muted'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在获取文件访问链接...</p>
              </div>
            </div>
          );
        }

        const videoUrl = getFinalFileUrl(fileData, presignedUrls);
        return videoUrl ? (
          <DynamicVideoPlayer
            src={videoUrl}
            poster={(fileData.file_attr as { poster?: string })?.poster}
          />
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>视频文件</p>
              <p className='text-muted-foreground'>
                该视频文件没有可用的链接或内容
              </p>
            </div>
          </div>
        );

      case 'AUDIO':
        return (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>音频文件</p>
              <p className='text-muted-foreground'>
                音频文件预览功能正在开发中
              </p>
            </div>
          </div>
        );

      case 'IMAGE':
        if (isPresignedUrlLoading(fileData, presignedUrls)) {
          return (
            <div className='flex items-center justify-center h-full bg-muted'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在获取文件访问链接...</p>
              </div>
            </div>
          );
        }

        const imageUrl = getFinalFileUrl(fileData, presignedUrls);
        return imageUrl ? (
          <div className='flex justify-center'>
            <Image
              src={imageUrl}
              alt={fileData.file_name}
              width={600}
              height={400}
              className='max-w-full max-h-96 object-contain rounded-lg'
              onError={e => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>图片文件</p>
              <p className='text-muted-foreground'>
                该图片文件没有可用的链接或内容
              </p>
            </div>
          </div>
        );

      case 'DOCX':
        if (isPresignedUrlLoading(fileData, presignedUrls)) {
          return (
            <div className='flex items-center justify-center h-full bg-muted'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在获取文件访问链接...</p>
              </div>
            </div>
          );
        }

        const docxUrl = getFinalFileUrl(fileData, presignedUrls);
        return docxUrl ? (
          <DocxViewer docxUrl={docxUrl} fileName={fileData.file_name} />
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>Word 文档</p>
              <p className='text-muted-foreground'>
                该文档没有可用的链接或内容
              </p>
            </div>
          </div>
        );

      case 'PPT':
        if (isPresignedUrlLoading(fileData, presignedUrls)) {
          return (
            <div className='flex items-center justify-center h-full bg-muted'>
              <div className='text-center'>
                <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                <p className='text-muted-foreground'>正在获取文件访问链接...</p>
              </div>
            </div>
          );
        }

        const pptUrl = getFinalFileUrl(fileData, presignedUrls);
        return pptUrl ? (
          <PptViewer pptUrl={pptUrl} fileName={fileData.file_name} />
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>PPT 演示文档</p>
              <p className='text-muted-foreground'>
                该文档没有可用的链接或内容
              </p>
            </div>
          </div>
        );

      case 'DOCUMENT':
        return (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>文档文件</p>
              <p className='text-muted-foreground'>文档预览功能正在开发中</p>
            </div>
          </div>
        );

      case 'MARKDOWN':
        // Markdown 文档应该使用 content 字段，而不是 linkUrl
        const markdownContent = fileData.content;
        return markdownContent ? (
          <MarkdownViewer
            content={markdownContent}
            fileName={fileData.file_name}
          />
        ) : (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>Markdown 文档</p>
              <p className='text-muted-foreground'>该文档没有可用的内容</p>
            </div>
          </div>
        );

      case 'LINK':
        const linkUrl = fileData.link_url;
        if (!linkUrl) {
          return (
            <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
              <div className='text-center'>
                <p className='text-lg font-medium mb-2'>外部链接</p>
                <p className='text-muted-foreground'>该链接没有可用的 URL</p>
              </div>
            </div>
          );
        }

        const urlCheck = checkUrlCompatibility(linkUrl);
        return (
          <div className='flex flex-col h-full'>
            {/* 工具栏 */}
            <div className='flex items-center justify-between p-2 bg-muted border-b'>
              <div className='flex items-center gap-2'>
                <span className='text-sm font-medium'>外部链接预览</span>
                <span className='text-xs text-muted-foreground'>
                  {urlCheck.isSecure
                    ? '🔒 安全连接'
                    : urlCheck.isHttp
                      ? '⚠️ 非安全连接'
                      : '❌ 无效协议'}
                </span>
                {urlCheck.warnings.length > 0 && (
                  <span
                    className='text-xs text-amber-600'
                    title={urlCheck.warnings.join(', ')}
                  >
                    ⚠️ {urlCheck.warnings.length} 个警告
                  </span>
                )}
              </div>
              <div className='flex items-center gap-2'>
                <Button
                  onClick={() => window.open(linkUrl, '_blank')}
                  size='sm'
                  variant='outline'
                >
                  在新标签页打开
                </Button>
              </div>
            </div>

            {/* 警告信息 */}
            {urlCheck.warnings.length > 0 && (
              <div className='p-3 bg-amber-50 border-b border-amber-200'>
                <div className='flex items-start gap-2'>
                  <span className='text-amber-600 mt-0.5'>⚠️</span>
                  <div className='flex-1'>
                    <p className='text-sm font-medium text-amber-800 mb-1'>
                      兼容性警告
                    </p>
                    <ul className='text-xs text-amber-700 space-y-1'>
                      {urlCheck.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* iframe 预览 */}
            <div className='flex-1 overflow-hidden relative'>
              {urlCheck.isValid ? (
                <>
                  {/* 加载指示器 */}
                  {iframeLoading && (
                    <div className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10'>
                      <div className='text-center'>
                        <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
                        <p className='text-sm text-muted-foreground'>
                          正在加载外部页面...
                        </p>
                        <p className='text-xs text-muted-foreground mt-1'>
                          如果长时间无响应，请尝试在新标签页打开
                        </p>
                      </div>
                    </div>
                  )}

                  <iframe
                    src={linkUrl}
                    className='w-full h-full border-0'
                    title='外部链接预览'
                    sandbox='allow-same-origin allow-scripts allow-popups allow-forms'
                    loading='lazy'
                    referrerPolicy='strict-origin-when-cross-origin'
                    onLoad={() => {
                      console.log('iframe 加载成功');
                      setIframeLoading(false);
                      setIframeError(false);
                    }}
                    onError={e => {
                      console.error('iframe 加载失败:', e);
                      setIframeLoading(false);
                      setIframeError(true);
                      const fallback = document.getElementById(
                        `fallback-${fileId}`
                      );
                      if (fallback) fallback.style.display = 'flex';
                    }}
                    ref={iframe => {
                      if (iframe) {
                        // 备用检测机制：监听 iframe 的 contentWindow
                        const checkLoad = () => {
                          try {
                            if (
                              iframe.contentDocument ||
                              iframe.contentWindow
                            ) {
                              console.log('iframe 内容已加载（备用检测）');
                              setIframeLoading(false);
                              setIframeError(false);
                            }
                          } catch {
                            // 跨域限制，这是正常的
                            console.log('iframe 跨域限制，但页面可能已加载');
                            setIframeLoading(false);
                          }
                        };

                        // 延迟检测，给页面一些加载时间
                        setTimeout(checkLoad, 1500);
                      }
                    }}
                  />
                </>
              ) : (
                <div className='flex items-center justify-center h-full bg-muted'>
                  <div className='text-center p-6'>
                    <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center'>
                      <span className='text-destructive text-xl'>❌</span>
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>无效的链接</h3>
                    <p className='text-muted-foreground text-sm mb-4'>
                      该链接格式无效或使用了不支持的协议
                    </p>
                    <Button
                      onClick={() => window.open(linkUrl, '_blank')}
                      variant='outline'
                    >
                      尝试在新标签页打开
                    </Button>
                  </div>
                </div>
              )}

              {/* 加载失败时的备用显示 */}
              <div
                className='absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm'
                style={{ display: 'none' }}
                id={`fallback-${fileId}`}
              >
                <div className='text-center p-6 bg-card rounded-lg border shadow-lg max-w-md'>
                  <div className='mb-4'>
                    <div className='w-12 h-12 mx-auto mb-3 rounded-full bg-destructive/10 flex items-center justify-center'>
                      <span className='text-destructive text-xl'>⚠️</span>
                    </div>
                    <h3 className='text-lg font-semibold mb-2'>无法加载页面</h3>
                    <p className='text-muted-foreground text-sm mb-4'>
                      该页面可能包含安全限制、跨域策略限制，或服务器拒绝了嵌入请求。
                    </p>
                  </div>
                  <div className='space-y-2'>
                    <Button
                      onClick={() => window.open(linkUrl, '_blank')}
                      className='w-full'
                    >
                      在新标签页打开
                    </Button>
                    <Button
                      onClick={() => {
                        const fallback = document.getElementById(
                          `fallback-${fileId}`
                        );
                        if (fallback) fallback.style.display = 'none';
                      }}
                      variant='outline'
                      size='sm'
                      className='w-full'
                    >
                      重试加载
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div className='flex items-center justify-center h-full bg-muted'>
            <div className='text-center'>
              <p className='text-lg font-medium mb-2'>不支持的文件类型</p>
              <p className='text-muted-foreground'>
                当前不支持预览 {fileData.file_type} 格式的文件
              </p>
            </div>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <div className='text-center'>
          <p className='text-destructive mb-4'>{error}</p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className='w-4 h-4 mr-2' />
            返回
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className='flex h-16 items-center border-b px-4'>
        <SidebarTrigger />
        {folderId && (
        <CustomBreadcrumb
          items={[
            { label: '资料库管理', href: '/admin/libraries' },
            {
              label: folderData?.folder_name || '资料库',
              href: `/admin/libraries/${folderId}`,
            },
            { label: truncateDocumentTitle(fileData?.file_name || '文件查看') },
          ]}
        />
      )}
        <div className='ml-auto'>
          <Button
            variant='ghost'
            size='icon'
            onClick={() =>
              router.push(
                `/dashboard/resources/${folderId}/files/${fileId}/editor`
              )
            }
            className='h-8 w-8'
            title='编辑文件'
          >
            <Edit className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <div className='h-[calc(100vh-4rem)]'>{renderViewer()}</div>
    </>
  );
}
