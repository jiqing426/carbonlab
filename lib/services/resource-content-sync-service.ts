import { appTokenService } from '@/lib/services/app-token-service';
import { 
  getRepositories, 
  createRepository, 
  updateRepository, 
  deleteRepository,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  Repository
} from '@/lib/api/resources';

// 本地资源库接口
interface LocalRepository {
  id: string;
  folderName: string;
  folderType: string[];
  remark: string;
  createdAt: string;
  updatedAt: string;
  supportedFileTypes: string[];
  controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
  displayOrder?: number;
  taleFolderId?: string;
  lastSyncTime?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  syncError?: string;
}

// 本地文件接口
interface LocalFile {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadTime: string;
  uploader: string;
  description?: string;
  url?: string;
  displayTime?: string;
  repositoryId: string;
  createdAt: string;
  updatedAt: string;
}

// 同步结果接口
interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 资源库内容同步服务
export class ResourceContentSyncService {
  private appKey: string;

  constructor() {
    this.appKey = process.env.NEXT_PUBLIC_APP_KEY || 'oa_HBamFxnA';
  }

  /**
   * 同步资源库内容到 Tale 平台
   * 将本地资源库的详细内容（包括文件列表）同步到对应的 Tale 平台资源库
   */
  async syncRepositoryContentToTale(repositoryId: string, taleRepositoryId: string): Promise<SyncResult> {
    try {
      console.log(`🔄 开始同步资源库内容: ${repositoryId} → ${taleRepositoryId}`);
      
      // 获取本地资源库数据
      const repository = this.getLocalRepository(repositoryId);
      if (!repository) {
        return {
          success: false,
          message: '本地资源库不存在'
        };
      }

      // 获取本地文件数据
      const files = this.getLocalFiles(repositoryId);
      console.log(`📁 找到 ${files.length} 个文件需要同步`);

      // 更新 Tale 平台资源库信息，包含文件内容
      const repositoryData: UpdateRepositoryRequest = {
        folderName: repository.folderName,
        folderType: repository.folderType,
        remark: this.formatRepositoryContentForTale(repository, files),
        folderAttr: repository.folderAttr || {}
      };

      console.log('📝 更新资源库内容数据:', repositoryData);
      const updatedRepository = await updateRepository(taleRepositoryId, repositoryData, this.appKey);
      console.log('✅ 资源库内容更新成功:', updatedRepository);

      // 更新本地同步状态
      this.updateLocalRepositorySyncStatus(repositoryId, 'synced', new Date().toISOString());

      return {
        success: true,
        message: `资源库 "${repository.folderName}" 内容已成功同步到 Tale 平台`,
        data: {
          taleRepositoryId,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced',
          filesCount: files.length
        }
      };
    } catch (error) {
      console.error('❌ 同步资源库内容失败:', error);
      
      // 更新同步状态为错误
      this.updateLocalRepositorySyncStatus(repositoryId, 'error', undefined, error instanceof Error ? error.message : '未知错误');
      
      return {
        success: false,
        message: '同步资源库内容失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量同步所有资源库内容到对应的 Tale 平台资源库
   */
  async syncAllRepositoryContentsToTale(): Promise<SyncResult[]> {
    try {
      console.log('🔄 开始批量同步所有资源库内容...');
      
      // 定义映射关系
      const repositoryMappings = {
        'repo_001': 'd403aaf6-1886-49d7-8bbb-ad58ecc17d84',
        'repo_002': 'f94682dc-44ba-483b-a192-8b43fab2fef8',
        'repo_003': '7ed0539a-e5d5-4406-904b-65e52a74f7f0',
        'repo_004': '948890a3-8022-41bc-aea5-b24db275ac11'
      };

      const results: SyncResult[] = [];

      for (const [localId, taleId] of Object.entries(repositoryMappings)) {
        console.log(`📦 同步资源库内容: ${localId} → ${taleId}`);
        const result = await this.syncRepositoryContentToTale(localId, taleId);
        results.push(result);
        
        // 添加延迟避免请求过快
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      const successCount = results.filter(r => r.success).length;
      console.log(`✅ 批量同步完成: ${successCount}/${Object.keys(repositoryMappings).length} 个资源库内容同步成功`);

      return results;
    } catch (error) {
      console.error('❌ 批量同步失败:', error);
      return [{
        success: false,
        message: '批量同步失败',
        error: error instanceof Error ? error.message : '未知错误'
      }];
    }
  }

  /**
   * 格式化资源库内容用于 Tale 平台
   */
  private formatRepositoryContentForTale(repository: LocalRepository, files: LocalFile[]): string {
    const content = [];
    
    // 基本信息
    content.push(`资源库：${repository.folderName}`);
    if (repository.controlTarget) {
      content.push(`控制目标：${this.getControlTargetName(repository.controlTarget)}`);
    }
    content.push(`文件类型：${repository.folderType.join(', ')}`);
    content.push(`文件数量：${files.length}`);
    
    // 文件列表
    if (files.length > 0) {
      content.push('');
      content.push('文件列表：');
      files.forEach((file, index) => {
        const displayTime = file.displayTime ? ` (${file.displayTime})` : '';
        const description = file.description ? ` - ${file.description}` : '';
        content.push(`${index + 1}. ${file.fileName}${displayTime}${description}`);
      });
    }
    
    return content.join('\n');
  }

  /**
   * 获取本地资源库数据
   */
  private getLocalRepository(repositoryId: string): LocalRepository | null {
    try {
      const savedRepos = localStorage.getItem('mockRepositories');
      if (!savedRepos) return null;

      const repositories = JSON.parse(savedRepos);
      return repositories.find((repo: LocalRepository) => repo.id === repositoryId) || null;
    } catch (error) {
      console.error('获取本地资源库失败:', error);
      return null;
    }
  }

  /**
   * 获取本地文件数据
   */
  private getLocalFiles(repositoryId: string): LocalFile[] {
    try {
      const savedFiles = localStorage.getItem(`files_${repositoryId}`);
      if (!savedFiles) return [];

      return JSON.parse(savedFiles);
    } catch (error) {
      console.error('获取本地文件失败:', error);
      return [];
    }
  }

  /**
   * 更新本地资源库同步状态
   */
  private updateLocalRepositorySyncStatus(repositoryId: string, syncStatus: 'synced' | 'pending' | 'error', lastSyncTime?: string, syncError?: string): void {
    try {
      const savedRepos = localStorage.getItem('mockRepositories');
      if (!savedRepos) return;

      const repositories = JSON.parse(savedRepos);
      const repoIndex = repositories.findIndex((repo: LocalRepository) => repo.id === repositoryId);
      
      if (repoIndex !== -1) {
        repositories[repoIndex].syncStatus = syncStatus;
        if (lastSyncTime) {
          repositories[repoIndex].lastSyncTime = lastSyncTime;
        }
        if (syncError) {
          repositories[repoIndex].syncError = syncError;
        }
        localStorage.setItem('mockRepositories', JSON.stringify(repositories));
      }
    } catch (error) {
      console.error('更新本地资源库同步状态失败:', error);
    }
  }

  /**
   * 获取控制目标名称
   */
  private getControlTargetName(controlTarget: string): string {
    const targetNames: Record<string, string> = {
      'latest-policy': '最新政策',
      'hot-news': '热点新闻',
      'global-data': '全球数据',
      'china-report': '中国报告'
    };
    return targetNames[controlTarget] || controlTarget;
  }

  /**
   * 检查 Tale 平台资源库是否存在
   */
  async checkTaleRepositoryExists(taleRepositoryId: string): Promise<boolean> {
    try {
      const repositories = await getRepositories({ page: 0, size: 1000 }, this.appKey);
      return repositories.data.content?.some(repo => repo.id === taleRepositoryId) || false;
    } catch (error) {
      console.error('检查 Tale 资源库存在性失败:', error);
      return false;
    }
  }
}

// 导出单例实例
export const resourceContentSyncService = new ResourceContentSyncService();

