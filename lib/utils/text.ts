/**
 * 截断文档标题，用于在有限空间内显示
 * @param title 原始标题
 * @param maxLength 最大长度，默认为30
 * @returns 截断后的标题
 */
export function truncateDocumentTitle(title: string, maxLength = 30): string {
  if (!title || title.length <= maxLength) {
    return title;
  }

  return title.substring(0, maxLength - 3) + '...';
}