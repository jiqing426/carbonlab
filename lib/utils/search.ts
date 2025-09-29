// 搜索数据类型定义
export interface SearchItem {
  id: number
  title: string
  description: string
  type: 'course' | 'experiment' | 'article' | 'news' | 'dataset'
  url: string
  tags: string[]
  keywords?: string[] // 新增关键词字段，用于分词搜索
}

// 搜索数据库
export const searchDatabase: SearchItem[] = [
  {
    id: 1,
    title: "碳中和预测实验",
    description: "基于机器学习的碳中和路径预测与情景分析实验",
    type: "experiment",
    url: "/experiments/global-carbon-neutral-prediction",
    tags: ["碳中和", "预测", "机器学习", "情景分析"],
    keywords: ["碳中和", "预测", "机器学习", "情景分析", "碳减排", "路径规划"]
  },
  {
    id: 2,
    title: "碳监测与计量分析实验",
    description: "企业碳监测技术应用与碳排放计量分析方法实验",
    type: "experiment",
    url: "/experiments/carbon-monitoring-analysis",
    tags: ["碳监测", "计量", "分析", "企业碳管理"],
    keywords: ["碳监测", "计量", "分析", "企业", "碳管理", "排放", "监测技术"]
  },
    {
    id: 4,
    title: "碳交易模拟实验",
    description: "碳市场交易机制与策略模拟实验",
    type: "experiment",
    url: "/experiments/carbon-trading-simulation",
    tags: ["碳交易", "模拟", "市场机制"],
    keywords: ["碳交易", "模拟", "市场", "机制", "策略", "交易平台"]
  },
  {
    id: 5,
    title: "碳金融产品设计实验",
    description: "碳金融产品创新设计与风险管理实验",
    type: "experiment",
    url: "/experiments/carbon-financial-product-design",
    tags: ["碳金融", "产品设计", "风险管理"],
    keywords: ["碳金融", "产品", "设计", "风险", "管理", "创新"]
  },
  {
    id: 6,
    title: "项目碳精算实验",
    description: "工程项目碳排放精算与成本效益分析实验",
    type: "experiment",
    url: "/experiments/project-carbon-calculation",
    tags: ["项目碳精算", "成本效益", "工程"],
    keywords: ["项目", "碳精算", "成本", "效益", "工程", "分析"]
  },
  {
    id: 7,
    title: "碳中和预测实验省份相关数据",
    description: "中国各省份碳排放数据与预测分析数据集",
    type: "dataset",
    url: "/datasets",
    tags: ["省份数据", "碳排放", "预测分析"],
    keywords: ["省份", "数据", "碳排放", "预测", "分析", "中国", "地区"]
  },
  {
    id: 8,
    title: "碳监测技术发展趋势",
    description: "碳监测技术最新发展趋势与应用前景分析",
    type: "article",
    url: "/news",
    tags: ["碳监测", "技术趋势", "应用前景"],
    keywords: ["碳监测", "技术", "趋势", "应用", "前景", "发展", "创新"]
  },
  {
    id: 9,
    title: "碳足迹核算标准解读",
    description: "国际碳足迹核算标准与国内实施指南",
    type: "article",
    url: "/news",
    tags: ["碳足迹", "核算标准", "国际标准"],
    keywords: ["碳足迹", "核算", "标准", "国际", "实施", "指南", "规范"]
  }
]

// 自定义中文分词函数
function simpleChineseSegment(text: string): string[] {
  const words: string[] = []
  let currentWord = ''
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    
    // 检查是否是中文字符
    if (/[\u4e00-\u9fa5]/.test(char)) {
      currentWord += char
    } else {
      // 非中文字符，保存当前词并重置
      if (currentWord) {
        words.push(currentWord)
        currentWord = ''
      }
      
      // 处理英文单词
      if (/[a-zA-Z]/.test(char)) {
        let englishWord = char
        while (i + 1 < text.length && /[a-zA-Z]/.test(text[i + 1])) {
          englishWord += text[i + 1]
          i++
        }
        words.push(englishWord.toLowerCase())
      }
    }
  }
  
  // 保存最后一个中文词
  if (currentWord) {
    words.push(currentWord)
  }
  
  return words
}

// 智能分词搜索函数
export function searchWithSmartSegment(query: string, items: SearchItem[] = searchDatabase): SearchItem[] {
  if (!query.trim()) return items

  // 使用自定义分词处理查询词
  const queryWords = simpleChineseSegment(query)
  
  console.log('查询分词结果:', queryWords)

  // 为每个搜索项计算相关性分数
  const scoredItems = items.map(item => {
    let score = 0
    const itemText = `${item.title} ${item.description} ${item.tags.join(' ')} ${item.keywords?.join(' ') || ''}`.toLowerCase()
    
    // 标题匹配权重最高
    if (item.title.toLowerCase().includes(query.toLowerCase())) {
      score += 100
    }
    
    // 分词匹配
    queryWords.forEach(word => {
      if (itemText.includes(word)) {
        score += 20
      }
    })
    
    // 标签精确匹配
    item.tags.forEach(tag => {
      if (query.toLowerCase().includes(tag.toLowerCase())) {
        score += 30
      }
    })
    
    // 关键词精确匹配
    item.keywords?.forEach(keyword => {
      if (query.toLowerCase().includes(keyword.toLowerCase())) {
        score += 25
      }
    })

    return { ...item, score }
  })

  // 按分数排序并过滤掉分数为0的结果
  return scoredItems
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
}

// 模糊搜索函数（保留原有功能作为备选）
export function fuzzySearch(query: string, items: SearchItem[] = searchDatabase): SearchItem[] {
  if (!query.trim()) return items
  
  const queryLower = query.toLowerCase()
  
  return items.filter(item => {
    const titleMatch = item.title.toLowerCase().includes(queryLower)
    const descMatch = item.description.toLowerCase().includes(queryLower)
    const tagsMatch = item.tags.some(tag => tag.toLowerCase().includes(queryLower))
    const keywordsMatch = item.keywords?.some(keyword => keyword.toLowerCase().includes(queryLower)) || false
    
    return titleMatch || descMatch || tagsMatch || keywordsMatch
  })
}

// 智能搜索函数（结合分词和模糊搜索）
export function smartSearch(query: string, items: SearchItem[] = searchDatabase): SearchItem[] {
  // 先尝试分词搜索
  const segmentResults = searchWithSmartSegment(query, items)
  
  // 如果分词搜索没有结果，使用模糊搜索
  if (segmentResults.length === 0) {
    return fuzzySearch(query, items)
  }
  
  return segmentResults
}

// 搜索建议函数
export function getSearchSuggestions(query: string): string[] {
  if (!query.trim()) return []
  
  const suggestions: string[] = []
  const queryLower = query.toLowerCase()
  
  // 从数据库中提取相关建议
  searchDatabase.forEach(item => {
    // 标题建议
    if (item.title.toLowerCase().includes(queryLower)) {
      suggestions.push(item.title)
    }
    
    // 标签建议
    item.tags.forEach(tag => {
      if (tag.toLowerCase().includes(queryLower)) {
        suggestions.push(tag)
      }
    })
    
    // 关键词建议
    item.keywords?.forEach(keyword => {
      if (keyword.toLowerCase().includes(queryLower)) {
        suggestions.push(keyword)
      }
    })
  })
  
  // 去重并限制数量
  return [...new Set(suggestions)].slice(0, 5)
}
