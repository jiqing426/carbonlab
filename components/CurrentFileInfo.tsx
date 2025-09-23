'use client';

import { useState, useEffect } from 'react';
import { File, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CurrentFileInfoProps {
  ossUrl?: string;
  fileName?: string;
  className?: string;
}

export default function CurrentFileInfo({
  ossUrl,
  fileName,
  className = ''
}: CurrentFileInfoProps) {
  const [fileIcon, setFileIcon] = useState(<File className="w-8 h-8 text-gray-400" />);
  const [fileSize, setFileSize] = useState<string>('未知大小');
  const [fileType, setFileType] = useState<string>('未知类型');

  useEffect(() => {
    if (fileName) {
      const extension = fileName.split('.').pop()?.toLowerCase() || '';

      // 设置文件图标
      switch (extension) {
        case 'pdf':
          setFileIcon(<FileText className="w-8 h-8 text-red-500" />);
          setFileType('PDF文档');
          break;
        case 'doc':
        case 'docx':
          setFileIcon(<FileText className="w-8 h-8 text-blue-500" />);
          setFileType('Word文档');
          break;
        case 'xls':
        case 'xlsx':
          setFileIcon(<FileText className="w-8 h-8 text-green-500" />);
          setFileType('Excel表格');
          break;
        case 'ppt':
        case 'pptx':
          setFileIcon(<FileText className="w-8 h-8 text-orange-500" />);
          setFileType('PowerPoint演示文稿');
          break;
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'gif':
        case 'bmp':
        case 'webp':
          setFileIcon(<File className="w-8 h-8 text-purple-500" />);
          setFileType('图片文件');
          break;
        case 'mp4':
        case 'avi':
        case 'mov':
        case 'wmv':
        case 'flv':
          setFileIcon(<File className="w-8 h-8 text-indigo-500" />);
          setFileType('视频文件');
          break;
        case 'mp3':
        case 'wav':
        case 'aac':
        case 'm4a':
          setFileIcon(<File className="w-8 h-8 text-yellow-500" />);
          setFileType('音频文件');
          break;
        case 'md':
        case 'markdown':
          setFileIcon(<FileText className="w-8 h-8 text-gray-600" />);
          setFileType('Markdown文档');
          break;
        default:
          setFileIcon(<File className="w-8 h-8 text-gray-400" />);
          setFileType('未知类型');
      }
    }
  }, [fileName]);

  const handleDownload = () => {
    if (ossUrl) {
      window.open(ossUrl, '_blank');
    }
  };

  return (
    <div className={`p-4 bg-blue-50 border border-blue-200 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        {fileIcon}
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-blue-900 mb-1">
            {fileName || '未命名文件'}
          </h4>
          <p className="text-xs text-blue-700 mb-2">
            {fileType} • {fileSize}
          </p>
          {ossUrl && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="h-7 px-2 text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              下载/查看
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}