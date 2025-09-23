'use client';

import React, { useState, useEffect, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkBreaks from 'remark-breaks';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2, AlertCircle, Download, Copy, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import 'katex/dist/katex.min.css';

interface MarkdownViewerProps {
  content?: string;
  fileName?: string;
}

export default function MarkdownViewer({
  content: initialContent,
  fileName,
}: MarkdownViewerProps) {
  const [content, setContent] = useState<string>(initialContent || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const markdownStyles = {
    h1: {
      fontSize: '1.5em',
      marginTop: '0.83em',
      marginBottom: '0.83em',
      fontWeight: 'bold',
    },
    h2: {
      fontSize: '1.17em',
      marginTop: '1em',
      marginBottom: '1em',
      fontWeight: 'bold',
    },
    h3: {
      fontSize: '1em',
      marginTop: '1.33em',
      marginBottom: '1.33em',
      fontWeight: 'bold',
    },
    h4: {
      fontSize: '0.83em',
      marginTop: '1.67em',
      marginBottom: '1.67em',
      fontWeight: 'bold',
    },
    h5: {
      fontSize: '0.67em',
      marginTop: '2.33em',
      marginBottom: '2.33em',
      fontWeight: 'bold',
    },
  };

  if (loading) {
    return (
      <div className='flex flex-col h-full'>
        {/* 工具栏占位 */}
        <div className='flex items-center justify-between p-2 bg-muted border-b'>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-4 w-32' />
          </div>
          <div className='flex items-center gap-2'>
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-8 w-16' />
            <Skeleton className='h-8 w-16' />
          </div>
        </div>

        {/* 内容区域 */}
        <div className='flex-1 overflow-auto bg-white dark:bg-gray-900'>
          <div className='max-w-4xl mx-auto p-6'>
            <div className='flex flex-col items-center justify-center min-h-[400px] space-y-4'>
              <Loader2 className='h-8 w-8 animate-spin text-primary' />
              <div className='text-center space-y-2'>
                <p className='text-lg font-medium'>正在加载 Markdown 文档</p>
                <p className='text-sm text-muted-foreground'>
                  {fileName
                    ? `正在解析 ${fileName}`
                    : '正在从远程地址获取文档内容'}
                </p>
              </div>
              <div className='w-full max-w-md space-y-3'>
                <Skeleton className='h-4 w-full' />
                <Skeleton className='h-4 w-3/4' />
                <Skeleton className='h-4 w-1/2' />
                <div className='space-y-2 mt-6'>
                  <Skeleton className='h-6 w-1/3' />
                  <Skeleton className='h-4 w-full' />
                  <Skeleton className='h-4 w-5/6' />
                  <Skeleton className='h-4 w-4/5' />
                </div>
              </div>
            </div>
          </div>
        </div>
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
              <Button size='sm' variant='outline'>
                重新加载
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  if (!content) {
    return (
      <div className='flex items-center justify-center h-64 bg-muted rounded-lg'>
        <div className='text-center'>
          <p className='text-lg font-medium mb-2'>Markdown 文档</p>
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
          <span className='text-sm font-medium'>
            {fileName || 'Markdown 文档'}
          </span>
        </div>
        <div className='flex items-center gap-2'>
          <Button
            onClick={copyToClipboard}
            size='sm'
            variant='outline'
            disabled={!content}
          >
            {copied ? (
              <Check className='w-4 h-4 mr-1' />
            ) : (
              <Copy className='w-4 h-4 mr-1' />
            )}
            {copied ? '已复制' : '复制'}
          </Button>
        </div>
      </div>

      {/* Markdown 内容 */}
      <div className='flex-1 overflow-auto bg-white dark:bg-gray-900'>
        <div className='max-w-4xl mx-auto p-6'>
          <div className='prose dark:prose-invert max-w-none prose-sm sm:prose-base w-full'>
            <ReactMarkdown
              remarkPlugins={[
                remarkGfm,
                [remarkMath, { singleDollarTextMath: false }],
                remarkBreaks,
              ]}
              rehypePlugins={[[rehypeKatex, { strict: false }]]}
              components={{
                h1: ({ children, ...props }) => (
                  <h1 style={markdownStyles.h1} {...props}>
                    {children}
                  </h1>
                ),
                h2: ({ children, ...props }) => (
                  <h2 style={markdownStyles.h2} {...props}>
                    {children}
                  </h2>
                ),
                h3: ({ children, ...props }) => (
                  <h3 style={markdownStyles.h3} {...props}>
                    {children}
                  </h3>
                ),
                h4: ({ children, ...props }) => (
                  <h4 style={markdownStyles.h4} {...props}>
                    {children}
                  </h4>
                ),
                h5: ({ children, ...props }) => (
                  <h5 style={markdownStyles.h5} {...props}>
                    {children}
                  </h5>
                ),
                table: ({ children, ...props }) => (
                  <table
                    className='border-collapse border border-gray-300 dark:border-gray-600'
                    {...props}
                  >
                    {children}
                  </table>
                ),
                th: ({ children, ...props }) => (
                  <th
                    className='border border-gray-300 dark:border-gray-600 px-4 py-2 bg-gray-100 dark:bg-gray-700'
                    {...props}
                  >
                    {children}
                  </th>
                ),
                td: ({ children, ...props }) => (
                  <td
                    className='border border-gray-300 dark:border-gray-600 px-4 py-2'
                    {...props}
                  >
                    {children}
                  </td>
                ),
                code: ({ children, className, ...props }) => {
                  const match = /language-(\w+)/.exec(className || '');
                  return match ? (
                    <code
                      className={`${className} block bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto`}
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className='bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-sm'
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children, ...props }) => (
                  <blockquote
                    className='border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4'
                    {...props}
                  >
                    {children}
                  </blockquote>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}