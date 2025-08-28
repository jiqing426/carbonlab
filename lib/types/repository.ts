// 资料库类型定义
export interface Repository {
  id: string;
  folderName: string;
  folderType: string[];
  folderAttr?: {
    icon?: string;
    color?: string;
  };
  remark: string;
  createdAt: string;
  updatedAt: string;
  supportedFileTypes: string[];
  // 控制目标：用于控制特定页面内容
  controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
  displayOrder?: number; // 显示顺序
}

export interface RepositoryFile {
  id: string;
  fileName: string;
  description?: string;
  url?: string;
  fileType: string;
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
  uploader?: string;
  size?: number;
}

