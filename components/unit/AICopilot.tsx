'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkBreaks from 'remark-breaks';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  FileText,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface UnitCopilotProps {
  currentLesson: {
    id: string;
    ai_summary?: string;
  } | null;
  noteId: string;
}

export function UnitCopilot({ currentLesson, noteId }: UnitCopilotProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '我是您的AI助教，请问有什么问题？',
    },
  ]);
  const [input, setInput] = useState('');

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input,
    };

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: `感谢您的问题"${input}"。AI助教功能正在开发中，敬请期待！`,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
  };

  return (
    <div
      className={`border-l transition-all duration-300 ease-in-out flex-shrink-0 bg-background flex flex-col relative h-full ${isCollapsed ? 'w-16' : 'w-96'}`}
    >
      <button
        type="button"
        onClick={toggleCollapse}
        className={cn(
          'absolute left-[-12px] top-16 border rounded-full p-1 transition-all duration-200',
          'bg-background hover:bg-primary/5 dark:hover:bg-primary/10',
          'hover:border-primary/50 dark:hover:border-primary/50',
          'text-foreground hover:text-primary'
        )}
      >
        {isCollapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className='flex items-center p-4'>
        {!isCollapsed && (
          <h2 className='text-xl font-bold truncate' title='AI 助教'>
            AI 助教
          </h2>
        )}
      </div>

      {!isCollapsed && (
        <div className='flex-1 p-2 overflow-hidden flex flex-col'>
          <Tabs defaultValue='summary' className='h-full flex flex-col'>
            <TabsList className='grid w-full grid-cols-2 gap-1'>
              <TabsTrigger value='summary' className='text-xs'>
                <FileText className='h-3 w-3 mb-0.5' />
                <span className='hidden sm:inline ml-1'>总结</span>
              </TabsTrigger>
              <TabsTrigger value='chat' className='text-xs'>
                <MessageSquare className='h-3 w-3 mb-0.5' />
                <span className='hidden sm:inline ml-1'>对话</span>
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 min-h-0 relative'>
              <TabsContent
                value='summary'
                className='absolute inset-0 h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col'
              >
                <ScrollArea className='flex-1 pr-2'>
                  <div className='prose prose-sm max-w-none dark:prose-invert p-4 break-words'>
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                      rehypePlugins={[rehypeKatex]}
                      components={{
                        img: CustomImage
                      }}
                    >
                      {currentLesson?.ai_summary || '暂无内容总结'}
                    </ReactMarkdown>
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent
                value='chat'
                className='absolute inset-0 h-full m-0 p-0 data-[state=active]:flex data-[state=active]:flex-col'
              >
                <ScrollArea className='flex-1 pr-2'>
                  {messages.map(message => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} mb-2`}
                    >
                      <div
                        className={`max-w-[90%] p-2 rounded-lg break-words ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-secondary text-secondary-foreground'
                        }`}
                      >
                        <div className="break-words">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm, remarkBreaks, remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            components={{
                              img: CustomImage
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </ScrollArea>
                <form onSubmit={handleSubmit} className='flex space-x-2 p-1'>
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder='提出问题...'
                    className='flex-grow text-sm h-9'
                  />
                  <Button type='submit' size='sm' className='h-9'>
                    <Send className='h-4 w-4' />
                  </Button>
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      )}
    </div>
  );
}