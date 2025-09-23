'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, Download } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import mammoth from 'mammoth';

interface DocxViewerProps {
  docxUrl: string;
  fileName?: string;
}

export default function DocxViewer({ docxUrl, fileName }: DocxViewerProps) {
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocx();
  }, [docxUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadDocx = async () => {
    if (!docxUrl) return;

    setLoading(true);
    setError(null);
    setHtmlContent('');

    try {
      const response = await fetch(docxUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      await convertDocxToHtml(arrayBuffer);
    } catch (err) {
      console.error('加载 DOCX 文件失败:', err);
      setError(err instanceof Error ? err.message : '加载 DOCX 文件失败');
    } finally {
      setLoading(false);
    }
  };

  const convertDocxToHtml = async (arrayBuffer: ArrayBuffer) => {
    try {
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setHtmlContent(result.value);

      if (result.messages.length > 0) {
        console.warn('Mammoth 转换警告:', result.messages);
      }
    } catch (error) {
      console.error('Mammoth 转换失败:', error);
      throw new Error('文档转换失败，请检查文档格式');
    }
  };

  if (loading) {
    return (
      <div className='flex flex-col space-y-4'>
        <div className='flex items-center gap-2 mb-4'>
          <Loader2 className='h-4 w-4 animate-spin' />
          <span className='text-sm text-muted-foreground'>
            正在加载 Word 文档...
          </span>
        </div>
        <Skeleton className='w-full h-[500px]' />
      </div>
    );
  }

  if (error) {
    return (
      <Alert className='border-destructive'>
        <AlertCircle className='h-4 w-4' />
        <AlertDescription>
          <div className='space-y-2'>
            <p>{error}</p>
            <div className='flex gap-2'>
              <Button onClick={loadDocx} size='sm' variant='outline'>
                重新加载
              </Button>
              {docxUrl && (
                <Button
                  onClick={() => window.open(docxUrl, '_blank')}
                  size='sm'
                  variant='outline'
                >
                  <Download className='w-4 h-4 mr-1' />
                  下载文件
                </Button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!htmlContent) {
    return (
      <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
        <div className='text-center'>
          <p className='text-lg font-medium mb-2'>Word 文档</p>
          <p className='text-muted-foreground'>该文档没有可用的内容</p>
        </div>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full'>
      {/* 工具栏 */}
      <div className='flex items-center justify-between p-2 bg-muted border-b'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium'>{fileName || 'Word 文档'}</span>
        </div>
        <div className='flex items-center gap-2'>
          <Button onClick={loadDocx} size='sm' variant='outline'>
            刷新
          </Button>
          {docxUrl && (
            <Button
              onClick={() => window.open(docxUrl, '_blank')}
              size='sm'
              variant='outline'
            >
              <Download className='w-4 h-4 mr-1' />
              下载
            </Button>
          )}
        </div>
      </div>

      {/* 文档内容 */}
      <div className='flex-1 overflow-auto bg-white'>
        <div className='max-w-4xl mx-auto p-6'>
          <div
            className='prose prose-sm max-w-none'
            dangerouslySetInnerHTML={{ __html: htmlContent }}
            style={{
              fontFamily:
                '"Microsoft YaHei", "PingFang SC", "Helvetica Neue", Arial, sans-serif',
              lineHeight: '1.6',
              color: '#333',
            }}
          />
        </div>
      </div>
    </div>
  );
}