"use client"

import { useEffect, useState, useRef } from "react"
import ModulesGrid from "@/components/home/ModulesGrid"
import Footer from "@/components/home/Footer"
import HomeHeader from "@/components/home/HomeHeader"
import { CourseCard } from "@/components/course/CourseCard"
import { experiments } from "@/lib/database"
import { getCourses } from "@/lib/courses"
import { HeroBanner } from "@/components/home/HeroBanner"
import Link from "next/link"
import Image from "next/image"
import { BookOpen, FileText, BarChart3, Globe, ArrowRight, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronUp } from "lucide-react"

// 获取模块背景样式
const getModuleBgClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "bg-emerald-50";
    case "carbon-calculate":
      return "bg-blue-50";
    case "carbon-trading":
      return "bg-purple-50";
    case "carbon-neutral":
      return "bg-orange-50";
    default:
      return "bg-gray-50";
  }
};

// 获取模块图标样式
const getModuleIconClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "text-emerald-600";
    case "carbon-calculate":
      return "text-blue-600";
    case "carbon-trading":
      return "text-purple-600";
    case "carbon-neutral":
      return "text-orange-600";
    default:
      return "text-gray-600";
  }
};

// 获取状态颜色
const getStatusColor = (status: string) => {
  switch (status) {
    case "开发中":
      return "bg-yellow-100 text-yellow-800";
    case "维护中":
      return "bg-blue-100 text-blue-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 获取难度颜色
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "基础":
      return "bg-green-100 text-green-800";
    case "中级":
      return "bg-blue-100 text-blue-800";
    case "高级":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

// 获取模块按钮样式
const getModuleButtonClass = (module: string) => {
  switch (module) {
    case "carbon-monitor":
      return "bg-gradient-to-r from-green-600 to-emerald-700";
    case "carbon-calculate":
      return "bg-gradient-to-r from-blue-600 to-indigo-700";
    case "carbon-trading":
      return "bg-gradient-to-r from-purple-600 to-violet-700";
    case "carbon-neutral":
      return "bg-gradient-to-r from-orange-600 to-amber-700";
    default:
      return "bg-gradient-to-r from-gray-600 to-gray-700";
  }
};

// 政策法规轮播数据
const policySlides = [
  {
    id: 1,
    image: "/中国碳市场大会.webp",
    title: "2024中国碳市场大会在汉开幕",
    description: "以\"深化碳市场交流合作，应对全球气候变化\"为主题。会上正式发布《全国碳市场发展报告（2024）》。"
  },
  {
    id: 2,
    image: "/国务院发布《碳排放权交易管理暂行条例》.webp",
    title: "国务院发布《碳排放权交易管理暂行条例》",
    description: "我国首部应对气候变化专门行政法规，构建全国碳市场法律框架，规范配额分配、交易、核查及数据管理，明确对数据造假行为的严惩措施。"
  },
  {
    id: 3,
    image: "/碳关税政策解读.webp",
    title: "碳关税政策解读",
    description: "2022年12月13日，欧盟理事会和欧洲议会经过第四次三方协商就碳边境调节机制（CBAM）法规的最终文本达成临时协议，将于2026年开始全面起征。"
  }
]

// 公开报告数据
const reports = [
  {
    id: 1,
    title: "世界能源投资报告 2025（IEA）",
    date: "2024-03-15",
    url: "https://www.iea.org/reports/world-energy-investment-2025"
  },
  {
    id: 2,
    title: "碳定价的现状和趋势2024（世界银行）",
    date: "2024-03-10",
    url: "https://openknowledge.worldbank.org/entities/publication/b0d66765-299c-4fb8-921f-61f6bb979087"
  },
  {
    id: 3,
    title: "碳金融产品创新与发展趋势",
    date: "2024-03-05",
    url: "/reports/carbon-finance-trends"
  }
]

// 公开数据
const datasets = [
  {
    id: 1,
    title: "中国统计年鉴（国家统计局）",
    updateTime: "2024-03-15",
    url: "https://www.stats.gov.cn/sj/ndsj/"
  },
  {
    id: 2,
    title: "中国碳核算数据库（CEADs）",
    updateTime: "2024-03-10",
    url: "https://www.ceads.net.cn/"
  },
  {
    id: 3,
    title: "碳价指数分析报告",
    updateTime: "2024-03-05",
    url: "/data/carbon-price-index"
  }
]

// 新版快讯区 mock 数据和组件
const newsCarouselData = [
  {
    img: "https://picsum.photos/800/400?random=1",
    tag: "重点新闻",
    tagColor: "bg-blue-600",
    title: "国家发改委发布《关于完善能源绿色低碳转型体制机制和政策措施的意见》",
    desc: "该意见提出了完善能源绿色低碳转型体制机制和政策措施的总体要求、主要任务和保障措施，为实现碳达峰碳中和目标提供了重要支撑。",
    date: "2025-07-15",
    source: "国家发改委",
    url: "#"
  },
  {
    img: "https://picsum.photos/800/400?random=2",
    tag: "政策解读",
    tagColor: "bg-green-500",
    title: "《碳排放权交易管理办法（试行）》修订版解读：新变化与企业应对策略",
    desc: "本文详细解读了《碳排放权交易管理办法（试行）》修订版的主要变化，分析了其对企业的影响，并提出了相应的应对策略。",
    date: "2025-07-10",
    source: "碳中和研究院",
    url: "#"
  }
]

const latestPolicies = [
  { title: "生态环境部发布《关于做好2025年碳排放权交易市场数据质量监督管理相关工作的通知》", date: "2025-07-18", source: "生态环境部", url: "#" },
  { title: "工信部：加快推进工业领域碳达峰碳中和，大力发展绿色制造", date: "2025-07-16", source: "工业和信息化部", url: "#" },
  { title: "财政部：加大对绿色低碳产业的财政支持力度，完善相关财税政策", date: "2025-07-12", source: "财政部", url: "#" },
  { title: "《中国碳达峰碳中和进展报告（2025）》正式发布", date: "2025-07-08", source: "国务院发展研究中心", url: "#" },
  { title: "国家能源局：2025年非化石能源占能源消费总量比重提高到18%左右", date: "2025-07-05", source: "国家能源局", url: "#" },
]
const hotNews = [
  { title: "全球碳市场发展趋势与中国碳市场建设研讨会在京召开", url: "#" },
  { title: "首批国家级绿色供应链管理企业名单公布，多家企业入选", url: "#" },
  { title: "全国碳市场上线交易一周年：累计成交额突破200亿元", url: "#" },
  { title: "中国首单绿色资产支持商业票据（ABCP）成功发行", url: "#" },
  { title: "多部门联合发布《关于促进新时代新能源高质量发展的实施方案》", url: "#" },
]
const reportCovers = [
  { img: "https://picsum.photos/300/400?random=3", title: "2025中国碳市场年度发展报告", date: "2025-06-30" },
  { img: "https://picsum.photos/300/400?random=4", title: "重点行业碳排放核算与报告指南", date: "2025-06-15" },
  { img: "https://picsum.photos/300/400?random=5", title: "企业碳中和路径与实践案例研究", date: "2025-05-28" },
  { img: "https://picsum.photos/300/400?random=6", title: "区域碳达峰碳中和实施路径研究", date: "2025-05-10" },
]
const dataCards = [
  { label: "全国碳市场", value: "2.15 亿吨", trend: "较上月增长 3.2%", bg: "bg-gradient-to-br from-blue-50 to-indigo-50", icon: <BarChart3 className="h-5 w-5" />, iconBg: "bg-blue-100", iconColor: "text-blue-600" },
  { label: "可再生能源", value: "42.8%", trend: "占比创新高", bg: "bg-gradient-to-br from-green-50 to-teal-50", icon: <Globe className="h-5 w-5" />, iconBg: "bg-green-100", iconColor: "text-green-600" },
  { label: "绿色债券", value: "8,765 亿元", trend: "同比增长 21.3%", bg: "bg-gradient-to-br from-orange-50 to-amber-50", icon: <FileText className="h-5 w-5" />, iconBg: "bg-amber-100", iconColor: "text-amber-500" },
  { label: "碳足迹认证", value: "1,243 家", trend: "新增 156 家", bg: "bg-gradient-to-br from-purple-50 to-pink-50", icon: <ChevronUp className="h-5 w-5" />, iconBg: "bg-purple-100", iconColor: "text-purple-500" },
]
const latestData = [
  { title: "2025年6月全国及各省区市能源生产情况", desc: "原煤、原油、天然气生产及发电情况", tag: "最新发布", date: "2025-07-18", source: "国家统计局", url: "#" },
  { title: "重点行业碳排放监测周报（7.10-7.16）", desc: "钢铁、电力、建材等行业碳排放数据", tag: "监测数据", date: "2025-07-17", source: "生态环境部", url: "#" },
  { title: "2025年第二季度中国碳价指数报告", desc: "全国及区域碳市场价格走势分析", tag: "研究报告", date: "2025-07-15", source: "清华大学能源环境经济研究所", url: "#" },
  { title: "中国绿色金融发展报告（2025年上半年）", desc: "绿色信贷、绿色债券、碳金融等发展情况", tag: "行业报告", date: "2025-07-10", source: "中国人民银行", url: "#" },
]

function NewsCarousel() {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    const timer = setInterval(() => setCurrent((prev) => (prev + 1) % newsCarouselData.length), 5000)
    return () => clearInterval(timer)
  }, [])
  return (
    <div className="lg:col-span-2 relative rounded-xl overflow-hidden shadow-md h-[400px]">
      {newsCarouselData.map((item, idx) => (
        <div key={idx} className={`carousel-item absolute inset-0 transition-opacity duration-1000 ${current === idx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}>
          <img src={item.img} alt={item.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
            <span className={`text-white text-xs px-3 py-1 rounded-full inline-block mb-3 w-fit ${item.tagColor}`}>{item.tag}</span>
            <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
            <p className="text-white/80 text-sm mb-3 line-clamp-2">{item.desc}</p>
            <div className="flex items-center text-white/60 text-xs">
              <span>{item.date}</span>
              <span className="mx-2">•</span>
              <span>{item.source}</span>
            </div>
          </div>
        </div>
      ))}
      {/* 指示器 */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
        {newsCarouselData.map((_, idx) => (
          <button key={idx} onClick={() => setCurrent(idx)} className={`w-3 h-3 rounded-full bg-white/50 cursor-pointer transition-all duration-300 ${current === idx ? 'w-8 bg-blue-600' : ''}`}></button>
        ))}
      </div>
      {/* 控制按钮 */}
      <button onClick={() => setCurrent((current - 1 + newsCarouselData.length) % newsCarouselData.length)} className="carousel-control prev absolute top-1/2 left-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-blue-600 transition-colors z-20">
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button onClick={() => setCurrent((current + 1) % newsCarouselData.length)} className="carousel-control next absolute top-1/2 right-4 -translate-y-1/2 w-10 h-10 rounded-full bg-black/30 text-white flex items-center justify-center hover:bg-blue-600 transition-colors z-20">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

export default function Home() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const [isHovering, setIsHovering] = useState(false)

  useEffect(() => {
    const mobileMenuButton = document.getElementById("mobile-menu-button")
    const mobileMenu = document.getElementById("mobile-menu")

    if (mobileMenuButton && mobileMenu) {
      mobileMenuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden")
      })
    }

    // Smooth scrolling
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        e.preventDefault();

        const href = anchor.getAttribute("href");
        if (href) {
          const element = document.querySelector(href);
          if (element) {
            element.scrollIntoView({ behavior: "smooth" });

            // Close mobile menu if open
            if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
              mobileMenu.classList.add("hidden");
            }
          }
        }
      });
    })

    // 获取课程数据
    async function fetchCourses() {
      setLoading(true);
      const coursesData = await getCourses();
      // 只显示已上线的课程，并且限制为4个
      const availableCourses = coursesData
        .filter(course => course.status !== "draft" && course.status !== "archived")
        .slice(0, 4);
      setCourses(availableCourses);
      setLoading(false);
    }

    fetchCourses();

    // 自动轮播
    if (!isHovering) {
      timerRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % policySlides.length)
      }, 5000)
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [isHovering])

  // 手动切换轮播
  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + policySlides.length) % policySlides.length)
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % policySlides.length)
  }

  const handleSlideClick = () => {
    switch (currentSlide) {
      case 0:
        window.open('https://www.wucea.com/news/5228.html', '_blank', 'noopener,noreferrer');
        break;
      case 1:
        window.open('https://mp.weixin.qq.com/s/M5QtJCSOg8dHemzRYu_mJQ', '_blank', 'noopener,noreferrer');
        break;
      case 2:
        window.open('https://ofdi.sww.sh.gov.cn/zcfg/19826.jhtml', '_blank', 'noopener,noreferrer');
        break;
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <HomeHeader />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-20 py-12">
        <HeroBanner />

        <ModulesGrid />

        <section id="courses" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">热门课程</h2>
          <p className="mb-8 text-gray-600">探索我们平台上的精选课程，每个课程都包含了系统化的学习路径和丰富的实践内容，帮助您从零开始掌握碳经济相关知识。</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="text-center">
                <div className="inline-block w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-muted-foreground">加载课程中...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {courses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </section>

        <section id="experiments" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">热门实验</h2>
          <p className="mb-8 text-gray-600">探索我们平台上的精选模拟实验，每个实验都提供了交互控制，让您能够调整参数，观察变化。更多实验可在各领域模块页面中找到。</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {experiments.map((experiment) => (
              <div
                key={experiment.id}
                className="card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg hover:translate-y-[-5px]"
              >
                <div className="h-48 overflow-hidden relative">
                  {experiment.image ? (
                    <img
                      src={experiment.image.startsWith('/') ? experiment.image : `/${experiment.image}`}
                      alt={experiment.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className={`h-full ${getModuleBgClass(experiment.module)} flex items-center justify-center`}>
                      {experiment.icon && <i className={`fas fa-${experiment.icon} text-6xl ${getModuleIconClass(experiment.module)}`}></i>}
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-semibold text-gray-800">{experiment.title}</h3>
                    <div className="flex items-center gap-2">
                      {experiment.status && (experiment.status === "开发中" || experiment.status === "维护中") && (
                        <span className={`text-xs font-medium ${getStatusColor(experiment.status)} px-2 py-1 rounded`}>
                          {experiment.status}
                        </span>
                      )}
                      <span className={`text-xs font-medium ${getDifficultyColor(experiment.difficulty)} px-2 py-1 rounded`}>
                        {experiment.difficulty}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600 mb-4">{experiment.description}</p>
                  <Link
                    href={experiment.route || '#'}
                    className={`inline-block ${getModuleButtonClass(experiment.module)} text-white font-medium px-4 py-2 rounded-lg transition duration-300 transform hover:scale-105`}
                  >
                    <BookOpen className="h-4 w-4 inline-block mr-2" />
                    开始实验
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>


        {/* 双碳快讯（新版） */}
        <section id="news" className="mb-12">
          {/* 双碳快讯板块 */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">双碳快讯</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* 左侧重点新闻轮播 */}
            <div className="lg:col-span-3">
              <NewsCarousel />
            </div>
            {/* 右侧政策新闻列表 */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 flex flex-col lg:h-[400px] lg:overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">最新政策</h3>
                <Link href="/news" className="text-blue-600 text-sm hover:underline">更多</Link>
              </div>
              <ul className="space-y-4">
                {latestPolicies.map((item, idx) => (
                  <li key={idx} className="pb-4 border-b border-gray-100">
                    <a href={item.url} className="transition-all duration-300 hover:text-blue-600 hover:underline">
                      <h4 className="font-medium mb-1">{item.title}</h4>
                      <div className="flex justify-between items-center text-xs text-gray-400">
                        <span>{item.date}</span>
                        <span>{item.source}</span>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
              <div className="flex justify-between items-center mt-8 mb-4">
                <h3 className="font-bold text-lg">热点新闻</h3>
                <Link href="/news" className="text-blue-600 text-sm hover:underline">更多</Link>
              </div>
              <ul className="space-y-3">
                {hotNews.map((item, idx) => (
                  <li key={idx}>
                    <a href={item.url} className="flex items-start transition-all duration-300 hover:text-blue-600 hover:underline">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${idx < 3 ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'} text-xs`}>{idx + 1}</span>
                      <span>{item.title}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {/* 数智洞察板块 */}
          <section id="insight" className="mt-12 mb-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">数智洞察</h2>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 左侧报告封面展示 */}
              <div className="lg:col-span-1 bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">研究报告</h3>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {reportCovers.map((report, idx) => (
                    <div key={idx} className="rounded-lg overflow-hidden shadow card-hover">
                      <div className="aspect-[3/4] bg-gray-100 relative">
                        <img src={report.img} alt={report.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button size="sm" className="bg-white text-blue-600 px-4 py-2 rounded-full text-sm font-medium">
                            <FileText className="mr-1 h-4 w-4" /> 下载
                          </Button>
                        </div>
                      </div>
                      <h4 className="mt-2 text-sm font-medium line-clamp-2">{report.title}</h4>
                      <p className="text-xs text-gray-400">{report.date}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Link href="/reports">
                    <Button variant="outline" className="border-green-500 text-green-600 rounded-full text-sm hover:bg-green-500 hover:text-white transition-colors px-4 py-2">
                      查看更多报告
                    </Button>
                  </Link>
                </div>
              </div>
              {/* 右侧数据条目 */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-lg">数据洞察</h3>
                  <Link href="/datasets" className="text-green-600 text-sm hover:underline">更多</Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {dataCards.map((card, idx) => {
                    return (
                      <div key={idx} className={`rounded-lg p-4 card-hover flex flex-col justify-center items-center ${card.bg}`}> 
                        <p className="text-gray-400 text-sm">{card.label}</p>
                        <h4 className="text-2xl font-bold mt-1">{card.value}</h4>
                        <p className="text-green-500 text-xs mt-1 flex items-center">
                          <ChevronUp className="mr-1 h-3 w-3" />{card.trend}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <div className="mb-6">
                  <h4 className="font-bold text-xl mb-4 flex items-center">
                    <BarChart3 className="text-green-600 mr-2 h-4 w-4" /> 最新数据发布
                  </h4>
                  <ul className="space-y-4">
                    {latestData.map((item, idx) => (
                      <li key={idx} className="pb-3 border-b border-gray-100">
                        <a href={item.url} className="flex justify-between items-start transition-all duration-300 hover:text-green-600 hover:underline">
                          <div>
                            <h5 className="font-medium">{item.title}</h5>
                            <p className="text-sm text-gray-400 mt-1">{item.desc}</p>
                          </div>
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">{item.tag}</span>
                        </a>
                        <div className="flex justify-between items-center mt-2 text-xs text-gray-400">
                          <span>{item.date}</span>
                          <span>{item.source}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                {/* 可选：数据可视化区，可后续补充 */}
              </div>
            </div>
          </section>
        </section>

        {/* 关于平台 */}
        <section id="about" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">平台资源</h2>

          {/* Hero 图片展示区域 */}
          <div className="mb-8 w-full aspect-[1510/780] relative overflow-hidden rounded-xl">
            <Image
              src="/hero-1.webp"
              alt="碳经济与管理AI实训平台"
              fill
              className="object-cover"
            />
          </div>

        </section>


        {/* 关于平台 */}
        <section id="about" className="mb-9">
          <h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-2">关于平台</h2>

          <div className="bg-white rounded-xl shadow-md p-6 md:p-8">
            <div className="md:flex gap-8">
              {/* 左侧图片展示区域 */}
              <div className="md:w-2/3">
                <div className="bg-gray-100 rounded-lg h-full min-h-[400px] relative overflow-hidden">
                  <Image
                    src="/hero-2.webp"
                    alt="平台展示图片"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>

              {/* 右侧内容区域 */}
              <div className="md:w-1/3 mt-6 md:mt-0 space-y-6">
                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">平台简介</h3>
                  <p className="text-gray-600 text-base leading-relaxed indent-8 text-justify">
                    为积极践行国家双碳战略，助力高校、行业机构、企业决策者提升"双碳"知识、能力和战略高度，设计涵盖应用场景、知识模块以及系统资源的碳经济与管理AI实训平台，加强学生对碳排放、碳交易、碳足迹等关键知识的理解和应用能力，推动教学内容的改革和教学创新。
                  </p>
                </div>

                <div className="bg-gray-50 p-6 rounded-lg border border-gray-100">
                  <h3 className="text-xl font-semibold mb-4 text-gray-800">平台优势</h3>
                  <ul className="space-y-3 text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      <span>从碳监测、核算、管理到碳市场、金融、规则，打造闭环式碳能力实训体系，培育市场急需的"双碳"精英人才。</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      <span>整合数字教材、真实案例、虚拟实验与AI智能助教，突破传统局限，支持按需组合的个性化教学与学习体验。</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="text-green-500 mt-1 mr-2 h-4 w-4 flex-shrink-0" />
                      <span>构建绿色交通、零碳园区等高仿真多元化场景，赋能学生跨学科应用能力，无缝对接产业真实挑战。</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}