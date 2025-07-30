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

// 组件导出
export { IntroductionStep } from "./IntroductionStep"
export { SimulationSetupStep } from "./SimulationSetupStep"
export { SimulationRunStep } from "./SimulationRunStep"
export { ResultAnalysisStep } from "./ResultAnalysisStep"
export { ESGReportStep } from "./ESGReportStep" 