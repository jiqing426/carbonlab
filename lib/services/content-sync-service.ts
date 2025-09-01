// 内容同步服务 - 用于将资料库的内容同步到对应的页面
import { Repository } from '@/types/repository';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  url?: string;
  date?: string;
  source?: string;
  type: 'policy' | 'news' | 'data' | 'report';
  repositoryId: string;
}

export interface SyncData {
  latestPolicies: ContentItem[];
  hotNews: ContentItem[];
  globalData: ContentItem[];
  chinaReports: ContentItem[];
}

class ContentSyncService {
  private static instance: ContentSyncService;
  
  static getInstance(): ContentSyncService {
    if (!ContentSyncService.instance) {
      ContentSyncService.instance = new ContentSyncService();
    }
    return ContentSyncService.instance;
  }

  // 从资料库同步内容到各个页面
  async syncContentFromRepositories(): Promise<SyncData> {
    try {
      // 从 localStorage 获取资料库数据
      const repositoriesData = localStorage.getItem('mockRepositories');
      if (!repositoriesData) {
        console.log('No repositories found, using default content');
        return this.getDefaultContent();
      }

      const repositories: Repository[] = JSON.parse(repositoriesData);
      console.log('Syncing content from repositories:', repositories);

      const syncData: SyncData = {
        latestPolicies: [],
        hotNews: [],
        globalData: [],
        chinaReports: []
      };

      // 遍历资料库，根据控制目标分类内容
      for (const repo of repositories) {
        if (repo.controlTarget) {
          const files = this.getRepositoryFiles(repo.id);
          const contentItems = this.convertFilesToContentItems(files, repo);
          
          switch (repo.controlTarget) {
            case 'latest-policy':
              syncData.latestPolicies.push(...contentItems);
              break;
            case 'hot-news':
              syncData.hotNews.push(...contentItems);
              break;
            case 'global-data':
              syncData.globalData.push(...contentItems);
              break;
            case 'china-report':
              syncData.chinaReports.push(...contentItems);
              break;
          }
        }
      }

      // 按显示顺序排序
      this.sortContentByDisplayOrder(syncData, repositories);
      
      console.log('Content sync completed:', syncData);
      return syncData;
    } catch (error) {
      console.error('Failed to sync content:', error);
      return this.getDefaultContent();
    }
  }

  // 获取资料库中的文件
  private getRepositoryFiles(repositoryId: string): any[] {
    try {
      const filesData = localStorage.getItem(`files_${repositoryId}`);
      if (filesData) {
        return JSON.parse(filesData);
      }
      return [];
    } catch (error) {
      console.error(`Failed to get files for repository ${repositoryId}:`, error);
      return [];
    }
  }

  // 将文件转换为内容项
  private convertFilesToContentItems(files: any[], repository: Repository): ContentItem[] {
    return files.map(file => ({
      id: file.id,
      title: file.fileName || file.title || '未命名文件',
      description: file.description || '',
      url: file.url || file.link || '#',
      date: file.displayTime || file.createdAt || file.uploadDate || new Date().toISOString(),
      source: repository.folderName || '未知来源',
      type: this.mapFileTypeToContentType(repository.controlTarget),
      repositoryId: repository.id
    }));
  }

  // 映射文件类型到内容类型
  private mapFileTypeToContentType(controlTarget?: string): 'policy' | 'news' | 'data' | 'report' {
    switch (controlTarget) {
      case 'latest-policy':
        return 'policy';
      case 'hot-news':
        return 'news';
      case 'global-data':
        return 'data';
      case 'china-report':
        return 'report';
      default:
        return 'news';
    }
  }

  // 按显示顺序排序内容
  private sortContentByDisplayOrder(syncData: SyncData, repositories: Repository[]) {
    const repoOrderMap = new Map(
      repositories
        .filter(repo => repo.controlTarget && repo.displayOrder)
        .map(repo => [repo.controlTarget, repo.displayOrder])
    );

    // 按资料库的显示顺序排序内容
    Object.keys(syncData).forEach(key => {
      const controlTarget = key as keyof SyncData;
      const order = repoOrderMap.get(controlTarget);
      if (order !== undefined) {
        // 这里可以根据需要实现更复杂的排序逻辑
        console.log(`Content for ${controlTarget} will be displayed in order ${order}`);
      }
    });
  }

  // 获取默认内容（当资料库为空时使用）
  private getDefaultContent(): SyncData {
    return {
      latestPolicies: [
        {
          id: 'default-policy-1',
          title: '生态环境部发布《关于做好2025年碳排放权交易市场数据质量监督管理相关工作的通知》',
          date: '2025-07-18',
          source: '生态环境部',
          url: '#',
          type: 'policy',
          repositoryId: 'default'
        }
      ],
      hotNews: [
        {
          id: 'default-news-1',
          title: '全球碳市场发展趋势与中国碳市场建设研讨会在京召开',
          url: '#',
          type: 'news',
          repositoryId: 'default'
        }
      ],
      globalData: [
        {
          id: 'default-data-1',
          title: '2025年可再生能源容量统计数据（IRENA）',
          description: '本出版物以三种语言的表格形式提供了过去十年（2015-2024 年）可再生能源发电容量统计数据。',
          url: 'https://www.irena.org/Publications/2025/Mar/Renewable-capacity-statistics-2025',
          type: 'data',
          repositoryId: 'default'
        }
      ],
      chinaReports: [
        {
          id: 'default-report-1',
          title: '全国碳市场发展报告 2024',
          description: '生态环境部：全国碳市场覆盖 51 亿吨 CO₂，配额价格升至 78 元 / 吨',
          url: 'https://www.mee.gov.cn/ywdt/xwfb/202407/t20240722_1082192.shtml',
          type: 'report',
          repositoryId: 'default'
        }
      ]
    };
  }

  // 更新特定页面的内容
  async updatePageContent(pageType: keyof SyncData, content: ContentItem[]): Promise<void> {
    try {
      // 这里可以实现更复杂的更新逻辑，比如API调用
      console.log(`Updating ${pageType} content:`, content);
      
      // 暂时只记录到 localStorage，实际应用中可能需要调用API
      localStorage.setItem(`page_content_${pageType}`, JSON.stringify(content));
    } catch (error) {
      console.error(`Failed to update ${pageType} content:`, error);
    }
  }

  // 获取特定页面的内容
  async getPageContent(pageType: keyof SyncData): Promise<ContentItem[]> {
    try {
      const contentData = localStorage.getItem(`page_content_${pageType}`);
      if (contentData) {
        return JSON.parse(contentData);
      }
      
      // 如果没有缓存的内容，从资料库同步
      const syncData = await this.syncContentFromRepositories();
      return syncData[pageType] || [];
    } catch (error) {
      console.error(`Failed to get ${pageType} content:`, error);
      return [];
    }
  }

  // 专门获取数据洞察内容（对应repo_003）
  async getDataInsightContent(): Promise<ContentItem[]> {
    try {
      // 直接从repo_003获取文件
      const files = this.getRepositoryFiles('repo_003');
      const repository = {
        id: 'repo_003',
        folderName: '数据洞察',
        controlTarget: 'global-data'
      };
      
      return this.convertFilesToContentItems(files, repository as any);
    } catch (error) {
      console.error('Failed to get data insight content:', error);
      return [];
    }
  }

  // 更新文件显示时间
  async updateFileDisplayTime(repositoryId: string, fileId: string, displayTime: string): Promise<boolean> {
    try {
      const response = await fetch('/api/update-file-time', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          repositoryId,
          fileId,
          displayTime
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('更新文件显示时间失败:', errorData.error);
        return false;
      }

      const result = await response.json();
      console.log('文件显示时间更新成功:', result);
      return true;
    } catch (error) {
      console.error('更新文件显示时间失败:', error);
      return false;
    }
  }

  // 获取文件显示时间
  async getFileDisplayTime(repositoryId: string, fileId: string): Promise<string | null> {
    try {
      const response = await fetch(`/api/update-file-time?repositoryId=${repositoryId}&fileId=${fileId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('获取文件显示时间失败:', errorData.error);
        return null;
      }

      const result = await response.json();
      return result.data.displayTime;
    } catch (error) {
      console.error('获取文件显示时间失败:', error);
      return null;
    }
  }
}

export const contentSyncService = ContentSyncService.getInstance();

