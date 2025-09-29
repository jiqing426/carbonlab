"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Globe, Database, FileText, BarChart3, Search } from "lucide-react"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { useState, useEffect } from "react"

// 数据洞察接口
interface DatasetItem {
  title: string;
  url: string;
  description: string;
  fileType?: string;
  preview_image_url?: string | null;
  repositoryId?: string;
  id?: string;
}

interface DatasetCategory {
  id: string;
  title: string;
  icon: any;
  datasets: DatasetItem[];
}

// 数据源分类
const dataCategories: DatasetCategory[] = [
  {
    id: "insights",
    title: "数据洞察",
    icon: BarChart3,
    datasets: [] // 将通过API动态填充
  },
  {
    id: "global",
    title: "全球数据",
    icon: Globe,
    datasets: [
      {
        title: "2025年可再生能源容量统计数据（IRENA）",
        url: "https://www.irena.org/Publications/2025/Mar/Renewable-capacity-statistics-2025",
        description: "本出版物以三种语言的表格形式提供了过去十年（2015-2024 年）可再生能源发电容量统计数据。"
      },
      {
        title: "IEA 能源数据",
        url: "https://www.iea.org/data-and-statistics",
        description: "国际能源署提供的全球能源数据，包括碳排放、可再生能源等"
      },
      {
        title: "世界银行气候数据",
        url: "https://climateknowledgeportal.worldbank.org/",
        description: "世界银行提供的全球气候变化相关数据"
      },
      {
        title: "全球碳预算（Global Carbon Budget）",
        url: "https://www.globalcarbonproject.org/carbonbudget/",
        description: "提供全球及各国年度碳排放数据、碳汇信息"
      },
      {
        title: "联合国环境规划署（UNEP）",
        url: "https://www.unep.org/explore-topics/climate-action",
        description: "提供全球环境政策、碳排放趋势报告"
      },
      {
        title: "EDGAR（全球碳排放数据库）",
        url: "https://edgar.jrc.ec.europa.eu/",
        description: "欧盟委员会联合研究中心（JRC）开发的全球碳排放数据库"
      },
      {
        title: "CDP（全球企业碳排放披露平台）",
        url: "https://www.cdp.net/en",
        description: "提供企业碳排放、气候行动数据"
      },
      {
        title: "Our World in Data",
        url: "https://ourworldindata.org/co2-emissions",
        description: "全球碳排放与能源数据可视化"
      }
    ]
  },
  {
    id: "china",
    title: "中国数据",
    icon: Database,
    datasets: [
      {
        title: "中国碳核算数据库（CEADs）",
        url: "https://www.ceads.net/",
        description: "中国多尺度碳排放核算数据库，涵盖省份、行业、企业数据"
      },
      {
        title: "国家统计局",
        url: "http://www.stats.gov.cn/",
        description: "提供中国能源消费、工业产值等基础数据"
      },
      {
        title: "中国能源统计年鉴",
        url: "http://www.stats.gov.cn/tjsj/ndsj/",
        description: "可下载历年能源消费数据"
      },
      {
        title: "生态环境部",
        url: "https://www.mee.gov.cn/",
        description: "发布全国碳市场政策、企业排放数据"
      },
      {
        title: "中国电力企业联合会",
        url: "http://www.cec.org.cn/",
        description: "提供电力行业碳排放、可再生能源数据"
      },
      {
        title: "清华大学中国碳市场研究中心",
        url: "http://www.rcets.org/",
        description: "研究中国碳市场、碳定价政策"
      },
      {
        title: "万得（Wind）金融数据库",
        url: "https://www.wind.com.cn/",
        description: "提供中国上市公司碳排放、ESG数据（需订阅）"
      },
      {
        title: "碳交易网",
        url: "http://www.tanjiaoyi.com/",
        description: "提供中国碳市场交易数据、政策分析"
      }
    ]
  },
  {
    id: "tools",
    title: "数据工具",
    icon: Search,
    datasets: [
      {
        title: "Google Dataset Search",
        url: "https://datasetsearch.research.google.com/",
        description: "可搜索全球公开的双碳相关数据集"
      },
      {
        title: "GitHub 开源数据项目",
        url: "https://github.com/topics/carbon-emissions",
        description: "例如：Open Power System Data（欧洲电力数据）"
      }
    ]
  }
]

export default function DatasetsPage() {
  const [dynamicDataCategories, setDynamicDataCategories] = useState<DatasetCategory[]>(dataCategories);
  const [loading, setLoading] = useState(true);

  // 从资料库加载数据洞察数据
  useEffect(() => {
    const loadDatasets = async () => {
      try {
        // 动态导入内容同步服务
        const { contentSyncService } = await import('@/lib/services/content-sync-service');

        // 获取数据洞察内容
        const insights = await contentSyncService.getDataInsightContent();

        if (insights.length > 0) {
          // 更新数据洞察分类的数据
          const updatedCategories = dataCategories.map(category => {
            if (category.id === 'insights') {
              return {
                ...category,
                datasets: insights.map(insight => ({
                  title: insight.title,
                  url: insight.url || `/admin/libraries/${insight.repositoryId}/files/${insight.id}/viewer`,
                  description: insight.description || '暂无描述',
                  fileType: insight.fileType,
                  preview_image_url: insight.preview_image_url || null,
                  repositoryId: insight.repositoryId,
                  id: insight.id
                }))
              };
            }
            return category;
          });
          setDynamicDataCategories(updatedCategories);
        }
      } catch (error) {
        console.error('Failed to load datasets:', error);
        // 保持默认数据
      } finally {
        setLoading(false);
      }
    };

    loadDatasets();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-20 py-12">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-20 py-12">
      {/* 面包屑导航 */}
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/" className="text-gray-600 hover:text-gray-900">首页</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="text-gray-400" />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-gray-900">碳排放数据资源</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 顶部 Banner */}
      <div className="relative w-full mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-green-100 via-white to-blue-100 p-8 flex flex-col md:flex-row items-center gap-6 shadow">
          <BarChart3 className="h-14 w-14 text-blue-700 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">碳排放数据资源</h1>
            <p className="text-lg text-gray-700">权威碳排放与能源数据集，支持科研、教学与政策分析，助力双碳目标实现。</p>
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {dynamicDataCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-blue-900" />
                <CardTitle className="text-2xl text-blue-900 font-bold">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {category.datasets.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>暂无数据</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.datasets.map((dataset, index) => (
                    <div
                      key={index}
                      onClick={(e) => {
                        e.preventDefault();
                        if (dataset.url && dataset.url.startsWith('http')) {
                          window.open(dataset.url, '_blank');
                        } else if (dataset.url) {
                          window.open(dataset.url, '_blank');
                        }
                      }}
                      className="block rounded-lg border hover:bg-gray-50 transition-colors cursor-pointer overflow-hidden shadow-sm hover:shadow-md"
                    >
                    {/* 封面图片区域 */}
                    {dataset.preview_image_url && (
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img
                          src={dataset.preview_image_url}
                          alt={dataset.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button type="button" className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                            <FileText className="mr-1 h-4 w-4 inline" /> 查看数据
                          </button>
                        </div>
                      </div>
                    )}
                    {/* 内容区域 */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2">{dataset.title}</h3>
                      <p className="text-sm text-gray-600 line-clamp-3">{dataset.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 