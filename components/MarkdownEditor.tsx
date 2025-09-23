'use client';

import { useState } from 'react';
import { Bold, Italic, List, ListOrdered, Quote, Code as CodeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  editable?: boolean;
}

export default function MarkdownEditor({
  value,
  onChange,
  className = '',
  placeholder = '在此输入Markdown内容...',
  editable = true
}: MarkdownEditorProps) {
  const [isFocused, setIsFocused] = useState(false);

  const insertText = (text: string) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + text + value.substring(end);
      onChange(newValue);

      // Move cursor after inserted text
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + text.length;
        textarea.focus();
      }, 0);
    }
  };

  const wrapText = (before: string, after: string = before) => {
    const textarea = document.querySelector('textarea');
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end);
      const replacement = before + selectedText + after;
      const newValue = value.substring(0, start) + replacement + value.substring(end);
      onChange(newValue);

      // Move cursor to select the wrapped text
      setTimeout(() => {
        textarea.selectionStart = start;
        textarea.selectionEnd = start + replacement.length;
        textarea.focus();
      }, 0);
    }
  };

  const formatText = (format: string) => {
    switch (format) {
      case 'bold':
        wrapText('**');
        break;
      case 'italic':
        wrapText('*');
        break;
      case 'code':
        wrapText('`');
        break;
      case 'bulletList':
        insertText('\n- ');
        break;
      case 'orderedList':
        insertText('\n1. ');
        break;
      case 'blockquote':
        wrapText('> ');
        break;
    }
  };

  const insertMarkdown = (type: string) => {
    switch (type) {
      case 'heading':
        insertText('\n## ');
        break;
      case 'link':
        insertText('[链接文本](https://example.com)');
        break;
      case 'image':
        insertText('![图片描述](https://example.com/image.jpg)');
        break;
      case 'codeBlock':
        insertText('\n```\n// 在此输入代码\n```\n');
        break;
      case 'table':
        insertText(
          '\n| 列1 | 列2 | 列3 |\n|-----|-----|-----|\n| 内容1 | 内容2 | 内容3 |\n| 内容4 | 内容5 | 内容6 |\n'
        );
        break;
    }
  };

  return (
    <div className={`flex flex-col border rounded-md ${isFocused ? 'ring-2 ring-blue-500' : ''} ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bold')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="粗体"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('italic')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="斜体"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('code')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="代码"
        >
          <CodeIcon className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('bulletList')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="无序列表"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('orderedList')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="有序列表"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => formatText('blockquote')}
          disabled={!editable}
          className="h-8 w-8 p-0"
          title="引用"
        >
          <Quote className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-gray-300 mx-1"></div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('heading')}
          disabled={!editable}
          className="h-8 px-2 text-xs"
        >
          标题
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('link')}
          disabled={!editable}
          className="h-8 px-2 text-xs"
        >
          链接
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('image')}
          disabled={!editable}
          className="h-8 px-2 text-xs"
        >
          图片
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('codeBlock')}
          disabled={!editable}
          className="h-8 px-2 text-xs"
        >
          代码块
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => insertMarkdown('table')}
          disabled={!editable}
          className="h-8 px-2 text-xs"
        >
          表格
        </Button>
      </div>

      {/* Editor */}
      <div className="flex-1 min-h-[200px]">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={!editable}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className="w-full h-full p-4 border-0 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          style={{ minHeight: '200px' }}
        />
      </div>
    </div>
  );
}