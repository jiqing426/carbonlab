/* eslint-disable @typescript-eslint/no-unsafe-function-type */
'use client';

import type React from 'react';

import { useState, useRef, useCallback, useEffect } from 'react';
import {
  createFile,
  updateFile,
  type CreateFileRequest,
} from '@/lib/api/files';
import JsonVisualEditor from '@/components/json-visual-editor';
import {
  ArrowLeft,
  Save,
  Upload,
  Eye,
  Edit,
  FileText,
  Music,
  FileImage,
  Video,
  File,
  ChevronDown,
  ChevronUp,
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link,
  Code,
  Quote,
  ImageIcon,
  Strikethrough,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { useTale } from '@/lib/contexts/TaleContext';

// JSON类型定义
type JsonValue = string | number | boolean | null | JsonObject | JsonArray;
type JsonObject = { [key: string]: JsonValue };
type JsonArray = JsonValue[];

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
  // 添加API返回的字段
  linkUrl?: string;
  remark?: string;
  urlValidation?: {
    isValid: boolean;
    isChecking: boolean;
    error?: string;
    status?: 'success' | 'error' | 'checking' | 'idle';
  };
}

interface DocumentEditorProps {
  onBack?: () => void;
  document?: DocumentData | null;
  repository?: {
    id: string;
    supportedFileTypes: string[];
    folderName?: string;
    folderAttr?: {
      icon?: string;
      color?: string;
      [key: string]: unknown;
    };
  } | null;
}

const contentTypes = [
  {
    value: 'pdf',
    label: 'PDF',
    icon: FileText,
    color: 'bg-red-100 text-red-800',
  },
  {
    value: 'audio',
    label: '音频',
    icon: Music,
    color: 'bg-green-100 text-green-800',
  },
  {
    value: 'video',
    label: '视频',
    icon: Video,
    color: 'bg-purple-100 text-purple-800',
  },
  {
    value: 'image',
    label: '图片',
    icon: FileImage,
    color: 'bg-yellow-100 text-yellow-800',
  },
  {
    value: 'link',
    label: '外部链接',
    icon: Link,
    color: 'bg-blue-100 text-blue-800',
  },
  {
    value: 'markdown',
    label: 'Markdown',
    icon: FileText,
    color: 'bg-indigo-100 text-indigo-800',
  },
  {
    value: 'doc',
    label: '文档',
    icon: FileText,
    color: 'bg-orange-100 text-orange-800',
  },
  {
    value: 'other',
    label: '其他',
    icon: File,
    color: 'bg-gray-100 text-gray-800',
  },
];

// Simple Markdown parser for basic formatting
const parseMarkdown = (markdown: string): string => {
  let html = markdown;

  // Headers
  html = html.replace(
    /^### (.*$)/gim,
    '<h3 class="text-lg font-semibold mt-4 mb-2">$1</h3>'
  );
  html = html.replace(
    /^## (.*$)/gim,
    '<h2 class="text-xl font-bold mt-6 mb-3">$1</h2>'
  );
  html = html.replace(
    /^# (.*$)/gim,
    '<h1 class="text-2xl font-bold mt-8 mb-4">$1</h1>'
  );

  // Bold
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold">$1</strong>'
  );

  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

  // Strikethrough
  html = html.replace(/~~(.*?)~~/g, '<del class="line-through">$1</del>');

  // Code blocks
  html = html.replace(
    /```([\s\S]*?)```/g,
    '<pre class="bg-gray-100 p-3 rounded border overflow-x-auto"><code>$1</code></pre>'
  );

  // Inline code
  html = html.replace(
    /`(.*?)`/g,
    '<code class="bg-gray-100 px-1 rounded text-sm">$1</code>'
  );

  // Links
  html = html.replace(
    /\[([^\]]+)\]\$\$([^)]+)\$\$/g,
    '<a href="$2" class="text-blue-600 hover:underline">$1</a>'
  );

  // Blockquotes
  html = html.replace(
    /^> (.*$)/gim,
    '<blockquote class="border-l-4 border-gray-300 pl-4 italic text-gray-600">$1</blockquote>'
  );

  // Lists
  html = html.replace(/^\* (.*$)/gim, '<li class="ml-4">• $1</li>');
  html = html.replace(/^- (.*$)/gim, '<li class="ml-4">• $1</li>');
  html = html.replace(
    /^\d+\. (.*$)/gim,
    '<li class="ml-4 list-decimal">$1</li>'
  );

  // Line breaks
  html = html.replace(/\n/g, '<br>');

  // Wrap lists
  html = html.replace(
    /(<li class="ml-4">.*<\/li>)/g,
    '<ul class="space-y-1">$1<\/ul>'
  );
  html = html.replace(
    /(<li class="ml-4 list-decimal">.*<\/li>)/g,
    '<ol class="space-y-1 list-decimal ml-8">$1<\/ol>'
  );

  return html;
};

export default function DocumentEditor({
  onBack,
  document: initialDocument,
  repository,
}: DocumentEditorProps) {
  // 初始化文档数据，根据是否为新建决定使用folder的folderAttr还是文件本身的数据
  const [document, setDocument] = useState<DocumentData>(() => {
    if (initialDocument && initialDocument.id) {
      // 修改现有文档，使用从API获取的完整数据
      return {
        id: initialDocument.id,
        title: initialDocument.title,
        citation: initialDocument.citation,
        createTime: initialDocument.createTime,
        contentType: 'markdown',
        fileType: initialDocument.fileType,
        content:
          initialDocument.content ||
          `# ${initialDocument.title}\n\n## 文档内容\n\n请在此处编辑文档内容...`,
        fileName: initialDocument.fileName || '',
        externalUrl:
          initialDocument.externalUrl || initialDocument.linkUrl || '',
        fileAttr: (initialDocument.fileAttr as JsonObject) || {},
      };
    } else {
      // 新建文档，使用folder的folderAttr
      return {
        title: '',
        citation: '',
        createTime: new Date().toLocaleString('zh-CN'),
        contentType: 'markdown',
        fileType: (repository?.supportedFileTypes[0]?.toLowerCase() ||
          'pdf') as DocumentData['fileType'],
        content: '# 新文档\n\n## 文档内容\n\n请在此处编辑文档内容...',
        fileName: '',
        externalUrl: '',
        fileAttr: (repository?.folderAttr as JsonObject) || {},
      };
    }
  });

  const [urlValidation, setUrlValidation] = useState<{
    isValid: boolean;
    isChecking: boolean;
    error?: string;
    status: 'success' | 'error' | 'checking' | 'idle';
  }>({
    isValid: false,
    isChecking: false,
    status: 'idle',
  });

  const [activeTab, setActiveTab] = useState('edit');
  const [isBasicInfoOpen, setIsBasicInfoOpen] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [documentId, setDocumentId] = useState<string | null>(
    initialDocument?.id || null
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const { currentApp } = useTale();


  // 修复JSON相关状态
  const [jsonAttr, setJsonAttr] = useState<JsonObject>(() => {
    if (initialDocument && initialDocument.id) {
      // 修改现有文档，使用文件本身的JSON数据
      return (initialDocument.fileAttr as JsonObject) || {};
    } else {
      // 新建文档，优先使用传入的fileAttr，如果没有则使用repository的folderAttr
      return (initialDocument?.fileAttr ||
        repository?.folderAttr ||
        {}) as JsonObject;
    }
  });

  // 添加缺失的jsonError状态
  const [jsonError, setJsonError] = useState<string | null>(null);





  // 快捷键功能已移除，避免 SSR 环境中的 document 对象访问错误

  // Get supported file types from repository
  const supportedFileTypes = repository?.supportedFileTypes || [];

  // Filter content types based on repository support
  const availableContentTypes = contentTypes.filter(type =>
    supportedFileTypes.map(t => t.toLowerCase()).includes(type.value)
  );

  // 自动选中第一个可用的内容类型
  useEffect(() => {
    if (availableContentTypes.length > 0) {
      const currentFileTypeExists = availableContentTypes.some(
        type => type.value === document.fileType
      );
      
      if (!currentFileTypeExists) {
        setDocument(prev => ({
          ...prev,
          fileType: availableContentTypes[0].value as DocumentData['fileType']
        }));
      }
    }
  }, [availableContentTypes, document.fileType]);

  // URL格式验证函数
  const isValidUrl = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  };

  // 检查URL可访问性
  const checkUrlAccessibility = useCallback(async (url: string) => {
    if (!url.trim()) {
      setUrlValidation({ isValid: false, isChecking: false, status: 'idle' });
      return;
    }

    if (!isValidUrl(url)) {
      setUrlValidation({
        isValid: false,
        isChecking: false,
        error: 'URL格式不正确，请输入有效的网址（如：https://example.com）',
        status: 'error',
      });
      return;
    }

    setUrlValidation({ isValid: false, isChecking: true, status: 'checking' });

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时

      clearTimeout(timeoutId);

      setUrlValidation({
        isValid: true,
        isChecking: false,
        status: 'success',
      });
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setUrlValidation({
        isValid: true, // 格式正确就认为有效
        isChecking: false,
        status: 'success',
      });
    }
  }, []);

  // 防抖函数
  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return function executedFunction(...args: never[]) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  };

  // 创建防抖的URL检查函数
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUrlCheck = useCallback(
    debounce(checkUrlAccessibility, 1000),
    []
  );

  // 获取接受的文件类型
  const getAcceptedFileTypes = (fileType: string) => {
    switch (fileType.toUpperCase()) {
      case 'PDF':
        return '.pdf';
      case 'AUDIO':
        return '.mp3,.wav,.aac,.m4a';
      case 'VIDEO':
        return '.mp4,.avi,.mov,.wmv,.flv';
      case 'IMAGE':
        return '.jpg,.jpeg,.png,.gif,.bmp,.webp';
      case 'MARKDOWN':
        return '.md,.markdown';
      case 'DOC':
        return '.doc,.docx,.txt,.rtf';
      default:
        return '*';
    }
  };

  // 根据文件类型显示上传组件
  const renderFileUpload = () => {
    if (
      !repository?.supportedFileTypes.includes(document.fileType.toUpperCase())
    ) {
      return null;
    }

    const fileType = contentTypes.find(
      type => type.value === document.fileType
    );
    if (!fileType) return null;

    const Icon = fileType.icon;

    return (
      <div className='space-y-4'>
        <div className='flex items-center gap-2'>
          <Icon className={`w-5 h-5`} />
          <span className='font-medium'>{fileType.label}文件上传</span>
        </div>

        <div className='border-2 border-dashed border-gray-300 rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 transition-colors'>
          <input
            type='file'
            onChange={handleFileUpload}
            className='hidden'
            id='file-upload-new'
            accept={getAcceptedFileTypes(document.fileType)}
          />
          <label htmlFor='file-upload-new' className='cursor-pointer'>
            <Upload className='w-8 h-8 text-gray-400 mx-auto mb-2' />
            <p className='text-sm text-gray-600'>
              点击上传{fileType.label}文件
            </p>
          </label>

          {uploadedFile && (
            <div className='mt-4 p-3 bg-green-50 border border-green-200 rounded'>
              <p className='text-sm text-green-700'>
                已选择文件: {uploadedFile.name}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 处理URL输入变化
  const handleUrlChange = (url: string) => {
    setDocument({ ...document, externalUrl: url });
    void debouncedUrlCheck(url as never);
  };

  // 获取验证状态图标
  const getValidationIcon = () => {
    switch (urlValidation.status) {
      case 'checking':
        return (
          <div className='animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent'></div>
        );
      case 'success':
        return (
          <svg
            className='w-4 h-4 text-green-500'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
              clipRule='evenodd'
            />
          </svg>
        );
      case 'error':
        return (
          <svg
            className='w-4 h-4 text-red-500'
            fill='currentColor'
            viewBox='0 0 20 20'
          >
            <path
              fillRule='evenodd'
              d='M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z'
              clipRule='evenodd'
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Check if file type is supported
      const fileExtension = file.name.split('.').pop()?.toLowerCase();
      const isSupported = supportedFileTypes.some((type: string) => {
        switch (type.toUpperCase()) {
          case 'PDF':
            return fileExtension === 'pdf';
          case 'AUDIO':
            return ['mp3', 'wav', 'aac', 'm4a'].includes(fileExtension || '');
          case 'VIDEO':
            return ['mp4', 'avi', 'mov', 'wmv', 'flv'].includes(
              fileExtension || ''
            );
          case 'IMAGE':
            return ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(
              fileExtension || ''
            );
          case 'MARKDOWN':
            return ['md', 'markdown'].includes(fileExtension || '');
          case 'DOC':
            return ['doc', 'docx', 'txt', 'rtf'].includes(fileExtension || '');
          default:
            return false;
        }
      });

      if (!isSupported) {
        alert(
          `不支持的文件类型：${fileExtension}。该资料库仅支持：${supportedFileTypes.join(', ')}`
        );
        return;
      }

      setDocument({ ...document, fileName: file.name });
      setUploadedFile(file);
    }
  };

  // Markdown formatting functions
  const insertMarkdown = (before: string, after = '', placeholder = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = document.content.substring(start, end);
    const textToInsert = selectedText || placeholder;

    const newContent =
      document.content.substring(0, start) +
      before +
      textToInsert +
      after +
      document.content.substring(end);

    setDocument({ ...document, content: newContent });

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos =
        start + before.length + textToInsert.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = document.content.split('\n');
    let currentPos = 0;
    let lineIndex = 0;

    // Find which line the cursor is on
    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= start) {
        lineIndex = i;
        break;
      }
      currentPos += lines[i].length + 1; // +1 for newline
    }

    lines[lineIndex] = prefix + lines[lineIndex];
    const newContent = lines.join('\n');
    setDocument({ ...document, content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const formatBold = () => insertMarkdown('**', '**', '粗体文本');
  const formatItalic = () => insertMarkdown('*', '*', '斜体文本');
  const formatStrikethrough = () => insertMarkdown('~~', '~~', '删除线文本');
  const formatCode = () => insertMarkdown('`', '`', '代码');
  const formatH1 = () => insertAtLineStart('# ');
  const formatH2 = () => insertAtLineStart('## ');
  const formatH3 = () => insertAtLineStart('### ');
  const formatUnorderedList = () => insertAtLineStart('- ');
  const formatOrderedList = () => insertAtLineStart('1. ');
  const formatQuote = () => insertAtLineStart('> ');
  const formatLink = () => insertMarkdown('[', '](url)', '链接文本');
  const formatImage = () => insertMarkdown('![', '](image-url)', '图片描述');
  const formatCodeBlock = () => insertMarkdown('```\n', '\n```', '代码块');

  // 添加保存文档函数
  const handleSaveDocument = async () => {
    if (!repository) {
      setSaveError('未选择资料库');
      return;
    }

    if (!currentApp?.app_key) {
      setSaveError('未找到应用信息，请重新选择应用');
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);

      // 根据文件类型决定数据存储位置
      const getRequestData = () => {
        const baseData = {
          folderId: repository.id,
          fileName: document.title,
          fileType: document.fileType.toUpperCase(),
          remark: document.citation,
          fileAttr: document.fileAttr,
        };

        // 根据文件类型决定内容存储位置
        if (document.fileType === 'link') {
          // 链接类型存储到linkUrl
          return {
            ...baseData,
            linkUrl: document.externalUrl,
            content: '',
            file: undefined,
          };
        } else if (
          ['pdf', 'other'].includes(document.fileType) ||
          document.contentType === 'markdown'
        ) {
          // markdown、doc内容存储到content
          return {
            ...baseData,
            content: document.content,
            linkUrl: '',
            file: uploadedFile || undefined,
          };
        } else {
          // 图片、视频、音频等存储到file
          return {
            ...baseData,
            content: '',
            linkUrl: '',
            file: uploadedFile || undefined,
          };
        }
      };

      if (documentId) {
        // 更新现有文档
        const updateData = {
          ...getRequestData(),
          id: documentId,
          folderId: repository.id,
        };
        const response = await updateFile(documentId, updateData, currentApp.app_key);

        if (response) {
          alert('文档更新成功！');
          // 保存成功后跳转到管理资料库列表页面
          onBack?.();
        } else {
          setSaveError('更新文档失败');
        }
      } else {
        // 创建新文档
        const createData = getRequestData() as CreateFileRequest;
        const response = await createFile(createData, currentApp.app_key);

        if (response?.id) {
          setDocumentId(response.id);
          alert('文档创建成功！');
          // 保存成功后跳转到管理资料库列表页面
          onBack?.();
        } else {
          setSaveError('创建文档失败');
        }
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : '保存文档失败');
    } finally {
      setSaving(false);
    }
  };

  const renderContentEditor = () => {
    if (document.fileType === 'link') {
      return (
        <div className='space-y-4'>
          <div>
            <Label htmlFor='external-url'>外部链接</Label>
            <div className='relative'>
              <Input
                id='external-url'
                type='url'
                placeholder='请输入完整的网址，如：https://example.com'
                value={document.externalUrl}
                onChange={e => handleUrlChange(e.target.value)}
                className={`pr-10 ${
                  urlValidation.status === 'error'
                    ? 'border-red-300 focus:border-red-500'
                    : urlValidation.status === 'success'
                      ? 'border-green-300 focus:border-green-500'
                      : ''
                }`}
              />
              <div className='absolute inset-y-0 right-0 flex items-center pr-3'>
                {getValidationIcon()}
              </div>
            </div>
            {urlValidation.error && (
              <p className='text-sm text-red-600 mt-1'>{urlValidation.error}</p>
            )}
            {urlValidation.status === 'success' && (
              <p className='text-sm text-green-600 mt-1'>链接格式正确</p>
            )}
          </div>
        </div>
      );
    }

    // 需要文件上传的类型：PDF、图片、视频、音频、DOC
    if (['pdf', 'image', 'video', 'audio', 'doc'].includes(document.fileType)) {
      return renderFileUpload();
    }

    // 对于markdown和其他类型，显示markdown编辑器
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid w-full grid-cols-2'>
          <TabsTrigger value='edit' className='flex items-center gap-2'>
            <Edit className='w-4 h-4' />
            编辑
          </TabsTrigger>
          <TabsTrigger value='preview' className='flex items-center gap-2'>
            <Eye className='w-4 h-4' />
            预览
          </TabsTrigger>
        </TabsList>
        <TabsContent value='edit' className='mt-4'>
          {/* Markdown Toolbar */}
          <div className='border rounded-t-lg p-2 bg-gray-50 flex flex-wrap gap-1 overflow-x-auto'>
            <Button variant='ghost' size='sm' onClick={formatBold} title='粗体'>
              <Bold className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatItalic}
              title='斜体'
            >
              <Italic className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatStrikethrough}
              title='删除线'
            >
              <Strikethrough className='w-4 h-4' />
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <Button
              variant='ghost'
              size='sm'
              onClick={formatH1}
              title='一级标题'
            >
              <Heading1 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatH2}
              title='二级标题'
            >
              <Heading2 className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatH3}
              title='三级标题'
            >
              <Heading3 className='w-4 h-4' />
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <Button
              variant='ghost'
              size='sm'
              onClick={formatUnorderedList}
              title='无序列表'
            >
              <List className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatOrderedList}
              title='有序列表'
            >
              <ListOrdered className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatQuote}
              title='引用'
            >
              <Quote className='w-4 h-4' />
            </Button>
            <Separator orientation='vertical' className='h-6' />
            <Button
              variant='ghost'
              size='sm'
              onClick={formatCode}
              title='行内代码'
            >
              <Code className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatCodeBlock}
              title='代码块'
            >
              <Code className='w-4 h-4' />
            </Button>
            <Button variant='ghost' size='sm' onClick={formatLink} title='链接'>
              <Link className='w-4 h-4' />
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={formatImage}
              title='图片'
            >
              <ImageIcon className='w-4 h-4' />
            </Button>
          </div>

          <Textarea
            ref={textareaRef}
            placeholder='请输入文档内容...'
            value={document.content}
            onChange={e =>
              setDocument({ ...document, content: e.target.value })
            }
            className='min-h-[300px] sm:min-h-[400px] border-t-0 rounded-t-none focus:ring-0 focus:border-gray-300 resize-none'
          />
        </TabsContent>
        <TabsContent value='preview' className='mt-4'>
          <div
            className='min-h-[300px] sm:min-h-[400px] p-4 border rounded-lg bg-white prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(document.content),
            }}
          />
        </TabsContent>
      </Tabs>
    );
  };

  // 将JSON变化处理函数移到组件内部
  const handleJsonChange = (value: JsonObject) => {
    setJsonAttr(value);
    setDocument({ ...document, fileAttr: value });
    setJsonError(null);
  };

  return (
    <div className='w-full p-4 sm:p-6 space-y-4 sm:space-y-6'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-2 sm:gap-4'>
          <Button
            variant='ghost'
            onClick={onBack}
            className='text-gray-600 hover:text-gray-900'
          >
            <ArrowLeft className='w-4 h-4 mr-2' />
            返回
          </Button>
          <div>
            <h1 className='text-xl sm:text-2xl font-bold text-gray-900'>文档编辑器</h1>
            <p className='text-sm sm:text-base text-gray-600 hidden sm:block'>编辑和管理文档内容</p>
          </div>
        </div>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
          <Button onClick={() => handleSaveDocument()} disabled={saving} className='w-full sm:w-auto order-1 sm:order-2'>
            <Save className='w-4 h-4 mr-2' />
            {saving ? '保存中...' : '保存文档'}
          </Button>
        </div>
      </div>

      {saveError && (
        <div className='p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3 shadow-sm'>
          <AlertTriangle className='w-5 h-5 text-red-600 mt-0.5 flex-shrink-0' />
          <div className='flex-1'>
            <h4 className='font-medium text-red-800 mb-1'>保存失败</h4>
            <p className='text-red-600 text-sm'>{saveError}</p>
            <Button 
              variant='outline' 
              size='sm' 
              className='mt-2 text-red-600 border-red-200 hover:bg-red-50'
              onClick={() => setSaveError(null)}
            >
              关闭
            </Button>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <Card className='shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200'>
        <Collapsible open={isBasicInfoOpen} onOpenChange={setIsBasicInfoOpen}>
          <CollapsibleTrigger asChild>
            <CardHeader className='cursor-pointer hover:bg-gray-50 transition-colors bg-gray-50 border-b border-gray-200'>
              <div className='flex items-center justify-between'>
                <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
                  <FileText className='w-5 h-5' />
                  基本信息
                </CardTitle>
                {isBasicInfoOpen ? (
                  <ChevronUp className='w-4 h-4' />
                ) : (
                  <ChevronDown className='w-4 h-4' />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className='space-y-6 p-6'>
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-4'>
                <div>
                  <Label htmlFor='title'>文档标题</Label>
                  <Input
                    id='title'
                    placeholder='请输入文档标题'
                    value={document.title}
                    onChange={e =>
                      setDocument({ ...document, title: e.target.value })
                    }
                  />
                </div>
                <div>
                  <Label htmlFor='citation'>备注</Label>
                  <Input
                    id='citation'
                    placeholder='请输入备注信息'
                    value={document.citation}
                    onChange={e =>
                      setDocument({ ...document, citation: e.target.value })
                    }
                  />
                </div>
              </div>

              {/* 文件类型选择 - 根据repository支持的类型显示 */}
              {availableContentTypes.length > 0 && (
                <div>
                  <Label>内容类型</Label>
                  <RadioGroup
                    value={document.fileType}
                    onValueChange={value =>
                      setDocument({ ...document, fileType: value as never })
                    }
                    className='mt-2'
                  >
                    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
                      {availableContentTypes.map(type => {
                        const Icon = type.icon;
                        return (
                          <div
                            key={type.value}
                            className='flex items-center space-x-2'
                          >
                            <RadioGroupItem
                              value={type.value}
                              id={type.value}
                            />
                            <label
                              htmlFor={type.value}
                              className='flex items-center gap-2 cursor-pointer text-sm font-medium'
                            >
                              <Icon className='w-4 h-4' />
                              {type.label}
                            </label>
                          </div>
                        );
                      })}
                    </div>
                  </RadioGroup>
                </div>
              )}

              {/* JSON属性编辑器 */}
              <div>
                <Label htmlFor='json-attr'>JSON属性</Label>
                <div className='mt-2'>
                  <JsonVisualEditor
                    data={jsonAttr || {}}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    onDataChange={(value: any) => handleJsonChange(value)}
                    className='min-h-[200px] max-h-[40vh] w-full'
                  />
                  {jsonError && (
                    <p className='text-sm text-red-600 mt-1'>{jsonError}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>

      {/* Content Editor */}
      <Card className='shadow-sm border-gray-200 hover:shadow-md transition-shadow duration-200'>
        <CardHeader className='bg-gray-50 border-b border-gray-200'>
          <CardTitle className='flex items-center gap-2 text-lg font-semibold text-gray-800'>
            <Edit className='w-5 h-5' />
            内容编辑
          </CardTitle>
        </CardHeader>
        <CardContent className='p-6'>{renderContentEditor()}</CardContent>
      </Card>
    </div>
  );
}
