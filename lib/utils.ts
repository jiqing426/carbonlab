import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 处理文件URI，确保正确的格式
 */
export function getProcessedFileUri(url: string): string {
  if (!url) return '';

  // 如果URL已经是完整的，直接返回
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  // 如果URL以//开头，添加https:
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // 如果URL以/开头，说明是相对路径，需要添加基础URL
  if (url.startsWith('/')) {
    const baseUrl = process.env.NEXT_PUBLIC_TALE_BACKEND_URL || 'https://api.turingue.com';
    return `${baseUrl}${url}`;
  }

  // 其他情况直接返回
  return url;
}
