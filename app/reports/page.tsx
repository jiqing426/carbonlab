"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator
} from "@/components/ui/breadcrumb"
import Link from "next/link"
import { Globe, Database, Search, FileText } from "lucide-react"

// 报告数据分类
const reportCategories = [
  {
    id: "international",
    title: "国际报告",
    icon: Globe,
    datasets: [
      {
        title: "世界能源投资报告 2025",
        url: "https://www.iea.org/reports/world-energy-investment-2025",
        description: "国际能源署（IEA）：全球能源投资达 3.3 万亿美元，清洁能源投资首次翻倍于化石燃料"
      },
      {
        title: "碳定价的现状和趋势 2024",
        url: "https://www.shihang.org/zh/news/press-release/2024/05/21/global-carbon-pricing-revenues-top-a-record-100-billion",
        description: "世界银行：全球碳定价收入突破 1040 亿美元，覆盖 24% 全球排放量"
      },
      {
        title: "关于推进气候政策“公正转型”",
        url: "https://unfccc.int/news/un-climate-change-launches-new-report-on-advancing-a-just-transition-in-climate-policy",
        description: "联合国气候变化框架公约（UNFCCC）：提出四维监测框架，确保低碳转型中就业、性别、区域等多维度公平"
      },
      {
        title: "2023 年 ICAP 全球碳市场进展报告",
        url: "https://icapcarbonaction.com/zh/publications/2023-nian-icap-quanqiutanshichangjinzhanbaogao",
        description: "国际碳行动伙伴组织（ICAP）：全球碳市场拍卖收入达 630 亿美元，新增 3 个碳市场"
      },
      {
        title: "2025年能源进展报告",
        url: "https://www.irena.org/Publications/2025/Jun/Tracking-SDG-7-The-Energy-Progress-Report-2025",
        description: "国际可再生能源署（IRENA）：2023年相关指标有一定进步但仍存差距，6.66亿人缺电"
      },
      {
        title: "中国低碳城市发展：全球百余城市评估结果",
        url: "https://www.wri.org/research/low-carbon-city-development-china-evaluation-results-more-100-cities-around-world",
        description: "世界资源研究所（WRI）：从四维度构建15项指标评估体系评估世界城市低碳发展情况，前三名为中国城市"
      },
      {
        title: "首席财务官在推动低碳转型中的作用",
        url: "https://www.climatebonds.net/data-insights/publications/role-chief-financial-officer-driving-low-carbon-transition",
        description: "气候债券倡议组织（CBI）：对总市值 9300 亿美元的 30 多位首席财务官的访谈"
      },
      {
        title: "碳市场在促进碳中和中的作用",
        url: "https://www.adb.org/publications/the-role-of-carbon-markets-in-facilitating-carbon-neutrality",
        description: "亚洲开发银行（ADB）：碳信用质量参差不齐，亚洲需促进碳信用和市场互操作性，要求企业了解碳信用相关框架。"
      }
    ]
  },
  {
    id: "china",
    title: "中国报告",
    icon: Database,
    datasets: [
      {
        title: "全国碳市场发展报告 2024",
        url: "https://www.mee.gov.cn/ywdt/xwfb/202407/t20240722_1082192.shtml",
        description: "生态环境部：全国碳市场覆盖 51 亿吨 CO₂，配额价格升至 78 元 / 吨"
      },
      {
        title: "广东省碳市场发展报告 2024",
        url: "https://gdee.gd.gov.cn/ydqhbh/xwdt/content/post_4499898.html",
        description: "广东省生态环境厅：广东碳市场累计成交 4.15 亿吨，碳普惠用户突破 100 万"
      },
      {
        title: "北京市生态环境状况公报 2024",
        url: "https://sthjj.beijing.gov.cn/bjhrb/index/xxgk69/zfxxgk43/fdzdgknr2/ywdt28/xwfb/743619512/index.html",
        description: "北京市生态环境局：PM2.5 浓度 30.5 微克 / 立方米，万元 GDP 碳排放全国最优"
      },
      {
        title: "上海市碳市场十周年评估报告",
        url: "https://sthj.sh.gov.cn/hbzhywpt1272/hbzhywpt1158/20240726/3fbbddcbd80149b18418a85baa3a62b2.html",
        description: "上海市生态环境局：上海碳市场累计成交 2.49 亿吨，配额价格稳中有升"
      },
      {
        title: "湖北省碳市场发展报告 2024",
        url: "https://sthjt.hubei.gov.cn/hjsj/ztzl/qsydwxxgk/hbgg/202503/t20250318_5579829.shtml",
        description: "湖北省生态环境厅：湖北碳市场成交额突破百亿元，中碳登服务全国"
      },
      {
        title: "全国碳市场配额分配方案（2023-2024）",
        url: "https://www.mee.gov.cn/zcwj/zcjd/202410/t20241021_1089825.shtml",
        description: "生态环境部：钢铁、水泥行业纳入全国碳市场，基准值下降 15%"
      },
      {
        title: "深圳市应对气候变化白皮书",
        url: "https://meeb.sz.gov.cn/ztfw/ztzl/ydqhbh/qhsy/content/post_12250687.html",
        description: "深圳市生态环境局：2024 年深圳清洁能源装机占比超 80%、新能源汽车渗透率 76.9%，碳市场累计成交 1.08 亿吨"
      },
      {
        title: "成渝地区双城经济圈碳达峰碳中和联合行动方案",
        url: "https://mp.weixin.qq.com/s/FHfLB0tOSp_eKENy82GU7w",
        description: "重庆市人民政府、四川省人民政府：建立跨区域碳配额互认机制，年交易规模目标 50 亿元"
      }
    ]
  },
]

const reportSites = [
  {
    title: "国际碳行动伙伴组织（ICAP）报告库",
    url: "https://icapcarbonaction.com/zh",
    description: "全球碳市场动态跟踪，提供各国碳定价机制深度分析"
  },
  {
    title: "世界银行碳定价门户网站",
    url: "https://carbonpricingdashboard.worldbank.org/",
    description: "涵盖 75 个碳定价机制数据库，提供收入使用情况可视化工具"
  },
  {
    title: "中国碳市场网",
    url: "http://www.tanjiaoyi.com/",
    description: "全国碳市场官方信息发布平台，提供配额分配、交易数据查询"
  },
  {
    title: "清华大学碳中和研究院",
    url: "https://www.icon.tsinghua.edu.cn/",
    description: "发布《全球碳中和年度进展报告》，提供区域碳市场深度研究"
  },
  {
    title: "国际能源署（IEA）能源报告中心",
    url: "https://www.iea.org/analysis?type=report",
    description: "涵盖能源投资、可再生能源、氢能等领域的年度旗舰报告"
  },
  {
    title: "联合国气候变化框架公约（UNFCCC）图书馆",
    url: "https://unfccc.int/zh",
    description: "收录 COP 会议成果文件、全球碳信用机制标准等权威文档"
  },
  {
    title: "彭博新能源财经（BNEF）报告库",
    url: "https://about.bnef.com/",
    description: "全球能源转型投资趋势分析，提供清洁能源技术成本预测"
  }
]

export default function ReportsPage() {
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
            <BreadcrumbPage className="text-gray-900">双碳公开报告资源库</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {/* 顶部 Banner */}
      <div className="relative w-full mb-8">
        <div className="rounded-2xl bg-gradient-to-r from-blue-100 via-white to-green-100 p-8 flex flex-col md:flex-row items-center gap-6 shadow">
          <FileText className="h-14 w-14 text-blue-700 mr-4" />
          <div>
            <h1 className="text-4xl font-bold text-blue-900 mb-2">双碳公开报告资源库</h1>
            <p className="text-lg text-gray-700">精选全球与中国权威碳中和、碳市场、能源转型等报告，助力学术研究与政策决策。</p>
          </div>
        </div>
      </div>
      <div className="space-y-10">
        {reportCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader className="bg-gray-50 border-b">
              <div className="flex items-center gap-2">
                <category.icon className="h-5 w-5 text-blue-900" />
                <CardTitle className="text-2xl text-blue-900 font-bold">{category.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid gap-4">
                {category.datasets.map((report, index) => (
                  <a
                    key={index}
                    href={report.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">{report.title}</h3>
                    <p className="text-sm text-gray-600">{report.description}</p>
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {/* 专业报告网站区 */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gray-50 border-b">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-900" />
              <CardTitle className="text-2xl text-blue-900 font-bold">专业报告网站</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid gap-4">
              {reportSites.map((site, index) => (
                <a
                  key={index}
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <h3 className="font-bold text-lg md:text-xl text-gray-900 mb-1">{site.title}</h3>
                  <p className="text-sm text-gray-600">{site.description}</p>
                </a>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 