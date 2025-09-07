import { 
  getRepositories, 
  createRepository, 
  updateRepository, 
  deleteRepository,
  getRepository,
  CreateRepositoryRequest,
  UpdateRepositoryRequest,
  Repository
} from '@/lib/api/resources';
import { 
  getFiles, 
  createFile, 
  updateFile, 
  deleteFile,
  CreateFileRequest,
  UpdateFileRequest,
  FileData
} from '@/lib/api/files';
import { enhancedAppTokenService } from '@/lib/services/enhanced-app-token-service';

// 本地资源库接口
export interface LocalRepository {
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
  controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
  displayOrder?: number;
  // 同步相关字段
  taleFolderId?: string; // Tale 平台文件夹 ID
  lastSyncTime?: string; // 最后同步时间
  syncStatus?: 'synced' | 'pending' | 'error'; // 同步状态
  syncError?: string; // 同步错误信息
}

// 同步结果接口
export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

// 资源同步服务
export class ResourceSyncService {
  private appKey: string;

  constructor(appKey: string) {
    this.appKey = appKey;
  }

  /**
   * 同步单个资源库到 Tale 平台
   */
  async syncRepositoryToTale(repository: LocalRepository): Promise<SyncResult> {
    try {
      console.log('🔄 开始同步资源库到 Tale 平台:', repository.folderName);

      // 检查资源库是否已经同步过
      if (repository.taleFolderId) {
        // 先验证远程资源库是否存在
        const exists = await this.verifyRepositoryExists(repository.taleFolderId);
        if (exists) {
          // 更新现有文件夹
          return await this.updateRepositoryInTale(repository);
        } else {
          console.log('⚠️ 远程资源库不存在，将检查是否有同名资源库');
          // 检查是否有同名资源库
          const existingRepo = await this.findRepositoryByName(repository.folderName);
          if (existingRepo) {
            console.log('✅ 找到同名资源库，将更新:', existingRepo.id);
            // 更新同名资源库
            return await this.updateRepositoryInTale({ ...repository, taleFolderId: existingRepo.id });
          } else {
            console.log('📝 没有同名资源库，将创建新资源库');
            // 清除无效的 taleFolderId，创建新资源库
            const repositoryWithoutTaleId = { ...repository, taleFolderId: undefined };
            return await this.createRepositoryInTale(repositoryWithoutTaleId);
          }
        }
      } else {
        // 检查是否有同名资源库
        const existingRepo = await this.findRepositoryByName(repository.folderName);
        if (existingRepo) {
          console.log('✅ 找到同名资源库，将更新:', existingRepo.id);
          // 更新同名资源库
          return await this.updateRepositoryInTale({ ...repository, taleFolderId: existingRepo.id });
        } else {
          console.log('📝 没有同名资源库，将创建新资源库');
          // 创建新的文件夹
          return await this.createRepositoryInTale(repository);
        }
      }
    } catch (error) {
      console.error('❌ 同步资源库失败:', error);
      return {
        success: false,
        message: '同步资源库失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 按名称查找远程资源库
   */
  private async findRepositoryByName(folderName: string): Promise<Repository | null> {
    try {
      console.log('🔍 按名称查找远程资源库:', folderName);
      
      // 获取所有远程资源库
      const allRepositories = await this.getAllTaleRepositories();
      console.log('📥 获取到远程资源库数量:', allRepositories.length);
      
      // 查找同名资源库
      const existingRepo = allRepositories.find(repo => repo.folderName === folderName);
      
      if (existingRepo) {
        console.log('✅ 找到同名资源库:', existingRepo.id, existingRepo.folderName);
        return existingRepo;
      } else {
        console.log('❌ 未找到同名资源库');
        return null;
      }
    } catch (error) {
      console.error('❌ 按名称查找资源库失败:', error);
      return null;
    }
  }

  /**
   * 验证远程资源库是否存在
   */
  private async verifyRepositoryExists(taleFolderId: string): Promise<boolean> {
    try {
      // 修复 Tale ID 格式：去掉 ug_ 前缀，确保是纯 UUID
      let actualTaleId = taleFolderId;
      if (actualTaleId.startsWith('ug_')) {
        actualTaleId = actualTaleId.substring(3);
        console.log(`🔧 验证时修复 Tale ID 格式: ${taleFolderId} -> ${actualTaleId}`);
      } else if (actualTaleId.startsWith('tale_')) {
        actualTaleId = actualTaleId.substring(5);
        console.log(`🔧 验证时修复 Tale ID 格式: ${taleFolderId} -> ${actualTaleId}`);
      }

      console.log('🔍 验证远程资源库是否存在:', actualTaleId);
      
      // 尝试获取资源库详情
      await getRepository(actualTaleId, this.appKey);
      console.log('✅ 远程资源库存在');
      return true;
    } catch (error) {
      console.log('❌ 远程资源库不存在或获取失败:', error);
      return false;
    }
  }

  /**
   * 在 Tale 平台创建资源库
   */
  private async createRepositoryInTale(repository: LocalRepository): Promise<SyncResult> {
    try {
      const repositoryData: CreateRepositoryRequest = {
        folderName: repository.folderName,
        folderType: repository.folderType,
        remark: repository.remark || `资源库：${repository.folderName}${repository.controlTarget ? `，控制目标：${this.getControlTargetName(repository.controlTarget)}` : ''}`,
        folderAttr: repository.folderAttr || {} // 确保 folderAttr 存在
      };

      console.log('📝 创建资源库数据:', repositoryData);
      console.log('🔑 使用 App Key:', this.appKey);

      const createdRepository = await createRepository(repositoryData, this.appKey);
      console.log('✅ 资源库创建成功:', createdRepository);

      return {
        success: true,
        message: `资源库 "${repository.folderName}" 已成功同步到 Tale 平台`,
        data: {
          taleFolderId: createdRepository.id,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced'
        }
      };
    } catch (error) {
      console.error('❌ 创建资源库失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '创建资源库失败';
      if (error instanceof Error) {
        if (error.message.includes('No app key provided')) {
          errorMessage = '缺少应用密钥，请检查配置';
        } else if (error.message.includes('No valid app token')) {
          errorMessage = '应用令牌无效或已过期，请重新获取';
        } else if (error.message.includes('HTTP error! status: 401')) {
          errorMessage = '认证失败，请检查应用密钥和令牌';
        } else if (error.message.includes('HTTP error! status: 403')) {
          errorMessage = '权限不足，请检查应用权限';
        } else if (error.message.includes('HTTP error! status: 400')) {
          errorMessage = '请求参数错误，请检查数据格式';
        } else if (error.message.includes('HTTP error! status: 500')) {
          errorMessage = '服务器内部错误，请稍后重试';
        } else {
          errorMessage = `创建资源库失败：${error.message}`;
        }
      }
      
      return {
        success: false,
        message: errorMessage,
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 在 Tale 平台更新资源库
   */
  private async updateRepositoryInTale(repository: LocalRepository): Promise<SyncResult> {
    try {
      if (!repository.taleFolderId) {
        throw new Error('资源库未关联 Tale 资源库');
      }

      // 修复 Tale ID 格式：去掉 ug_ 前缀，确保是纯 UUID
      let actualTaleId = repository.taleFolderId;
      if (actualTaleId.startsWith('ug_')) {
        actualTaleId = actualTaleId.substring(3);
        console.log(`🔧 修复 Tale ID 格式: ${repository.taleFolderId} -> ${actualTaleId}`);
      } else if (actualTaleId.startsWith('tale_')) {
        actualTaleId = actualTaleId.substring(5);
        console.log(`🔧 修复 Tale ID 格式: ${repository.taleFolderId} -> ${actualTaleId}`);
      }

      const repositoryData: UpdateRepositoryRequest = {
        folderName: repository.folderName,
        folderType: repository.folderType,
        remark: repository.remark || `资源库：${repository.folderName}${repository.controlTarget ? `，控制目标：${this.getControlTargetName(repository.controlTarget)}` : ''}`,
        folderAttr: repository.folderAttr || {} // 确保 folderAttr 存在
      };

      console.log('📝 更新资源库数据:', repositoryData);
      console.log('🔑 使用修复后的 Tale ID:', actualTaleId);

      const updatedRepository = await updateRepository(actualTaleId, repositoryData, this.appKey);
      console.log('✅ 资源库更新成功:', updatedRepository);

      return {
        success: true,
        message: `资源库 "${repository.folderName}" 已成功更新到 Tale 平台`,
        data: {
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced'
        }
      };
    } catch (error) {
      console.error('❌ 更新资源库失败:', error);
      return {
        success: false,
        message: '更新资源库失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 从 Tale 平台删除资源库
   */
  async deleteRepositoryFromTale(taleFolderId: string): Promise<SyncResult> {
    try {
      console.log('🗑️ 删除资源库:', taleFolderId);
      
      await deleteRepository(taleFolderId, this.appKey);
      
      return {
        success: true,
        message: '资源库已从 Tale 平台删除'
      };
    } catch (error) {
      console.error('❌ 删除资源库失败:', error);
      return {
        success: false,
        message: '删除资源库失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 批量同步所有资源库到 Tale 平台
   */
  async syncAllRepositoriesToTale(repositories: LocalRepository[]): Promise<SyncResult[]> {
    console.log('🔄 开始批量同步资源库，共', repositories.length, '个资源库');
    
    const results: SyncResult[] = [];
    
    for (const repository of repositories) {
      try {
        const result = await this.syncRepositoryToTale(repository);
        results.push(result);
        
        // 添加延迟避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('❌ 同步资源库失败:', repository.folderName, error);
        results.push({
          success: false,
          message: `同步资源库 "${repository.folderName}" 失败`,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 批量同步完成，成功 ${successCount}/${repositories.length} 个资源库`);
    
    return results;
  }

  /**
   * 从 Tale 平台拉取资源库信息到本地（仅用于检查一致性，不修改本地数据）
   */
  async pullRepositoriesFromTale(): Promise<SyncResult> {
    try {
      console.log('🔄 开始从 Tale 平台拉取资源库信息（仅检查）...');
      
      // 获取 Tale 平台的所有资源库
      const taleRepositories = await this.getAllTaleRepositories();
      console.log('📥 从 Tale 平台获取到', taleRepositories.length, '个资源库');
      
      // 转换 Tale 资源库为本地格式（仅用于比较）
      const pulledRepositories: LocalRepository[] = taleRepositories.map(repo => {
        const repositoryInfo = this.parseRepositoryInfoFromRepository(repo);
        
        return {
          id: `tale_${repo.id}`,
          folderName: repositoryInfo.folderName,
          folderType: repositoryInfo.folderType,
          folderAttr: repositoryInfo.folderAttr,
          remark: repositoryInfo.remark,
          createdAt: repo.createdAt || new Date().toISOString().split('T')[0],
          updatedAt: repo.updatedAt || new Date().toISOString().split('T')[0],
          supportedFileTypes: repositoryInfo.folderType,
          controlTarget: repositoryInfo.controlTarget,
          displayOrder: repositoryInfo.displayOrder,
          taleFolderId: repo.id,
          lastSyncTime: new Date().toISOString(),
          syncStatus: 'synced' as const
        };
      });
      
      console.log('✅ 成功拉取 Tale 平台资源库信息（仅用于检查）');
      
      return {
        success: true,
        message: `成功从 Tale 平台拉取 ${pulledRepositories.length} 个资源库（仅用于检查）`,
        data: {
          pulledRepositories: pulledRepositories.length,
          repositories: pulledRepositories
        }
      };
    } catch (error) {
      console.error('❌ 从 Tale 平台拉取资源库失败:', error);
      return {
        success: false,
        message: '从 Tale 平台拉取资源库失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 从 Tale 资源库信息中解析资源库信息
   */
  private parseRepositoryInfoFromRepository(repo: Repository): {
    folderName: string;
    folderType: string[];
    folderAttr?: { icon?: string; color?: string };
    remark: string;
    controlTarget?: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report';
    displayOrder?: number;
  } {
    // 默认值
    let folderName = repo.folderName;
    let folderType = repo.folderType || [];
    let folderAttr = repo.folderAttr;
    let remark = repo.remark || '';
    let controlTarget: 'latest-policy' | 'hot-news' | 'global-data' | 'china-report' | undefined;
    let displayOrder: number | undefined;
    
    // 从备注中解析控制目标
    if (repo.remark) {
      if (repo.remark.includes('最新政策') || repo.remark.includes('latest-policy')) {
        controlTarget = 'latest-policy';
      } else if (repo.remark.includes('热点新闻') || repo.remark.includes('hot-news')) {
        controlTarget = 'hot-news';
      } else if (repo.remark.includes('全球数据') || repo.remark.includes('global-data')) {
        controlTarget = 'global-data';
      } else if (repo.remark.includes('中国报告') || repo.remark.includes('china-report')) {
        controlTarget = 'china-report';
      }
    }
    
    return {
      folderName,
      folderType,
      folderAttr,
      remark,
      controlTarget,
      displayOrder
    };
  }

  /**
   * 合并本地和远程资源库数据
   */
  private mergeRepositories(localRepositories: LocalRepository[], pulledRepositories: LocalRepository[]): LocalRepository[] {
    const mergedMap = new Map<string, LocalRepository>();
    
    // 添加本地资源库
    localRepositories.forEach(repo => {
      mergedMap.set(repo.id, repo);
    });
    
    // 添加或更新远程资源库
    pulledRepositories.forEach(pulledRepo => {
      // 检查是否已存在相同的资源库（通过 taleFolderId 或名称匹配）
      const existingRepo = Array.from(mergedMap.values()).find(repo => 
        repo.taleFolderId === pulledRepo.taleFolderId || 
        (repo.folderName === pulledRepo.folderName && repo.controlTarget === pulledRepo.controlTarget)
      );
      
      if (existingRepo) {
        // 更新现有资源库的远程信息
        mergedMap.set(existingRepo.id, {
          ...existingRepo,
          taleFolderId: pulledRepo.taleFolderId,
          lastSyncTime: pulledRepo.lastSyncTime,
          syncStatus: 'synced'
        });
      } else {
        // 添加新的远程资源库
        mergedMap.set(pulledRepo.id, pulledRepo);
      }
    });
    
    return Array.from(mergedMap.values());
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
   * 从 Tale 平台获取所有资源库
   */
  private async getAllTaleRepositories(): Promise<Repository[]> {
    try {
      console.log('🔄 开始获取 Tale 平台资源库列表...');
      console.log('🔑 使用 App Key:', this.appKey);
      
      // 使用增强的认证服务
      const token = await enhancedAppTokenService.getValidAppToken(this.appKey);
      if (!token) {
        throw new Error('无法获取有效的认证令牌');
      }
      
      console.log('✅ 认证令牌获取成功，开始调用 API...');
      
      const response = await getRepositories({ page: 0, size: 1000 }, this.appKey);
      console.log('✅ 成功获取资源库列表:', response.data.content?.length || 0, '个资源库');
      
      return response.data.content || [];
    } catch (error) {
      console.error('❌ 获取资源库列表失败:', error);
      
      // 提供更详细的错误信息
      if (error instanceof Error) {
        if (error.message.includes('No app key provided')) {
          console.error('❌ 缺少应用密钥');
        } else if (error.message.includes('No valid app token')) {
          console.error('❌ 应用令牌无效或已过期');
        } else if (error.message.includes('HTTP error! status: 401')) {
          console.error('❌ 认证失败，请检查应用密钥和令牌');
        } else if (error.message.includes('HTTP error! status: 403')) {
          console.error('❌ 权限不足，请检查应用权限');
        } else {
          console.error('❌ 其他错误:', error.message);
        }
      }
      
      return [];
    }
  }

  /**
   * 获取本地资源库数据
   */
  private getLocalRepositories(): LocalRepository[] {
    try {
      const savedRepositories = localStorage.getItem('mockRepositories');
      if (savedRepositories) {
        return JSON.parse(savedRepositories);
      }
    } catch (error) {
      console.error('获取本地资源库数据失败:', error);
    }
    return [];
  }

  /**
   * 保存资源库数据到本地存储
   */
  private saveLocalRepositories(repositories: LocalRepository[]): void {
    try {
      localStorage.setItem('mockRepositories', JSON.stringify(repositories));
    } catch (error) {
      console.error('保存本地资源库数据失败:', error);
      throw error;
    }
  }

  /**
   * 同步本地资源库到 Tale 平台（以本地数据为准）
   */
  async syncBidirectional(): Promise<SyncResult> {
    try {
      console.log('🔄 开始同步本地资源库到 Tale 平台...');
      
      // 1. 推送本地资源库到 Tale 平台
      const localRepositories = this.getLocalRepositories();
      const pushResults = await this.syncAllRepositoriesToTale(localRepositories);
      
      // 2. 同步内容（文件）到远程资源库
      console.log('🔄 开始同步内容到远程资源库...');
      const contentSyncResults = await this.syncContentToTale(localRepositories);
      
      // 3. 检查 Tale 平台的数据（仅用于报告，不修改本地）
      const pullResult = await this.pullRepositoriesFromTale();
      
      const successCount = pushResults.filter(r => r.success).length;
      const totalCount = pushResults.length;
      const contentSuccessCount = contentSyncResults.filter(r => r.success).length;
      
      return {
        success: true,
        message: `同步完成：推送 ${successCount}/${totalCount} 个资源库到 Tale 平台，同步 ${contentSuccessCount}/${totalCount} 个资源库的内容，检查到 ${pullResult.data?.pulledRepositories || 0} 个远程资源库`,
        data: {
          pushResults,
          contentSyncResults,
          pullResult,
          totalRepositories: pullResult.data?.pulledRepositories || 0
        }
      };
    } catch (error) {
      console.error('❌ 同步失败:', error);
      return {
        success: false,
        message: '同步失败',
        error: error instanceof Error ? error.message : '未知错误'
      };
    }
  }

  /**
   * 同步内容（文件）到远程资源库
   */
  async syncContentToTale(repositories: LocalRepository[]): Promise<SyncResult[]> {
    console.log('🔄 开始同步内容到远程资源库，共', repositories.length, '个资源库');
    
    const results: SyncResult[] = [];
    
    for (const repository of repositories) {
      try {
        // 只同步有 taleFolderId 的资源库
        if (!repository.taleFolderId) {
          console.log('⚠️ 跳过没有 taleFolderId 的资源库:', repository.folderName);
          results.push({
            success: false,
            message: `资源库 "${repository.folderName}" 没有关联的远程 ID，跳过内容同步`,
            error: 'No taleFolderId'
          });
          continue;
        }

        // 修复 Tale ID 格式
        let actualTaleId = repository.taleFolderId;
        if (actualTaleId.startsWith('ug_')) {
          actualTaleId = actualTaleId.substring(3);
        } else if (actualTaleId.startsWith('tale_')) {
          actualTaleId = actualTaleId.substring(5);
        }

        console.log('📁 同步内容到资源库:', repository.folderName, 'ID:', actualTaleId);

        // 为每个资源库创建示例文件
        const fileResults = await this.createSampleFilesForRepository(actualTaleId, repository);
        
        const successCount = fileResults.filter(f => f.success).length;
        const totalCount = fileResults.length;
        
        results.push({
          success: successCount > 0,
          message: `成功创建 ${successCount}/${totalCount} 个文件`,
          data: {
            repository: repository.folderName,
            filesCreated: successCount,
            fileResults
          }
        });
        
        // 更新本地资源库同步状态
        if (successCount > 0) {
          this.updateLocalRepositorySyncStatus(repository.id, 'synced', new Date().toISOString());
        }
        
        // 添加延迟避免 API 限制
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        console.error('❌ 同步内容失败:', repository.folderName, error);
        results.push({
          success: false,
          message: `同步内容失败`,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 内容同步完成，成功 ${successCount}/${repositories.length} 个资源库`);
    
    return results;
  }

  /**
   * 同步本地文件到远程资源库（去重同步：检查重复，更新或创建）
   */
  private async createSampleFilesForRepository(taleFolderId: string, repository: LocalRepository): Promise<Array<{fileName: string; success: boolean; data?: any; error?: string}>> {
    const fileResults: Array<{fileName: string; success: boolean; data?: any; error?: string}> = [];
    
    // 获取本地存储的文件数据
    const localFiles = this.getLocalFiles(repository.id);
    console.log(`📁 找到 ${localFiles.length} 个本地文件需要同步`);
    
    if (localFiles.length === 0) {
      console.log('⚠️ 没有本地文件需要同步');
      return fileResults;
    }

    // 获取远程文件列表
    let remoteFiles: any[] = [];
    try {
      remoteFiles = await this.getRemoteFiles(taleFolderId);
      console.log(`📥 找到 ${remoteFiles.length} 个远程文件`);
    } catch (error) {
      console.log('⚠️ 获取远程文件失败，将直接创建文件:', error);
      remoteFiles = [];
    }
    
    // 同步每个本地文件到远程
    for (const localFile of localFiles) {
      try {
        // 处理文件名：限制长度和特殊字符
        const processedFileName = this.processFileName(localFile.fileName);
        
        // 检查远程是否已存在同名文件
        const existingFile = this.findMatchingRemoteFile(remoteFiles, localFile.fileName, processedFileName);
        
        if (existingFile) {
          // 删除现有文件，然后创建新文件（因为updateFile API不存在）
          console.log('🗑️ 删除现有文件:', processedFileName, 'ID:', existingFile.id);
          try {
            await deleteFile(existingFile.id, this.appKey);
            console.log('✅ 文件删除成功:', localFile.fileName);
          } catch (deleteError) {
            console.warn('⚠️ 文件删除失败，继续创建新文件:', deleteError);
          }
        }
        
        // 创建新文件（无论是替换还是新建）
        if (existingFile) {
          console.log('📄 重新创建文件:', localFile.fileName, '→', processedFileName);
        } else {
          console.log('📄 创建新文件:', localFile.fileName, '→', processedFileName);
        }
        
        const fileData: CreateFileRequest = {
          folderId: taleFolderId,
          fileName: processedFileName,
          fileType: localFile.fileType || 'LINK',
          linkUrl: localFile.url || localFile.linkUrl || `https://example.com/${encodeURIComponent(localFile.fileName)}`,
          remark: localFile.description || localFile.remark || `来自 ${repository.folderName} 的文件`
        };

        const createdFile = await createFile(fileData, this.appKey);
        
        fileResults.push({
          fileName: localFile.fileName,
          success: true,
          data: createdFile
        });
        
        console.log('✅ 文件创建成功:', localFile.fileName);
      } catch (error) {
        console.error('❌ 文件同步失败:', localFile.fileName, error);
        fileResults.push({
          fileName: localFile.fileName,
          success: false,
          error: error instanceof Error ? error.message : '未知错误'
        });
      }
    }
    
    return fileResults;
  }

  /**
   * 获取本地文件数据
   */
  private getLocalFiles(repositoryId: string): any[] {
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
   * 获取远程文件列表
   */
  private async getRemoteFiles(taleFolderId: string): Promise<any[]> {
    try {
      console.log('📥 获取远程文件列表:', taleFolderId);
      const response = await getFiles({ folderId: taleFolderId, page: 0, size: 1000 }, this.appKey);
      return response.data.content || [];
    } catch (error) {
      console.error('获取远程文件失败:', error);
      return [];
    }
  }

  /**
   * 查找匹配的远程文件
   */
  private findMatchingRemoteFile(remoteFiles: any[], originalFileName: string, processedFileName: string): any | null {
    console.log(`🔍 查找匹配文件: 原始="${originalFileName}", 处理="${processedFileName}"`);
    console.log(`📋 远程文件列表:`, remoteFiles.map(f => f.fileName));
    
    // 首先尝试精确匹配处理后的文件名
    let match = remoteFiles.find(remoteFile => 
      remoteFile.fileName === processedFileName
    );
    
    if (match) {
      console.log('🎯 精确匹配找到文件:', processedFileName);
      return match;
    }
    
    // 尝试匹配原始文件名
    match = remoteFiles.find(remoteFile => 
      remoteFile.fileName === originalFileName
    );
    
    if (match) {
      console.log('🎯 原始文件名匹配找到文件:', originalFileName);
      return match;
    }
    
    // 尝试部分匹配（包含关系）
    match = remoteFiles.find(remoteFile => {
      const remote = remoteFile.fileName;
      return remote.includes(originalFileName) || 
             originalFileName.includes(remote) ||
             remote.includes(processedFileName) ||
             processedFileName.includes(remote);
    });
    
    if (match) {
      console.log('🎯 部分匹配找到文件:', match.fileName);
      return match;
    }
    
    // 尝试模糊匹配（移除特殊字符后比较）
    const normalizedOriginal = this.normalizeFileName(originalFileName);
    const normalizedProcessed = this.normalizeFileName(processedFileName);
    
    match = remoteFiles.find(remoteFile => {
      const normalizedRemote = this.normalizeFileName(remoteFile.fileName);
      const isMatch = normalizedRemote === normalizedOriginal || 
             normalizedRemote === normalizedProcessed ||
             normalizedRemote.includes(normalizedOriginal) ||
             normalizedOriginal.includes(normalizedRemote);
      
      if (isMatch) {
        console.log(`🎯 模糊匹配: 远程="${normalizedRemote}" vs 原始="${normalizedOriginal}" vs 处理="${normalizedProcessed}"`);
      }
      
      return isMatch;
    });
    
    if (match) {
      console.log('🎯 模糊匹配找到文件:', match.fileName);
      return match;
    }
    
    console.log('❌ 未找到匹配的远程文件:', originalFileName);
    return null;
  }

  /**
   * 标准化文件名用于比较
   */
  private normalizeFileName(fileName: string): string {
    return fileName
      .toLowerCase()
      .replace(/[《》]/g, '')
      .replace(/[：:]/g, '')
      .replace(/[（）()]/g, '')
      .replace(/[！!]/g, '')
      .replace(/[，,。.、；;？?]/g, '')
      .replace(/[""'']/g, '')
      .replace(/[【】\[\]{}<>|\\/~`]/g, '')
      .replace(/\s+/g, '')
      .trim();
  }

  /**
   * 处理文件名：限制长度和特殊字符
   */
  private processFileName(fileName: string): string {
    // 更智能的文件名处理
    let processedName = fileName
      .replace(/[《》]/g, '') // 移除书名号
      .replace(/[：:]/g, ' - ') // 替换冒号为短横线
      .replace(/[（）()]/g, '') // 移除括号
      .replace(/[！!]/g, '') // 移除感叹号
      .replace(/[，,]/g, ' ') // 替换逗号为空格
      .replace(/[。.]/g, ' ') // 替换句号为空格
      .replace(/[、]/g, ' ') // 替换顿号为空格
      .replace(/[；;]/g, ' ') // 替换分号为空格
      .replace(/[？?]/g, ' ') // 替换问号为空格
      .replace(/[""'']/g, '') // 移除引号
      .replace(/[【】]/g, '') // 移除方括号
      .replace(/[\[\]]/g, '') // 移除英文方括号
      .replace(/[{}]/g, '') // 移除花括号
      .replace(/[<>]/g, '') // 移除尖括号
      .replace(/[|]/g, '') // 移除竖线
      .replace(/[\\/]/g, '') // 移除斜杠
      .replace(/[~`]/g, '') // 移除波浪号和反引号
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\s\-_]/g, '') // 只保留字母、数字、中文、空格、短横线、下划线
      .replace(/\s+/g, ' ') // 合并多个空格
      .trim();

    // 如果处理后的文件名太短，使用原始文件名的简化版本
    if (processedName.length < 5) {
      processedName = fileName
        .replace(/[《》]/g, '')
        .replace(/[：:]/g, ' - ')
        .replace(/[（）()]/g, '')
        .replace(/[！!]/g, '')
        .replace(/[，,。.、；;？?]/g, ' ')
        .replace(/[""'']/g, '')
        .replace(/[【】\[\]{}<>|\\/~`]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    // 限制长度（增加到50字符，更合理）
    const maxLength = 50;
    if (processedName.length > maxLength) {
      processedName = processedName.substring(0, maxLength - 3) + '...';
    }

    // 确保文件名不为空
    if (!processedName || processedName.length === 0) {
      processedName = '未命名文件_' + Date.now();
    }

    return processedName;
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
        console.log(`✅ 已更新资源库 ${repositoryId} 的同步状态为: ${syncStatus}`);
      }
    } catch (error) {
      console.error('更新本地资源库同步状态失败:', error);
    }
  }

  /**
   * 检查数据一致性
   */
  async checkDataConsistency(): Promise<{
    isConsistent: boolean;
    localCount: number;
    remoteCount: number;
    inconsistencies: string[];
  }> {
    try {
      const localRepositories = this.getLocalRepositories();
      const remoteRepositories = await this.getAllTaleRepositories();
      
      const inconsistencies: string[] = [];
      
      // 检查本地有但远程没有的资源库
      const localWithTaleId = localRepositories.filter(repo => repo.taleFolderId);
      const remoteRepositoryIds = new Set(remoteRepositories.map(r => r.id));
      
      localWithTaleId.forEach(repo => {
        if (repo.taleFolderId && !remoteRepositoryIds.has(repo.taleFolderId)) {
          inconsistencies.push(`本地资源库 "${repo.folderName}" 在远程不存在`);
        }
      });
      
      // 检查远程有但本地没有的资源库
      const localTaleIds = new Set(localRepositories.map(repo => repo.taleFolderId).filter(Boolean));
      
      remoteRepositories.forEach(repo => {
        if (!localTaleIds.has(repo.id)) {
          inconsistencies.push(`远程资源库 "${repo.folderName}" 在本地不存在`);
        }
      });
      
      return {
        isConsistent: inconsistencies.length === 0,
        localCount: localRepositories.length,
        remoteCount: remoteRepositories.length,
        inconsistencies
      };
    } catch (error) {
      console.error('检查数据一致性失败:', error);
      return {
        isConsistent: false,
        localCount: 0,
        remoteCount: 0,
        inconsistencies: ['检查失败：' + (error instanceof Error ? error.message : '未知错误')]
      };
    }
  }
}

// 创建默认实例
export const resourceSyncService = new ResourceSyncService('oa_HBamFxnA');
