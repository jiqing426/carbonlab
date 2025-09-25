import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LessonCompletionAlert } from '@/components/unit/LessonCompletionAlert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Network } from 'lucide-react';

// 自定义图片组件，支持base64图片
const CustomImage = ({ src, alt, ...props }: any) => {
  if (!src) return null;

  // 如果是base64图片，直接显示
  if (src.startsWith('data:image/')) {
    return (
      <img
        src={src}
        alt={alt || ''}
        className="max-w-full h-auto rounded-lg"
        {...props}
      />
    );
  }

  // 否则使用默认的img行为
  return <img src={src} alt={alt || ''} {...props} />;
};

export function MainContent({
  currentLesson,
  progressRecords,
  toggleLessonCompletion,
  mediaPreviewUrl,
}: {
  currentLesson: any;
  progressRecords: any;
  toggleLessonCompletion: any;
  mediaPreviewUrl?: string;
}) {
  // 渲染课程内容（根据category显示不同类型）
  const renderLessonContent = () => {
    const lessonCategory = currentLesson?.category?.toUpperCase();

    // 如果有媒体预览URL且是支持的媒体类型，优先显示媒体内容
    if (
      mediaPreviewUrl &&
      ['PDF', 'VIDEO', 'AUDIO', 'DOC', 'PPT'].includes(lessonCategory || '')
    ) {
      switch (lessonCategory) {
        case 'PDF':
          return (
            <div className='space-y-6'>
              <div className='w-full flex justify-center'>
                <iframe
                  src={mediaPreviewUrl}
                  className='w-full max-h-[60vh] border rounded-lg'
                  style={{ height: '600px' }}
                  title={currentLesson?.title || 'PDF文档'}
                />
              </div>
              {currentLesson?.content && (
                <div className='prose prose-lg max-w-none dark:prose-invert break-words'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: CustomImage
                    }}
                  >
                    {currentLesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        case 'VIDEO':
          return (
            <div className='space-y-6'>
              <div className='w-full flex justify-center'>
                <video
                  src={mediaPreviewUrl}
                  controls
                  className='max-w-full rounded-lg max-h-[60vh]'
                >
                  您的浏览器不支持视频播放。
                </video>
              </div>
              {currentLesson?.content && (
                <div className='prose prose-lg max-w-none dark:prose-invert break-words'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: CustomImage
                    }}
                  >
                    {currentLesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        case 'AUDIO':
          return (
            <div className='space-y-6'>
              <div className='text-center space-y-4 p-6 bg-muted/50 rounded-lg'>
                <div className='w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  🎵
                </div>
                <audio
                  src={mediaPreviewUrl}
                  controls
                  className='w-full max-w-md mx-auto'
                >
                  您的浏览器不支持音频播放。
                </audio>
                <p className='text-sm text-muted-foreground'>
                  {currentLesson?.title}
                </p>
              </div>
              {currentLesson?.content && (
                <div className='prose prose-lg max-w-none dark:prose-invert break-words'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: CustomImage
                    }}
                  >
                    {currentLesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        case 'DOC':
        case 'PPT':
          return (
            <div className='space-y-6'>
              <div className='text-center space-y-4 p-6 bg-muted/50 rounded-lg'>
                <div className='w-12 h-12 mx-auto bg-muted rounded-full flex items-center justify-center'>
                  📄
                </div>
                <p className='text-lg font-medium'>{currentLesson?.title}</p>
                <a
                  href={mediaPreviewUrl}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='inline-block px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90'
                >
                  在新窗口打开文档
                </a>
              </div>
              {currentLesson?.content && (
                <div className='prose prose-lg max-w-none dark:prose-invert break-words'>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    components={{
                      img: CustomImage
                    }}
                  >
                    {currentLesson.content}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          );
        default:
          break;
      }
    }

    // 默认显示Markdown内容
    return (
      <div className='prose prose-lg max-w-none dark:prose-invert break-words'>
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={{
            img: CustomImage
          }}
        >
          {currentLesson?.content || ''}
        </ReactMarkdown>
      </div>
    );
  };

  return (
    <div className='flex-1 flex flex-col overflow-hidden min-w-0'>
      <Tabs defaultValue='text' className='h-full flex flex-col'>
        <div className='px-4 pt-4'>
          <TabsList className='grid w-full grid-cols-2 gap-1 mb-2'>
            <TabsTrigger value='text' className='text-xs'>
              <FileText className='h-3 w-3 mb-0.5' />
              <span className='hidden sm:inline ml-1'>课程内容</span>
            </TabsTrigger>
            <TabsTrigger value='mindmap' className='text-xs'>
              <Network className='h-3 w-3 mb-0.5' />
              <span className='hidden sm:inline ml-1'>思维导图</span>
            </TabsTrigger>
          </TabsList>
        </div>

        <div className='flex-1 overflow-hidden'>
          <TabsContent value='text' className='h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col'>
            <ScrollArea className='flex-1'>
              <div className='rounded-lg p-4 lg:p-6 max-w-4xl mx-auto'>
                {renderLessonContent()}
                <div className='mt-8'>
                  <LessonCompletionAlert
                    currentLesson={currentLesson}
                    progressRecords={progressRecords}
                    toggleLessonCompletion={toggleLessonCompletion}
                  />
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value='mindmap' className='h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col'>
            <ScrollArea className='flex-1'>
              <div className='rounded-lg p-4 lg:p-6'>
              {currentLesson?.aiMindmap ? (
                <div className='text-center p-8'>
                  <div className='w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4'>
                    🗺️
                  </div>
                  <p className='text-muted-foreground'>思维导图功能开发中...</p>
                </div>
              ) : (
                <div className='text-center p-4 text-muted-foreground'>
                  暂无思维导图数据
                </div>
              )}
              </div>
            </ScrollArea>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}