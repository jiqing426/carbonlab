// 类型定义
export type ExperimentStep = "intro" | "setup" | "simulation" | "analysis" | "esg"

// 产线升级类型
export type UpgradeType = "energy" | "emission"

// 季度活动类型
export type QuarterlyActivity = "production" | "upgrade" | "idle"

// 产线升级记录
export interface ProductionUpgrade {
  type: UpgradeType
  level: number // 0-5级
  cost: number // 每次升级10M
}

// 季度升级计划
export interface QuarterlyUpgrade {
  quarter: number // 季度编号 (1-20)
  year: number
  upgradeType: UpgradeType
  fromLevel: number
  toLevel: number
  cost: number
}

// 订单类型
export interface Order {
  id: string
  type: "sale" | "purchase"
  quantity: number
  price: number // 销售平均50M，采购平均35M
  deliveryQuarter: number // 交付季度（1-20）
  penalty?: number // 违约金（仅销售订单）
  status: "pending" | "completed" | "violated"
}

// 季度生产数据
export interface QuarterlyProduction {
  quarter: number
  year: number
  activity: QuarterlyActivity // 该季度的主要活动
  rawMaterialsUsed: number
  productsProduced: number
  energyConsumed: number
  carbonEmitted: number
  revenue: number
  costs: number
  upgradeExecuted?: QuarterlyUpgrade // 如果该季度进行了升级
}

// 年度碳配额
export interface CarbonAllowance {
  year: number
  allowance: number
  used: number
  traded: number // 正数为购买，负数为销售
  tradingCost: number
}

// 企业状态
export interface CompanyState {
  // 财务状态
  funds: number // 资金，初始10M
  
  // 库存状态
  rawMaterialInventory: number // 原材料库存，初始10
  productInventory: number // 产成品库存，初始10
  
  // 产线状态
  baseProductionCapacity: number // 基础产能，每季度10个
  productionUpgrades: {
    energy: number // 能耗降低级别 0-5
    emission: number // 碳排降低级别 0-5
  }
  
  // 当前能耗和碳排（考虑升级）
  currentEnergyPerUnit: number // 初始10，每升级1级减少1
  currentEmissionPerUnit: number // 初始10，每升级1级减少1
  
  // 订单管理
  activeOrders: Order[]
  completedOrders: Order[]
  
  // 生产记录
  quarterlyRecords: QuarterlyProduction[]
  
  // 升级记录
  upgradeHistory: QuarterlyUpgrade[]
  
  // 碳配额管理
  carbonAllowances: CarbonAllowance[]
  
  // 经营状态
  currentYear: number
  currentQuarter: number
  gameOver: boolean
  gameOverReason?: string
}

// 年度规划
export interface AnnualPlan {
  year: number
  
  // 产线升级计划（按季度安排）
  plannedUpgrades: QuarterlyUpgrade[]
  
  // 选择的订单
  selectedSaleOrders: Order[]
  selectedPurchaseOrders: Order[]
  
  // 总投资成本
  totalUpgradeCost: number
  totalOrderValue: number
  
  // 季度活动安排
  quarterlyActivities: {
    [quarter: number]: QuarterlyActivity // 1-4季度的活动安排
  }
}

// 市场数据
export interface MarketData {
  // 碳配额价格（固定1M每单位）
  carbonPrice: number
  
  // 5年碳配额限制
  yearlyAllowances: number[] // [30, 25, 20, 15, 10]
  
  // 可选订单池
  availableSaleOrders: Order[]
  availablePurchaseOrders: Order[]
}

// 模拟数据
export interface SimulationData {
  companyState: CompanyState
  marketData: MarketData
  annualPlans: AnnualPlan[]
  currentPlan?: AnnualPlan
}

// ESG报告数据接口
export interface ESGScores {
  environment: number // 环境评分 (0-100)
  social: number // 社会评分 (0-100)
  governance: number // 治理评分 (0-100)
  overall: number // 综合评分 (0-100)
}

export interface ESGRating {
  rating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" // ESG等级
  color: string // 颜色样式
  bg: string // 背景样式
}

export interface CarbonFootprintData {
  totalEmissions: number // 总碳排放 (kg)
  totalProduction: number // 总生产量 (个)
  carbonIntensity: number // 碳强度 (kg/产品)
  reductionRate: number // 减排率 (%)
}

export interface ESGRecommendation {
  category: "环境" | "社会" | "治理" | "综合" // 建议类别
  priority: "高" | "中" | "低" // 优先级
  suggestion: string // 具体建议
}

export interface ESGReportData {
  // 基本信息
  reportDate: string // 报告生成日期
  simulationPeriod: {
    startYear: number
    endYear: number
    totalYears: number
  }
  
  // ESG评分
  esgScores: ESGScores
  overallRating: ESGRating
  
  // 环境绩效指标
  environmentalMetrics: {
    carbonFootprint: CarbonFootprintData
    carbonAllowanceUsageRate: number // 碳配额使用率 (%)
    totalUpgradeInvestment: number // 技改投资总额 (元)
    energyUpgradeCount: number // 节能技改次数
    emissionUpgradeCount: number // 减排技改次数
    avgProductCarbonLabel: number // 平均产品碳标签 (kg/个)
    allowanceTradingIncome: number // 配额交易收入 (元)
    carbonCompliance: boolean // 碳合规性
  }
  
  // 社会与治理绩效
  socialGovernanceMetrics: {
    operationalYears: number // 经营年限
    finalCash: number // 最终现金 (元)
    totalProfit: number // 累计利润 (元)
    financialHealth: "健康" | "困难" // 财务状况
    sustainabilityInvestment: boolean // 可持续发展投资
    allowanceTrading: boolean // 配额交易开展情况
    longTermPlanning: boolean // 长期规划完成情况
  }
  
  // 年度经营记录
  yearlyRecords: Array<{
    year: number
    productionQuantity: number // 生产数量 (个)
    yearlyProfit: number // 年度利润 (元)
    cashAsset: number // 现金资产 (元)
    carbonEmission: number // 碳排放 (kg)
    carbonAllowance: number // 碳配额 (kg)
    quotaBalance: number // 配额结余 (kg)
    quotaIncome: number // 配额收入 (元)
    energyUpgradeCount: number // 节能技改次数
    emissionUpgradeCount: number // 减排技改次数
    productCarbonLabel: number // 产品碳标签 (kg/个)
  }>
  
  // 技术升级历史
  upgradeHistory: Array<{
    year: number
    quarter: number
    type: "energy" | "emission" // 升级类型
    fromLevel: number // 升级前等级
    toLevel: number // 升级后等级
    cost: number // 投资金额 (元)
  }>
  
  // 碳配额管理记录
  carbonAllowanceRecords: Array<{
    year: number
    allowance: number // 配额 (kg)
    used: number // 使用量 (kg)
    traded: number // 交易量 (kg，正数为购买，负数为销售)
    tradingCost: number // 交易成本 (元)
    compliance: boolean // 是否合规
  }>
  
  // ESG改进建议
  recommendations: ESGRecommendation[]
  
  // 报告总结
  summary: {
    mainAchievements: string[] // 主要成就
    developmentProspects: string // 发展前景
    esgValueReflection: {
      environmentalValue: string // 环境价值
      socialValue: string // 社会价值
      governanceValue: string // 治理价值
    }
  }
  
  // 关键统计数据
  keyStatistics: {
    totalCarbonEmission: number // 总碳排放 (kg)
    totalAllowance: number // 总配额 (kg)
    totalUpgradeInvestment: number // 总技改投资 (元)
    totalEnergyUpgradeCount: number // 总节能技改次数
    totalEmissionUpgradeCount: number // 总减排技改次数
    totalAllowanceTraded: number // 总配额交易收入 (元)
    avgCarbonLabel: number // 平均产品碳标签 (kg/个)
  }
}

// 组件导出
export { IntroductionStep } from "./IntroductionStep"
export { SimulationSetupStep } from "./SimulationSetupStep"
export { SimulationRunStep } from "./SimulationRunStep"
export { ResultAnalysisStep } from "./ResultAnalysisStep"
export { ESGReportStep } from "./ESGReportStep"