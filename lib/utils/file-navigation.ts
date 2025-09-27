/**
 * 文件导航工具函数
 * 根据文件类型和URL判断如何打开文件
 */

export interface FileNavigationItem {
  url: string;
  fileType?: string;
  title?: string;
}

/**
 * 判断是否为外部链接
 */
export function isExternalLink(url: string): boolean {
  if (!url || url === '#') return false;
  
  // 检查是否以http://或https://开头
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return true;
  }
  
  // 检查是否以//开头（协议相对URL）
  if (url.startsWith('//')) {
    return true;
  }
  
  return false;
}

/**
 * 判断文件类型是否需要在新窗口打开
 */
export function shouldOpenInNewWindow(fileType?: string): boolean {
  if (!fileType) return false;
  
  const newWindowTypes = [
    'PDF',
    'MARKDOWN', 
    'MD',
    'DOC',
    'DOCX',
    'EXCEL',
    'XLS',
    'XLSX',
    'PPT',
    'PPTX',
    'IMAGE',
    'JPG',
    'JPEG',
    'PNG',
    'GIF',
    'VIDEO',
    'MP4',
    'AVI',
    'MOV',
    'AUDIO',
    'MP3',
    'WAV',
    'AAC'
  ];
  
  return newWindowTypes.includes(fileType.toUpperCase());
}

/**
 * 处理文件点击事件
 */
export function handleFileClick(item: FileNavigationItem, event?: React.MouseEvent): void {
  const { url, fileType, title } = item;
  
  // 如果没有有效URL，不执行任何操作
  if (!url || url === '#') {
    console.warn('Invalid URL for file:', title);
    return;
  }
  
  // 阻止默认行为
  if (event) {
    event.preventDefault();
  }
  
  // 判断是否为外部链接
  if (isExternalLink(url)) {
    // 外部链接在新窗口打开
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  
  // 判断文件类型是否需要新窗口打开
  if (shouldOpenInNewWindow(fileType)) {
    // 在新窗口打开文件
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }
  
  // 其他情况在当前窗口打开
  window.location.href = url;
}

/**
 * 创建带有正确点击处理的链接属性
 */
export function getFileLinkProps(item: FileNavigationItem) {
  const { url, fileType } = item;
  
  // 如果是外部链接或需要新窗口打开的文件类型
  if (isExternalLink(url) || shouldOpenInNewWindow(fileType)) {
    return {
      href: url,
      target: '_blank',
      rel: 'noopener noreferrer',
      onClick: (e: React.MouseEvent) => {
        e.preventDefault();
        handleFileClick(item, e);
      }
    };
  }
  
  // 内部链接
  return {
    href: url,
    onClick: (e: React.MouseEvent) => {
      e.preventDefault();
      handleFileClick(item, e);
    }
  };
}