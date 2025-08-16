"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, Play, CheckCircle, AlertCircle, DollarSign, Factory, Zap, Calendar, AlertTriangle, ChevronRight } from "lucide-react"
import { SimulationData } from "./index"

interface SimulationRunStepProps {
  simulationData: SimulationData
  onDataUpdate: (data: Partial<SimulationData>) => void
  onNext: () => void
  onPrevious: () => void
  yearlyRecords: any[]
  setYearlyRecords: React.Dispatch<React.SetStateAction<any[]>>
  upgradeHistory: any[]
  setUpgradeHistory: React.Dispatch<React.SetStateAction<any[]>>
}

// 模拟步骤类型
type SimulationStep = 
  | "start"
  | "confirmInitialData"
  | "techUpgradePlan"
  | "getCarbonAllowance"
  | "carbonCreditPurchase"
  | "orderSelection"
  | "equipmentUpgrade"
  | "powerPurchase"
  | "materialPurchase"
  | "production"
  | "delivery"
  | "carbonSettlement"

export function SimulationRunStep({ simulationData, onDataUpdate, onNext, onPrevious, yearlyRecords, setYearlyRecords, upgradeHistory, setUpgradeHistory }: SimulationRunStepProps) {
  const { companyState, marketData } = simulationData
  const [currentStep, setCurrentStep] = useState<SimulationStep>("start")
  const [currentYear, setCurrentYear] = useState(1)
  const [isStepCompleted, setIsStepCompleted] = useState(false)
  
  // 资产状态管理 - 根据年度调整初始值
  const [cashAsset, setCashAsset] = useState(1500000) // 现金资产
  const [productionLineAsset, setProductionLineAsset] = useState(1000000) // 生产线资产
  const [fixedCost, setFixedCost] = useState(150000) // 年度固定成本
  const [isBankrupt, setIsBankrupt] = useState(false) // 破产状态

  // 绿贷现金相关
  const [greenLoanCash, setGreenLoanCash] = useState(1500000) // 首年发放150万
  const [greenLoanPrincipal, setGreenLoanPrincipal] = useState(1500000) // 本金
  const [greenLoanInterest, setGreenLoanInterest] = useState(0) // 累计利息
  const [greenLoanYearlyRepayment, setGreenLoanYearlyRepayment] = useState(0) // 每年还款额
  const [greenLoanDepreciation, setGreenLoanDepreciation] = useState(0) // 年末折旧
  
  // 年末资产统计相关
  const [carbonCreditStock, setCarbonCreditStock] = useState(0)
  const [carbonCreditStockValue, setCarbonCreditStockValue] = useState(0)
  const [materialStock, setMaterialStock] = useState(0)
  const [materialStockValue, setMaterialStockValue] = useState(0)
  const [greenPowerStock, setGreenPowerStock] = useState(0)
  const [greenPowerStockValue, setGreenPowerStockValue] = useState(0)
  const [coalPowerStock, setCoalPowerStock] = useState(0)
  const [coalPowerStockValue, setCoalPowerStockValue] = useState(0)
  
  // 年度初始库存状态
  const [initMaterialStock, setInitMaterialStock] = useState(0)
  const [initCarbonCreditStock, setInitCarbonCreditStock] = useState(0)
  const [initGreenPowerStock, setInitGreenPowerStock] = useState(0)
  const [initCoalPowerStock, setInitCoalPowerStock] = useState(0)
  
  // 年度相关参数
  const getYearlyParams = (year: number) => {
    const params = {
      // 原材料单价 (元/包)
      materialUnitPrice: [2000, 2400, 2800, 3200, 3600][year - 1],
      // 产品基准单价 (元/个)
      productBasePrice: [30000, 35000, 40000, 45000, 50000][year - 1],
      // 违约罚款比例 (%)
      penaltyRatio: [40, 60, 80, 100, 200][year - 1],
      // 绿电单价 (元/度)
      greenPowerPrice: [1.2, 1.44, 1.56, 1.68, 1.8][year - 1],
      // 煤电单价 (元/度)
      coalPowerPrice: [1.0, 1.2, 1.3, 1.4, 1.5][year - 1],
      // 绿电占总电的比例 (%)
      greenPowerRatio: [16, 20, 25, 50, 80][year - 1],
      // 配额买入定价 (元/吨)
      allowanceBuyPrice: [100, 150, 200, 250, 400][year - 1],
      // 碳汇卖出定价 (元/吨)
      carbonCreditPrice: [50, 100, 180, 250, 350][year - 1],
      // 超排罚款定价 (元/吨)
      overEmissionPenalty: [250, 500, 1800, 5000, 10000][year - 1]
    }
    return params
  }
  
  // 技改计划数据
  const [energyUpgradeCount, setEnergyUpgradeCount] = useState(0)
  const [emissionUpgradeCount, setEmissionUpgradeCount] = useState(0)
  
  // 累计技改次数（五年内最多4次）
  const [totalEnergyUpgradeCount, setTotalEnergyUpgradeCount] = useState(0)
  const [totalEmissionUpgradeCount, setTotalEmissionUpgradeCount] = useState(0)
  
  // 碳汇采购数据
  const [carbonCreditTotalCost, setCarbonCreditTotalCost] = useState(0)
  
  // 订单选择数据
  const [orderQuantity, setOrderQuantity] = useState(0)
  
  // 电力采购数据
  const [greenCertCount, setGreenCertCount] = useState(0)
  const [totalPower, setTotalPower] = useState(0)
  const [coalPowerAmount, setCoalPowerAmount] = useState(0)
  const [greenPowerAmount, setGreenPowerAmount] = useState(0)
  
  // 物料采购数据
  const [materialAmount, setMaterialAmount] = useState(0)
  const [materialCost, setMaterialCost] = useState(0)
  
  // 生产数据
  const [productionQuantity, setProductionQuantity] = useState(0)
  
  // 历史记录数据
  // const [yearlyRecords, setYearlyRecords] = useState<any[]>([]) // 移除
  
  // 配额结余交易相关
  const [quotaTradeType, setQuotaTradeType] = useState("system") // system/agreement/abandon
  const [quotaTradePrice, setQuotaTradePrice] = useState(getYearlyParams(currentYear).carbonCreditPrice)
  const [quotaBalance, setQuotaBalance] = useState(0)
  const [quotaIncome, setQuotaIncome] = useState(0)
  const [quotaValue, setQuotaValue] = useState(0)
  
  // 计算函数
  const calculateEnergyUpgradeCost = () => energyUpgradeCount * 250000
  const calculateEmissionUpgradeCost = () => emissionUpgradeCount * 200000
  const calculateTotalUpgradeCost = () => calculateEnergyUpgradeCost() + calculateEmissionUpgradeCost()
  
  const calculateEnergyReduction = () => {
    const totalCount = totalEnergyUpgradeCount + energyUpgradeCount
    if (totalCount === 0) return 0
    if (totalCount === 1) return 10
    if (totalCount === 2) return 15
    if (totalCount === 3) return 19
    if (totalCount === 4) return 21
    return 21
  }
  
  const calculateEmissionReduction = () => {
    const totalCount = totalEmissionUpgradeCount + emissionUpgradeCount
    if (totalCount === 0) return 0
    if (totalCount === 1) return 15
    if (totalCount === 2) return 23
    if (totalCount === 3) return 29
    if (totalCount === 4) return 32
    return 32
  }
  
  const calculateCarbonCreditTotal = () => {
    const yearlyParams = getYearlyParams(currentYear)
    return carbonCreditPurchaseInput * yearlyParams.carbonCreditPrice
  }
  
  const calculatePowerCosts = () => {
    const yearlyParams = getYearlyParams(currentYear)
    const coalCost = coalPowerAmount * yearlyParams.coalPowerPrice
    const greenCost = greenPowerAmount * yearlyParams.greenPowerPrice
    return coalCost + greenCost
  }
  
  const calculateMaterialCost = () => {
    const yearlyParams = getYearlyParams(currentYear)
    return materialAmount * yearlyParams.materialUnitPrice
  }
  
  // 计算订单违约罚款
  const calculateOrderPenalty = () => {
    const yearlyParams = getYearlyParams(currentYear)
    return (yearlyParams.productBasePrice * yearlyParams.penaltyRatio) / 100
  }
  
  // 计算碳配额
  const calculateCarbonAllowance = () => {
    const baseEmission = 1120000 // 基础排放量（年度合计）
    const allowanceRatio = [75, 65, 55, 45, 30][currentYear - 1] / 100
    return Math.floor(baseEmission * allowanceRatio)
  }
  
  // 破产检测函数
  const checkBankruptcy = (totalCost: number) => {
    if (totalCost > cashAsset) {
      setIsBankrupt(true)
      return true
    }
    return false
  }
  
  // 重新开始经营函数
  const restartSimulation = () => {
    setCurrentYear(1)
    setCurrentStep("start")
    setIsStepCompleted(false)
    setCashAsset(1500000)
    setProductionLineAsset(1000000)
    setFixedCost(150000)
    setIsBankrupt(false)
    
    // 重置所有数据
    setEnergyUpgradeCount(0)
    setEmissionUpgradeCount(0)
    setTotalEnergyUpgradeCount(0)
    setTotalEmissionUpgradeCount(0)
    setCarbonCreditPurchaseInput(0)
    setCarbonCreditTotalCost(0)
    setOrderQuantity(0)
    setGreenCertCount(0)
    setTotalPower(0)
    setCoalPowerAmount(0)
    setGreenPowerAmount(0)
    setMaterialAmount(0)
    setMaterialCost(0)
    setProductionQuantity(0)
    
    // 清空历史记录
    setYearlyRecords([])
  }
  
  // 更新资产状态
  const updateAssets = (yearlyProfit: number) => {
    const newCashAsset = cashAsset + yearlyProfit
    setCashAsset(newCashAsset)
    
    // 如果现金为负，则破产
    if (newCashAsset < 0) {
      setIsBankrupt(true)
    }
  }
  
  // 步骤处理函数
  const handleStartYear = () => {
    setCurrentStep("confirmInitialData")
    setIsStepCompleted(false)
    // 结转库存
    setMaterialAmount(initMaterialStock)
    setCarbonCreditPurchaseInput(initCarbonCreditStock)
    setGreenPowerAmount(initGreenPowerStock)
    setCoalPowerAmount(initCoalPowerStock)
  }
  
  const handleConfirmInitialData = () => {
    setCurrentStep("techUpgradePlan")
    setIsStepCompleted(false)
  }
  
  // 技改计划确认时记录升级历史
  const handleTechUpgradePlan = () => {
    // 计算技改总费用
    const upgradeCost = calculateTotalUpgradeCost()
    let greenLoanUsed = 0
    let cashUsed = 0
    if (greenLoanCash >= upgradeCost) {
      greenLoanUsed = upgradeCost
      cashUsed = 0
    } else {
      greenLoanUsed = greenLoanCash
      cashUsed = upgradeCost - greenLoanCash
    }
    setGreenLoanCash(greenLoanCash - greenLoanUsed)
    setCashAsset(cashAsset - cashUsed)

    // 更新累计技改次数
    setTotalEnergyUpgradeCount(totalEnergyUpgradeCount + energyUpgradeCount)
    setTotalEmissionUpgradeCount(totalEmissionUpgradeCount + emissionUpgradeCount)
    
    setCurrentStep("getCarbonAllowance")
    setIsStepCompleted(false)

    // 记录升级历史
    if (energyUpgradeCount > 0) {
      setUpgradeHistory(prev => [...prev, {
        year: currentYear,
        type: 'energy',
        fromLevel: totalEnergyUpgradeCount,
        toLevel: totalEnergyUpgradeCount + energyUpgradeCount,
        cost: calculateEnergyUpgradeCost()
      }])
    }
    if (emissionUpgradeCount > 0) {
      setUpgradeHistory(prev => [...prev, {
        year: currentYear,
        type: 'emission',
        fromLevel: totalEmissionUpgradeCount,
        toLevel: totalEmissionUpgradeCount + emissionUpgradeCount,
        cost: calculateEmissionUpgradeCost()
      }])
    }
  }
  
  const handleGetCarbonAllowance = () => {
    setCurrentStep("carbonCreditPurchase")
    setIsStepCompleted(false)
  }
  
  // 1. 组件顶部只保留库存变量和采购输入变量
  const [materialPurchaseInput, setMaterialPurchaseInput] = useState(0)
  const [carbonCreditPurchaseInput, setCarbonCreditPurchaseInput] = useState(0)
  const [greenPowerPurchaseInput, setGreenPowerPurchaseInput] = useState(0)
  const [coalPowerPurchaseInput, setCoalPowerPurchaseInput] = useState(0)

  // 2. 采购时只操作库存变量
  const handleMaterialPurchase = () => {
    setMaterialStock(materialStock + materialPurchaseInput)
    setCashAsset(cashAsset - materialPurchaseInput * getYearlyParams(currentYear).materialUnitPrice)
    setMaterialPurchaseInput(0)
    setCurrentStep("production")
    setIsStepCompleted(false)
  }
  const handleCarbonCreditPurchase = () => {
    setCarbonCreditStock(carbonCreditStock + carbonCreditPurchaseInput)
    setCashAsset(cashAsset - carbonCreditPurchaseInput * getYearlyParams(currentYear).carbonCreditPrice)
    setCarbonCreditPurchaseInput(0)
    setCurrentStep("orderSelection")
    setIsStepCompleted(false)
  }
  const handlePowerPurchase = () => {
    setGreenPowerStock(greenPowerStock + greenPowerPurchaseInput)
    setCoalPowerStock(coalPowerStock + coalPowerPurchaseInput)
    setCashAsset(cashAsset - calculatePowerCosts())
    setGreenPowerPurchaseInput(0)
    setCoalPowerPurchaseInput(0)
    setCurrentStep("materialPurchase")
    setIsStepCompleted(false)
  }
  // 3. 生产时只操作库存变量
  const handleProduction = () => {
    // 验证生产数量不超过限制
    const maxCapacity = Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)
    if (productionQuantity > maxCapacity) {
      alert(`生产数量不能超过可用产能：${maxCapacity} 个`)
      return
    }
    
    setMaterialStock(materialStock - productionQuantity)
    setCarbonCreditStock(carbonCreditStock - productionQuantity * 120000)
    setGreenPowerStock(greenPowerStock - productionQuantity * 8000 * getYearlyParams(currentYear).greenPowerRatio / 100)
    setCoalPowerStock(coalPowerStock - productionQuantity * 8000 * (100 - getYearlyParams(currentYear).greenPowerRatio / 100))
    setCurrentStep("delivery")
    setIsStepCompleted(false)
  }
  
  const handleDelivery = () => {
    setCurrentStep("carbonSettlement")
    setIsStepCompleted(false)
  }
  
  const handleCarbonSettlement = () => {
    // 1. 计算所有结算后新值
    const yearlyParams = getYearlyParams(currentYear)
    const totalCost = fixedCost
    const totalRevenue = productionQuantity * yearlyParams.productBasePrice
    const yearlyProfit = totalRevenue - totalCost
    let newCashAsset = cashAsset + yearlyProfit
    // 绿贷还款
    let newGreenLoanPrincipal = greenLoanPrincipal
    let newGreenLoanInterest = greenLoanInterest
    let newGreenLoanCash = greenLoanCash
    if (currentYear <= 5) {
      const yearlyPrincipalRepay = greenLoanPrincipal / 5
      const yearlyInterest = greenLoanPrincipal * 0.015
      const yearlyRepayment = yearlyPrincipalRepay + yearlyInterest
      newGreenLoanPrincipal -= yearlyPrincipalRepay
      newGreenLoanInterest += yearlyInterest
      if (newGreenLoanCash >= yearlyRepayment) {
        newGreenLoanCash -= yearlyRepayment
      } else {
        const rest = yearlyRepayment - newGreenLoanCash
        newGreenLoanCash = 0
        newCashAsset -= rest
      }
      // 折旧
      newGreenLoanCash = (newGreenLoanCash + yearlyPrincipalRepay) * 0.9
    }
    // 配额结余交易
    const carbonAllowance = calculateCarbonAllowance()
    const actualEmission = productionQuantity * 120000
    const quotaBalanceVal = Math.max(0, carbonAllowance - actualEmission)
    let quotaIncomeVal = 0, quotaValueVal = 0
    if (quotaBalanceVal > 0) {
      if (quotaTradeType === "system") {
        quotaIncomeVal = quotaValueVal = quotaBalanceVal * yearlyParams.carbonCreditPrice / 1000
      } else if (quotaTradeType === "agreement") {
        if (quotaTradePrice >= yearlyParams.allowanceBuyPrice && quotaTradePrice <= yearlyParams.overEmissionPenalty) {
          quotaIncomeVal = quotaValueVal = quotaBalanceVal * quotaTradePrice / 1000
        }
      }
    }
    newCashAsset += quotaIncomeVal
    // 生产线资产折旧
    const techUpgradeTotal = calculateTotalUpgradeCost()
    const newProductionLineAsset = (productionLineAsset + techUpgradeTotal) * 0.9
    // 库存结算
    const carbonCreditRemain = Math.max(0, carbonCreditStock - productionQuantity * 120000)
    const carbonCreditRemainValue = carbonCreditRemain * yearlyParams.carbonCreditPrice / 1000
    const materialRemain = Math.max(0, materialAmount - productionQuantity)
    const materialRemainValue = materialRemain * yearlyParams.materialUnitPrice
    const greenRemain = Math.max(0, greenPowerAmount - productionQuantity * 8000 * yearlyParams.greenPowerRatio / 100)
    const greenRemainValue = greenRemain * yearlyParams.greenPowerPrice
    const coalRemain = Math.max(0, coalPowerAmount - productionQuantity * 8000 * (100 - yearlyParams.greenPowerRatio) / 100)
    const coalRemainValue = coalRemain * yearlyParams.coalPowerPrice
    // 分项排放
    const materialEmission = productionQuantity * 8000
    const coalPowerEmission = productionQuantity * 8000 * (1 - yearlyParams.greenPowerRatio / 100)
    const greenPowerReduction = productionQuantity * 8000 * yearlyParams.greenPowerRatio / 100
    const carbonNeutralized = productionQuantity * 120000
    const productCarbonLabel = productionQuantity > 0 ? (carbonNeutralized / productionQuantity) : 0
    const productCarbonCost = productionQuantity > 0 ? (carbonNeutralized * yearlyParams.carbonCreditPrice / productionQuantity) : 0
    // 2. 写入记录
    const yearlyRecord = {
      year: currentYear,
      energyUpgradeCount,
      emissionUpgradeCount,
      totalEmissionUpgradeCount: totalEmissionUpgradeCount + emissionUpgradeCount,
      carbonCreditAmount: carbonCreditRemain, // 保留旧变量名，但实际值已更新
      orderQuantity,
      productionQuantity,
      totalRevenue,
      totalCost,
      yearlyProfit,
      carbonEmission: productionQuantity * 120000,
      carbonAllowance,
      cashAsset: newCashAsset,
      quotaBalance: quotaBalanceVal,
      quotaIncome: quotaIncomeVal,
      quotaValue: quotaValueVal,
      carbonCreditStock: carbonCreditRemain,
      carbonCreditStockValue: carbonCreditRemainValue,
      materialStock: materialRemain,
      materialStockValue: materialRemainValue,
      greenPowerStock: greenRemain,
      greenPowerStockValue: greenRemainValue,
      coalPowerStock: coalRemain,
      coalPowerStockValue: coalRemainValue,
      productionLineAsset: newProductionLineAsset,
      materialEmission,
      coalPowerEmission,
      greenPowerReduction,
      carbonNeutralized,
      productCarbonLabel,
      productCarbonCost
    }
    setYearlyRecords([...yearlyRecords, yearlyRecord])
    // 3. setState
    setCashAsset(newCashAsset)
    setGreenLoanPrincipal(newGreenLoanPrincipal)
    setGreenLoanInterest(newGreenLoanInterest)
    setGreenLoanCash(newGreenLoanCash)
    setQuotaBalance(quotaBalanceVal)
    setQuotaIncome(quotaIncomeVal)
    setQuotaValue(quotaValueVal)
    setProductionLineAsset(newProductionLineAsset)
    setCarbonCreditStock(carbonCreditRemain)
    setCarbonCreditStockValue(carbonCreditRemainValue)
    setMaterialStock(materialRemain)
    setMaterialStockValue(materialRemainValue)
    setGreenPowerStock(greenRemain)
    setGreenPowerStockValue(greenRemainValue)
    setCoalPowerStock(coalRemain)
    setCoalPowerStockValue(coalRemainValue)
    // 进入下一年或结果分析
    if (currentYear < 5) {
      setCurrentYear(currentYear + 1)
      setCurrentStep("start")
      setIsStepCompleted(false)
      setEnergyUpgradeCount(0)
      setEmissionUpgradeCount(0)
      setCarbonCreditPurchaseInput(0) // 重置输入
      setCarbonCreditTotalCost(0)
      setOrderQuantity(0)
      setGreenCertCount(0)
      setMaterialAmount(0)
      setProductionQuantity(0)
      setInitMaterialStock(materialAmount)
      setInitCarbonCreditStock(carbonCreditStock) // 重置库存
      setInitGreenPowerStock(greenPowerAmount)
      setInitCoalPowerStock(coalPowerAmount)
    } else {
      onNext()
    }
  }
  
  // 渲染当前步骤
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "start":
  return (
          <div className="text-center py-8">
            <h3 className="text-xl font-semibold mb-4">准备开始第{currentYear}年经营模拟</h3>
            <p className="text-gray-600 mb-6">点击下方按钮开始本年度的经营决策流程</p>
            <Button onClick={handleStartYear} size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Play className="mr-2 h-5 w-5" />
              开启经营年
            </Button>
              </div>
        )
        
      case "confirmInitialData":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-2">现金资产</h4>
                <p className="text-2xl font-bold text-blue-600">{cashAsset.toLocaleString()} 元</p>
            </div>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-800 mb-2">生产线资产</h4>
                <p className="text-2xl font-bold text-green-600">{productionLineAsset.toLocaleString()} 元</p>
            </div>
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-purple-800 mb-2">年度固定成本</h4>
                <p className="text-2xl font-bold text-purple-600">{fixedCost.toLocaleString()} 元</p>
            </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleConfirmInitialData} className="bg-green-600 hover:bg-green-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认并继续
              </Button>
            </div>
          </div>
        )
        
      case "techUpgradePlan":
        return (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* 节能技改部分 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">1. 节能技改部分</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="energyUpgradeCount">本年节能技改次数：</Label>
                    <Input
                      id="energyUpgradeCount"
                      type="number"
                      value={energyUpgradeCount}
                      onChange={(e) => setEnergyUpgradeCount(Number(e.target.value))}
                      min="0"
                      max={Math.min(4, 4 - totalEnergyUpgradeCount)}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      累计节能技改次数：{totalEnergyUpgradeCount} / 4
                    </p>
            </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>节能技改价格（元）：</strong>250,000.00</p>
                    <p><strong>节能技改总费用（元）：</strong>{calculateEnergyUpgradeCost().toLocaleString()}</p>
                    <p><strong>技改前生产线能耗（度）：</strong>80,000.00</p>
                    <p><strong>技改后生产线能耗降低百分比（%）：</strong>{calculateEnergyReduction()}</p>
                    <p><strong>技改后生产线能耗（度）：</strong>{(80000 * (1 - calculateEnergyReduction() / 100)).toFixed(2)}</p>
          </div>
                </div>
              </div>
              
              {/* 减排技改部分 */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-800 border-b pb-2">2. 减排技改部分</h4>
                <div className="space-y-3">
                  <div>
                    <Label htmlFor="emissionUpgradeCount">本年减排技改次数：</Label>
                    <Input
                      id="emissionUpgradeCount"
                      type="number"
                      value={emissionUpgradeCount}
                      onChange={(e) => setEmissionUpgradeCount(Number(e.target.value))}
                      min="0"
                      max={Math.min(4, 4 - totalEmissionUpgradeCount)}
                    />
                    <p className="text-sm text-gray-600 mt-1">
                      累计减排技改次数：{totalEmissionUpgradeCount} / 4
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded">
                    <p><strong>减排技改价格（元）：</strong>200,000.00</p>
                    <p><strong>减排技改总费用（元）：</strong>{calculateEmissionUpgradeCost().toLocaleString()}</p>
                    <p><strong>技改前生产线排放（kg）：</strong>120,000.00</p>
                    <p><strong>技改后生产线排放降低百分比（%）：</strong>{calculateEmissionReduction()}</p>
                    <p><strong>技改后生产线排放（kg）：</strong>{(120000 * (1 - calculateEmissionReduction() / 100)).toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>总技改费用：</strong>{calculateTotalUpgradeCost().toLocaleString()} 元
              </p>
              <p className="text-sm text-yellow-800">
                <strong>绿贷现金可用额度：</strong>{greenLoanCash.toLocaleString()} 元
              </p>
              <p className="text-sm text-yellow-800">
                <strong>现金资产：</strong>{cashAsset.toLocaleString()} 元
              </p>
              <p className="text-xs text-gray-500 mt-1">* 技改费用优先使用绿贷现金，剩余部分用自有现金</p>
              {calculateTotalUpgradeCost() > (greenLoanCash + cashAsset) && (
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ 资金不足，无法完成技改！
                </p>
              )}
            </div>
            
            <div className="flex justify-center">
              <Button 
                onClick={handleTechUpgradePlan} 
                className="bg-orange-600 hover:bg-orange-700"
                disabled={calculateTotalUpgradeCost() > (greenLoanCash + cashAsset)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                确认技改计划
              </Button>
            </div>
            
            {calculateTotalUpgradeCost() > cashAsset && (
              <div className="text-center">
                <Button onClick={restartSimulation} className="bg-blue-600 hover:bg-blue-700">
                  重新开始经营
                </Button>
                </div>
            )}
          </div>
        )
        
      case "getCarbonAllowance":
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">第{currentYear}年碳配额</h3>
              <div className="bg-green-50 p-6 rounded-lg border border-green-200 max-w-md mx-auto">
                <p className="text-2xl font-bold text-green-600 mb-2">
                  {calculateCarbonAllowance()} kg
                </p>
                <p className="text-sm text-gray-600">年度核定碳配额已发放</p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleGetCarbonAllowance} className="bg-green-600 hover:bg-green-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认领取
              </Button>
            </div>
          </div>
        )
        
      case "carbonCreditPurchase":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="carbonCreditPurchaseInput">采购数量（kg）：</Label>
                <Input
                  id="carbonCreditPurchaseInput"
                  type="number"
                  value={carbonCreditPurchaseInput}
                  onChange={e => setCarbonCreditPurchaseInput(Number(e.target.value))}
                  min="0"
                />
              </div>
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <h4 className="font-semibold text-red-800 mb-2">碳汇采购信息</h4>
                {(() => {
                  const yearlyParams = getYearlyParams(currentYear)
                  return (
                    <>
                      <p><strong>第{currentYear}年碳汇卖出定价：</strong>{yearlyParams.carbonCreditPrice} 元/吨</p>
                      <p><strong>采购数量：</strong>{carbonCreditPurchaseInput.toLocaleString()} kg</p>
                      <p><strong>碳汇采购金额：</strong>{(carbonCreditPurchaseInput * yearlyParams.carbonCreditPrice).toLocaleString()} 元</p>
                    </>
                  )
                })()}
              </div>
            </div>
            {carbonCreditPurchaseInput * getYearlyParams(currentYear).carbonCreditPrice > cashAsset && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ 您已破产！
                </p>
              </div>
            )}
            <div className="flex justify-center">
                            <Button
                onClick={handleCarbonCreditPurchase} 
                className="bg-red-600 hover:bg-red-700"
                disabled={carbonCreditPurchaseInput * getYearlyParams(currentYear).carbonCreditPrice > cashAsset}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                确认采购
                            </Button>
            </div>
            {carbonCreditPurchaseInput * getYearlyParams(currentYear).carbonCreditPrice > cashAsset && (
              <div className="text-center">
                <Button onClick={restartSimulation} className="bg-blue-600 hover:bg-blue-700">
                  重新开始经营
                </Button>
              </div>
            )}
          </div>
        )
        
      case "orderSelection":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="orderQuantity">订单数量（个）：</Label>
                <Input
                  id="orderQuantity"
                  type="number"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                  min="0"
                  max="40"
                  placeholder="年产能上限：40个"
                />
                <p className="text-xs text-gray-500 mt-1">
                  年产能上限：40个 | 建议订单数量不超过产能限制
                </p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
                <h4 className="font-semibold text-indigo-800 mb-2">订单信息</h4>
                {(() => {
                  const yearlyParams = getYearlyParams(currentYear)
                  return (
                    <>
                      <p><strong>第{currentYear}年产品基准单价：</strong>{yearlyParams.productBasePrice.toLocaleString()} 元/个</p>
                      <p><strong>第{currentYear}年违约罚款比例：</strong>{yearlyParams.penaltyRatio}%</p>
                      <p><strong>订单数量：</strong>{orderQuantity} 个</p>
                      <p><strong>订单总价值：</strong>{(orderQuantity * yearlyParams.productBasePrice).toLocaleString()} 元</p>
                      <p><strong>年产能上限：</strong>40 个</p>
                    </>
                  )
                })()}
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={() => { setCurrentStep("equipmentUpgrade"); setIsStepCompleted(false); }} className="bg-indigo-600 hover:bg-indigo-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认订单
              </Button>
            </div>
          </div>
        )
      case "equipmentUpgrade":
        return (
          <div className="space-y-6">
            <div className="text-center py-8">
              <h3 className="text-xl font-semibold mb-4">设备改造</h3>
              <p className="text-gray-600 mb-6">本年设备改造已完成，点击确认进入电力采购</p>
              <Button onClick={() => { setCurrentStep("powerPurchase"); setIsStepCompleted(false); }} size="lg" className="bg-teal-600 hover:bg-teal-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认设备改造
              </Button>
            </div>
          </div>
        )
        
      case "powerPurchase":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="greenCertCount">绿电证书购买数量（个）：</Label>
                <Input
                  id="greenCertCount"
                  type="number"
                  value={greenCertCount}
                  onChange={(e) => {
                    const certs = Number(e.target.value)
                    setGreenCertCount(certs)
                    setTotalPower(certs * 1000)
                    const yearlyParams = getYearlyParams(currentYear)
                    setGreenPowerAmount(certs * yearlyParams.greenPowerRatio) // 动态绿电比例
                    setCoalPowerAmount(certs * (100 - yearlyParams.greenPowerRatio)) // 动态煤电比例
                  }}
                  min="0"
                  max="320"
                  placeholder="建议不超过年产能：320个证书"
                />
                <p className="text-xs text-gray-500 mt-1">
                  年产能上限：40个 | 建议电力足够支持年产能（40个×8000度=320000度）
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <h4 className="font-semibold text-yellow-800 mb-2">购买总电力</h4>
                <p className="text-xl font-bold text-yellow-600">{totalPower.toLocaleString()} 度</p>
                <p className="text-xs text-yellow-600 mt-1">年产能上限：40个</p>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">1. 煤电部分</h4>
                <div className="bg-gray-50 p-3 rounded">
                  {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    return (
                      <>
                        <p><strong>单价：</strong>{yearlyParams.coalPowerPrice} 元</p>
                        <p><strong>占比：</strong>{100 - yearlyParams.greenPowerRatio}%</p>
                        <p><strong>数量：</strong>{coalPowerAmount.toLocaleString()} 度</p>
                        <p><strong>费用：</strong>{(coalPowerAmount * yearlyParams.coalPowerPrice).toLocaleString()} 元</p>
                      </>
                    )
                  })()}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">2. 绿电部分</h4>
                <div className="bg-gray-50 p-3 rounded">
                  {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    return (
                      <>
                        <p><strong>单价：</strong>{yearlyParams.greenPowerPrice} 元</p>
                        <p><strong>占比：</strong>{yearlyParams.greenPowerRatio}%</p>
                        <p><strong>数量：</strong>{greenPowerAmount.toLocaleString()} 度</p>
                        <p><strong>费用：</strong>{(greenPowerAmount * yearlyParams.greenPowerPrice).toLocaleString()} 元</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-lg font-semibold text-yellow-800">
                合计费用：{calculatePowerCosts().toLocaleString()} 元
              </p>
            </div>
            
            {calculatePowerCosts() > cashAsset && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ 您已破产！
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
                            <Button
                onClick={handlePowerPurchase} 
                className="bg-yellow-600 hover:bg-yellow-700"
                disabled={calculatePowerCosts() > cashAsset}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                确认电力采购
              </Button>
            </div>
            
            {calculatePowerCosts() > cashAsset && (
              <div className="text-center">
                <Button onClick={restartSimulation} className="bg-blue-600 hover:bg-blue-700">
                  重新开始经营
                            </Button>
                          </div>
                        )}
          </div>
        )
        
      case "materialPurchase":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="materialAmount">采购数量（包）：</Label>
                <Input
                  id="materialAmount"
                  type="number"
                  value={materialAmount}
                  onChange={(e) => {
                    const amount = Number(e.target.value)
                    setMaterialAmount(amount)
                    const yearlyParams = getYearlyParams(currentYear)
                    setMaterialCost(amount * yearlyParams.materialUnitPrice)
                  }}
                  min="0"
                  max="40"
                  placeholder="建议不超过年产能：40包"
                />
                <p className="text-xs text-gray-500 mt-1">
                  年产能上限：40个 | 建议采购数量不超过产能限制
                </p>
              </div>
              <div className="bg-pink-50 p-4 rounded-lg border border-pink-200">
                <h4 className="font-semibold text-pink-800 mb-2">采购信息</h4>
                {(() => {
                  const yearlyParams = getYearlyParams(currentYear)
                  return (
                    <>
                      <p><strong>采购单价：</strong>{yearlyParams.materialUnitPrice.toLocaleString()} 元/包</p>
                      <p><strong>采购金额：</strong>{materialCost.toLocaleString()} 元</p>
                      <p><strong>年产能上限：</strong>40 个</p>
                    </>
                  )
                })()}
              </div>
            </div>
            
            {materialCost > cashAsset && (
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <p className="text-sm text-red-600 font-semibold">
                  ⚠️ 您已破产！
                </p>
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={handleMaterialPurchase} 
                className="bg-pink-600 hover:bg-pink-700"
                disabled={materialCost > cashAsset}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                确认物料采购
              </Button>
                      </div>
            
            {materialCost > cashAsset && (
              <div className="text-center">
                <Button onClick={restartSimulation} className="bg-blue-600 hover:bg-blue-700">
                  重新开始经营
                </Button>
                  </div>
            )}
                </div>
        )
        
      case "production":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">库存信息</h4>
                <div className="bg-gray-50 p-3 rounded">
                  <p><strong>订单数量：</strong>{orderQuantity} 个</p>
                  <p><strong>物料库存：</strong>{materialAmount} 包</p>
                  <p><strong>电力库存：</strong>{totalPower.toLocaleString()} 度</p>
                  <p><strong>碳汇库存：</strong>{carbonCreditStock.toLocaleString()} kg</p>
                  <p><strong>年度固定产能：</strong>40 个</p>
                  <p><strong>可用产能：</strong>{Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)} 个</p>
                    </div>
                    </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">生产过程</h4>
                    <div>
                  <Label htmlFor="productionQuantity">生产数量（个）：</Label>
                  <Input
                    id="productionQuantity"
                    type="number"
                    value={productionQuantity}
                    onChange={(e) => {
                      const value = Number(e.target.value)
                      const maxCapacity = Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)
                      setProductionQuantity(Math.min(value, maxCapacity))
                    }}
                    min="0"
                    max={Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)}
                    placeholder={`最大产能：${Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)} 个`}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    年产能上限：40个 | 可用产能：{Math.min(orderQuantity, materialAmount, Math.floor(totalPower / 8000), 40)} 个
                  </p>
                    </div>
                <div className="bg-cyan-50 p-3 rounded">
                  <p><strong>生产需要消耗物料：</strong>{productionQuantity} 包</p>
                  <p><strong>生产需要消耗电力：</strong>{(productionQuantity * 8000).toLocaleString()} 度</p>
                  <p><strong>生产所消耗碳汇：</strong>{(productionQuantity * 120000).toLocaleString()} kg</p>
                  </div>
                </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleProduction} className="bg-cyan-600 hover:bg-cyan-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认生产
              </Button>
            </div>
          </div>
        )
        
      case "delivery":
        return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">订单信息</h4>
                <div className="bg-gray-50 p-3 rounded">
                {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    return (
                      <>
                        <p><strong>订单单价：</strong>{yearlyParams.productBasePrice.toLocaleString()} 元</p>
                        <p><strong>违约单价：</strong>{(yearlyParams.productBasePrice * yearlyParams.penaltyRatio / 100).toLocaleString()} 元</p>
                        <p><strong>订单数量：</strong>{orderQuantity} 个</p>
                        <p><strong>交付数量：</strong>{productionQuantity} 个</p>
                        <p><strong>违约数量：</strong>{Math.max(0, orderQuantity - productionQuantity)} 个</p>
                      </>
                    )
                  })()}
                        </div>
                      </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">收入计算</h4>
                <div className="bg-emerald-50 p-3 rounded">
                  {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    const deliveryRevenue = productionQuantity * yearlyParams.productBasePrice
                    const penaltyCost = Math.max(0, orderQuantity - productionQuantity) * (yearlyParams.productBasePrice * yearlyParams.penaltyRatio / 100)
                    const netRevenue = deliveryRevenue - penaltyCost
                    return (
                      <>
                        <p><strong>交付订单收入：</strong>{deliveryRevenue.toLocaleString()} 元</p>
                        <p><strong>违约罚款：</strong>{penaltyCost.toLocaleString()} 元</p>
                        <p><strong>净收入：</strong>{netRevenue.toLocaleString()} 元</p>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
            <div className="flex justify-center">
              <Button onClick={handleDelivery} className="bg-emerald-600 hover:bg-emerald-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                确认交付
              </Button>
            </div>
          </div>
        )
        
      case "carbonSettlement":
                    return (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">碳配额信息</h4>
                <div className="bg-gray-50 p-3 rounded">
                  {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    const carbonAllowance = calculateCarbonAllowance()
                    const actualEmission = productionQuantity * 120000 // 每个产品产生120000 kg碳排放
                    const overEmission = Math.max(0, actualEmission - carbonAllowance)
                    return (
                      <>
                        <p><strong>年初碳配额库存（kg）：</strong>{carbonAllowance.toLocaleString()}</p>
                        <p><strong>年度买入配额（kg）：</strong>0</p>
                        <p><strong>年度卖出配额（kg）：</strong>0</p>
                        <p><strong>年度实际排放（kg）：</strong>{actualEmission.toLocaleString()}</p>
                        <p><strong>年度碳排放超排（kg）：</strong>{overEmission.toLocaleString()}</p>
                        <p><strong>年度核定碳配额（kg）：</strong>{carbonAllowance.toLocaleString()}</p>
                      </>
                    )
                  })()}
                        </div>
                      </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800">费用计算</h4>
                <div className="bg-violet-50 p-3 rounded">
                  {(() => {
                    const yearlyParams = getYearlyParams(currentYear)
                    const carbonAllowance = calculateCarbonAllowance()
                    const actualEmission = productionQuantity * 120000 // 每个产品产生120000 kg碳排放
                    const overEmission = Math.max(0, actualEmission - carbonAllowance)
                    const buyAllowanceCost = overEmission * yearlyParams.allowanceBuyPrice / 1000 // 转换为吨
                    const penaltyCost = overEmission * yearlyParams.overEmissionPenalty / 1000 // 转换为吨
                    return (
                      <>
                        <p><strong>买入配额的费用（元）：</strong>{buyAllowanceCost.toLocaleString()}</p>
                        <p><strong>年度卖出配额收入（元）：</strong>0</p>
                        <p><strong>配额清缴结余（kg）：</strong>{Math.max(0, carbonAllowance - actualEmission).toLocaleString()}</p>
                        <p><strong>超排罚款金额（元）：</strong>{penaltyCost.toLocaleString()}</p>
                      </>
                    )
                })()}
                </div>
              </div>
            </div>
                <div className="flex justify-center">
              <Button onClick={handleCarbonSettlement} className="bg-violet-600 hover:bg-violet-700">
                <ChevronRight className="mr-2 h-4 w-4" />
                {currentYear < 5 ? "完成第" + currentYear + "年，进入下一年" : "完成5年模拟"}
                  </Button>
                </div>
          </div>
        )
        
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* 当前状态概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-blue-600" />
            企业经营状态 - 第{currentYear}年
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">当前步骤</div>
              <div className="text-xl font-bold text-blue-600">{getStepName(currentStep)}</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-500">年度进度</div>
              <div className="text-xl font-bold text-green-600">{currentYear}/5年</div>
            </div>
            {/* 删除步骤进度小方块 */}
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-500">现金资产</div>
              <div className="text-xl font-bold text-orange-600">{cashAsset.toLocaleString()}元</div>
            </div>
            <div className="text-center p-3 bg-lime-50 rounded-lg">
              <div className="text-sm text-gray-500">绿贷现金</div>
              <div className="text-xl font-bold text-lime-600">{greenLoanCash.toLocaleString()}元</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-gray-500">总资产</div>
              <div className="text-xl font-bold text-red-600">{(cashAsset + productionLineAsset).toLocaleString()}元</div>
            </div>
          </div>
          
          {/* 破产状态显示 */}
          {isBankrupt && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-semibold">企业已破产！游戏结束。</span>
            </div>
              <div className="mt-2 text-center">
                <Button onClick={restartSimulation} className="bg-blue-600 hover:bg-blue-700">
                  重新开始经营
                </Button>
          </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 标签页界面 */}
        <Tabs defaultValue="planning" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="planning">年度规划</TabsTrigger>
            <TabsTrigger value="monitoring">实时监控</TabsTrigger>
            <TabsTrigger value="history">历史记录</TabsTrigger>
          </TabsList>

          {/* 年度规划标签页 */}
          <TabsContent value="planning" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-600" />
                第{currentYear}年度经营规划
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
              {/* 进度指示器 */}
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>开启经营年</span>
                  <span>确认期初数据</span>
                  <span>技改计划</span>
                  <span>领取配额</span>
                  <span>碳汇采购</span>
                  <span>选择订单</span>
                  <span>设备改造</span>
                  <span>电力采购</span>
                  <span>物料采购</span>
                  <span>产品生产</span>
                  <span>产品交付</span>
                  <span>配额清缴</span>
                </div>
                <Progress value={getStepProgress()} className="h-2" />
                          </div>
              
              {/* 当前步骤内容 */}
              {renderCurrentStep()}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 实时监控标签页 */}
          <TabsContent value="monitoring" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                  实时经营监控
                </CardTitle>
              </CardHeader>
              <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {/* 当前决策数据 */}
                  <div>
                  <h4 className="font-medium text-gray-800 mb-3">当前决策数据</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                      <span className="text-gray-600">节能技改次数：</span>
                      <span className="font-medium">{energyUpgradeCount} 次</span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-600">减排技改次数：</span>
                      <span className="font-medium">{emissionUpgradeCount} 次</span>
                      </div>
                      <div className="flex justify-between">
                      <span className="text-gray-600">碳汇采购数量：</span>
                      <span className="font-medium">{carbonCreditPurchaseInput.toLocaleString()} kg</span>
                      </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">订单数量：</span>
                      <span className="font-medium">{orderQuantity} 个</span>
                      </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">生产数量：</span>
                      <span className="font-medium">{productionQuantity} 个</span>
                    </div>
                  </div>
                </div>
                
                {/* 资产状态 */}
                    <div>
                  <h4 className="font-medium text-gray-800 mb-3">资产状态</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">现金资产：</span>
                      <span className="font-medium">{cashAsset.toLocaleString()} 元</span>
                          </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">生产线资产：</span>
                      <span className="font-medium">{productionLineAsset.toLocaleString()} 元</span>
                        </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">总资产：</span>
                      <span className="font-medium">{(cashAsset + productionLineAsset).toLocaleString()} 元</span>
                          </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">年度固定成本：</span>
                      <span className="font-medium">{fixedCost.toLocaleString()} 元</span>
                        </div>
                      </div>
                    </div>
                    
                {/* 财务预测 */}
                    <div>
                  <h4 className="font-medium text-gray-800 mb-3">财务预测</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                      <span className="text-gray-600">技改投资：</span>
                      <span className="font-medium">{calculateTotalUpgradeCost().toLocaleString()} 元</span>
                        </div>
                        <div className="flex justify-between">
                      <span className="text-gray-600">碳汇采购：</span>
                      <span className="font-medium">{(carbonCreditPurchaseInput * getYearlyParams(currentYear).carbonCreditPrice).toLocaleString()} 元</span>
                        </div>
                        <div className="flex justify-between">
                      <span className="text-gray-600">电力采购：</span>
                      <span className="font-medium">{calculatePowerCosts().toLocaleString()} 元</span>
                        </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">物料采购：</span>
                      <span className="font-medium">{materialCost.toLocaleString()} 元</span>
                      </div>
                    <div className="flex justify-between border-t pt-2">
                      <span className="text-gray-600">预计收入：</span>
                      <span className="font-medium text-green-600">{(productionQuantity * getYearlyParams(currentYear).productBasePrice).toLocaleString()} 元</span>
                    </div>
                  </div>
                </div>
                      </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 历史记录标签页 */}
          <TabsContent value="history" className="space-y-6">
            <Card>
              <CardHeader>
              <CardTitle>年度经营记录</CardTitle>
              </CardHeader>
              <CardContent>
              {yearlyRecords.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-2">年份</th>
                        <th className="text-left p-2">生产数量</th>
                        <th className="text-left p-2">总收入</th>
                        <th className="text-left p-2">总成本</th>
                        <th className="text-left p-2">年度利润</th>
                        <th className="text-left p-2">现金资产</th>
                          <th className="text-left p-2">碳排放</th>
                        <th className="text-left p-2">碳配额</th>
                        <th className="text-left p-2">配额结余</th>
                        <th className="text-left p-2">配额收入</th>
                        <th className="text-left p-2">配额价值</th>
                        <th className="text-left p-2">碳汇库存</th>
                        <th className="text-left p-2">物料库存</th>
                        <th className="text-left p-2">绿电库存</th>
                        <th className="text-left p-2">煤电库存</th>
                        <th className="text-left p-2">生产线资产</th>
                        <th className="text-left p-2">物料碳排放</th>
                        <th className="text-left p-2">煤电碳排放</th>
                        <th className="text-left p-2">绿电减排</th>
                        <th className="text-left p-2">碳中和</th>
                        <th className="text-left p-2">产品碳标签</th>
                        <th className="text-left p-2">产品碳成本</th>
                        </tr>
                      </thead>
                      <tbody>
                      {yearlyRecords.map((record, index) => (
                          <tr key={index} className="border-b">
                          <td className="p-2">第{record.year}年</td>
                          <td className="p-2">{record.productionQuantity} 个</td>
                          <td className="p-2">{record.totalRevenue.toLocaleString()} 元</td>
                          <td className="p-2">{record.totalCost.toLocaleString()} 元</td>
                          <td className={`p-2 ${record.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {record.yearlyProfit.toLocaleString()} 元
                            </td>
                          <td className="p-2">{record.cashAsset.toLocaleString()} 元</td>
                          <td className="p-2">{record.carbonEmission.toLocaleString()} kg</td>
                          <td className="p-2">{record.carbonAllowance.toLocaleString()} kg</td>
                          <td className="p-2">{record.quotaBalance.toLocaleString()} kg</td>
                          <td className="p-2">{record.quotaIncome.toLocaleString()} 元</td>
                          <td className="p-2">{record.quotaValue.toLocaleString()} 元</td>
                          <td className="p-2">{record.carbonCreditStock.toLocaleString()} kg</td>
                          <td className="p-2">{record.materialStock.toLocaleString()} 包</td>
                          <td className="p-2">{record.greenPowerStock.toLocaleString()} 度</td>
                          <td className="p-2">{record.coalPowerStock.toLocaleString()} 度</td>
                          <td className="p-2">{record.productionLineAsset.toLocaleString()} 元</td>
                          <td className="p-2">{record.materialEmission.toLocaleString()} kg</td>
                          <td className="p-2">{record.coalPowerEmission.toLocaleString()} kg</td>
                          <td className="p-2">{record.greenPowerReduction.toLocaleString()} kg</td>
                          <td className="p-2">{record.carbonNeutralized.toLocaleString()} kg</td>
                          <td className="p-2">{record.productCarbonLabel.toFixed(2)} kg/个</td>
                          <td className="p-2">{record.productCarbonCost.toLocaleString()} 元/个</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">暂无经营记录</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* 控制按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回设置
        </Button>
          
          <Button 
            onClick={onNext} 
            className="bg-green-600 hover:bg-green-700"
          disabled={currentYear < 5 || currentStep !== "carbonSettlement"}
          >
            查看结果分析
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
      </div>
    </div>
  )
  
  // 计算步骤进度
  function getStepProgress(): number {
    const steps: SimulationStep[] = [
      "start", "confirmInitialData", "techUpgradePlan", "getCarbonAllowance",
      "carbonCreditPurchase", "orderSelection", "equipmentUpgrade", "powerPurchase",
      "materialPurchase", "production", "delivery", "carbonSettlement"
    ]
    const currentIndex = steps.indexOf(currentStep)
    return ((currentIndex + 1) / steps.length) * 100
  }

  // 计算步骤进度（分数形式）
  function getStepProgressFraction(): string {
    const steps: SimulationStep[] = [
      "start", "confirmInitialData", "techUpgradePlan", "getCarbonAllowance",
      "carbonCreditPurchase", "orderSelection", "equipmentUpgrade", "powerPurchase",
      "materialPurchase", "production", "delivery", "carbonSettlement"
    ]
    const currentIndex = steps.indexOf(currentStep)
    const totalSteps = steps.length
    return `${currentIndex + 1}/${totalSteps}`
  }
  
  // 获取步骤名称
  function getStepName(step: SimulationStep): string {
    const stepNames: Record<SimulationStep, string> = {
      start: "开启经营年",
      confirmInitialData: "确认期初数据",
      techUpgradePlan: "技改计划",
      getCarbonAllowance: "领取配额",
      carbonCreditPurchase: "碳汇采购",
      orderSelection: "选择订单",
      equipmentUpgrade: "设备改造",
      powerPurchase: "电力采购",
      materialPurchase: "物料采购",
      production: "产品生产",
      delivery: "产品交付",
      carbonSettlement: "配额清缴"
    }
    return stepNames[step]
  }
} 