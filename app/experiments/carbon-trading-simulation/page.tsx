"use client"

import { useState, useEffect } from "react"
import { Stepper } from "@/components/experiment-stepper"
import { Toaster } from "@/components/ui/toaster"
import {
  IntroductionStep,
  SimulationSetupStep,
  SimulationRunStep,
  ResultAnalysisStep,
  ESGReportStep,
  ExperimentStep,
  SimulationData,
  CompanyState,
  MarketData
} from "./components"

export default function CarbonTradingSimulationPage() {
  // 使用数字索引来匹配 Stepper 组件的接口
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  // 检查是否有需要恢复的实验数据
  useEffect(() => {
    const savedData = localStorage.getItem('carbonTradingSimulationData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        console.log("恢复实验数据:", parsedData);

        // 将数据转换为页面需要的格式
        const restoredYearlyRecords = parsedData.yearlyRecords || [];
        const restoredUpgradeHistory = parsedData.upgradeHistory || [];

        // 设置年度记录和升级历史
        setYearlyRecords(restoredYearlyRecords);
        setUpgradeHistory(restoredUpgradeHistory);

        // 直接跳转到ESG报告页面
        setCurrentStepIndex(4); // ESG报告是第5步，索引为4

        // 清除localStorage中的数据
        localStorage.removeItem('carbonTradingSimulationData');
      } catch (error) {
        console.error("恢复实验数据失败:", error);
        localStorage.removeItem('carbonTradingSimulationData');
      }
    }
  }, []);
  
  // 定义步骤配置
  const steps = [
    { title: "实验介绍", description: "了解企业碳管理经营模拟" },
    { title: "模拟设置", description: "初始化企业状态和市场环境" },
    { title: "经营模拟", description: "进行5年企业经营决策" },
    { title: "结果分析", description: "分析经营结果和碳管理效果" },
    { title: "ESG报告", description: "生成企业ESG绩效报告" }
  ]

  // 步骤名称映射
  const stepNames: ExperimentStep[] = ["intro", "setup", "simulation", "analysis", "esg"]
  const currentStep = stepNames[currentStepIndex]

  // 初始化企业状态
  const initialCompanyState: CompanyState = {
    funds: 10, // 10M初始资金
    rawMaterialInventory: 10,
    productInventory: 10,
    baseProductionCapacity: 10,
    productionUpgrades: {
      energy: 0,
      emission: 0
    },
    currentEnergyPerUnit: 10,
    currentEmissionPerUnit: 10,
    activeOrders: [],
    completedOrders: [],
    quarterlyRecords: [],
    upgradeHistory: [],
    carbonAllowances: [
      { year: 1, allowance: 30, used: 0, traded: 0, tradingCost: 0 },
      { year: 2, allowance: 25, used: 0, traded: 0, tradingCost: 0 },
      { year: 3, allowance: 20, used: 0, traded: 0, tradingCost: 0 },
      { year: 4, allowance: 15, used: 0, traded: 0, tradingCost: 0 },
      { year: 5, allowance: 10, used: 0, traded: 0, tradingCost: 0 }
    ],
    currentYear: 1,
    currentQuarter: 1,
    gameOver: false
  }

  // 初始化市场数据
  const initialMarketData: MarketData = {
    carbonPrice: 1, // 1M每单位碳配额
    yearlyAllowances: [30, 25, 20, 15, 10],
    availableSaleOrders: [],
    availablePurchaseOrders: []
  }

  // 模拟数据状态
  const [simulationData, setSimulationData] = useState<SimulationData>({
    companyState: initialCompanyState,
    marketData: initialMarketData,
    annualPlans: []
  })

  // 年度历史记录和升级历史记录提升到主页面
  const [yearlyRecords, setYearlyRecords] = useState<any[]>([])
  const [upgradeHistory, setUpgradeHistory] = useState<any[]>([])

  // 处理步骤变更
  const handleStepChange = (stepIndex: number) => {
    // 如果是最后一步的"完成实验"按钮
    if (stepIndex >= steps.length) {
      console.log("实验完成！")
      return
    }
    setCurrentStepIndex(stepIndex)
  }

  // 更新模拟数据
  const updateSimulationData = (newData: Partial<SimulationData>) => {
    setSimulationData((prev: SimulationData) => ({ ...prev, ...newData }))
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* 页面标题 */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">企业碳管理经营模拟</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          模拟生产型企业5年经营过程，体验碳配额管理、产线升级和订单决策的综合挑战
        </p>
      </div>

      {/* 使用自定义 Stepper 组件 */}
      <Stepper 
        steps={steps}
        currentStep={currentStepIndex}
        onStepChange={handleStepChange}
      />

      {/* 步骤内容 */}
      <div className="max-w-6xl mx-auto">
        {/* 第一步：实验介绍 */}
        {currentStep === "intro" && (
          <IntroductionStep
            onNext={() => setCurrentStepIndex(1)}
          />
        )}

        {/* 第二步：模拟设置 */}
        {currentStep === "setup" && (
          <SimulationSetupStep
            simulationData={simulationData}
            onDataUpdate={updateSimulationData}
            onNext={() => setCurrentStepIndex(2)}
            onPrevious={() => setCurrentStepIndex(0)}
          />
        )}

        {/* 第三步：经营模拟 */}
        {currentStep === "simulation" && (
          <SimulationRunStep
            simulationData={simulationData}
            onDataUpdate={updateSimulationData}
            onNext={() => setCurrentStepIndex(3)}
            onPrevious={() => setCurrentStepIndex(1)}
            yearlyRecords={yearlyRecords}
            setYearlyRecords={setYearlyRecords}
            upgradeHistory={upgradeHistory}
            setUpgradeHistory={setUpgradeHistory}
          />
        )}

        {/* 第四步：结果分析 */}
        {currentStep === "analysis" && (
          <ResultAnalysisStep
            simulationData={simulationData}
            onPrevious={() => setCurrentStepIndex(2)}
            onComplete={() => setCurrentStepIndex(4)}
            yearlyRecords={yearlyRecords}
            upgradeHistory={upgradeHistory}
          />
        )}

        {/* 第五步：ESG报告 */}
        {currentStep === "esg" && (
          <ESGReportStep
            simulationData={simulationData}
            onPrevious={() => setCurrentStepIndex(3)}
            onComplete={() => console.log("实验完成")}
            yearlyRecords={yearlyRecords}
            upgradeHistory={upgradeHistory}
          />
        )}
      </div>
      <Toaster />
    </div>
  )
} 