"use client"

import { useState } from "react"
import { Stepper } from "@/components/experiment-stepper"
import {
  ExperimentStep,
  CarbonCalculationData,
  CalculationResults,
  IntroductionStep,
  InventoryStep,
  CalculationStep,
  ReportStep,
  calculateEmissions
} from "./components"

export default function TransportInfrastructureCarbonPage() {
  // 使用数字索引来匹配 Stepper 组件的接口
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  
  // 定义步骤配置
  const steps = [
    { title: "实验介绍", description: "了解实验背景和目标" },
    { title: "工程清单内容", description: "查看项目工程量数据" },
    { title: "碳核算", description: "计算各类碳排放" },
    { title: "实验报告", description: "查看结果和分析" }
  ]

  // 步骤名称映射
  const stepNames: ExperimentStep[] = ["intro", "inventory", "calculation", "report"]
  const currentStep = stepNames[currentStepIndex]

  // 静态项目数据（用于报告生成）
  const projectName = "某市生态城道路建设项目"
  const projectDescription = "项目描述：该项目为某市生态城道路建设工程，道路全长445.617m，红线宽40m，设计速度30km/h，机动车道采用双向四车道建设。健康谷路为兼有有轨电车的道，横断面具体布置为中央12米绿化带（远期有轨电车廊道）+2×7米机动车道+2×1.5米下沉式绿化带+2×2.5米非机动车道+2×3米人行道。有轨电车廊道实施前控制为绿化带。健康谷路全线采用沥青路面，路面总厚度90.6cm，路建结构方案为改性沥青混凝土面层+水泥稳定碎石基层+低剂量水泥稳定碎石底基层。"

  // 碳核算数据
  const [carbonData, setCarbonData] = useState<CarbonCalculationData>({
    labor: [],
    transport: [],
    materials: [],
    energy: [],
    temporary: [],
    waste: [],
    carbonSink: []
  })

  const [calculationResults, setCalculationResults] = useState<CalculationResults | null>(null)

  // 处理步骤变更
  const handleStepChange = (stepIndex: number) => {
    // 如果是最后一步的"完成实验"按钮
    if (stepIndex >= steps.length) {
      console.log("实验完成！")
      // 这里可以添加实验完成后的逻辑，比如跳转到其他页面
      return
    }
    setCurrentStepIndex(stepIndex)
  }

  // 更新碳核算数据
  const updateCarbonData = (newData: CarbonCalculationData) => {
    setCarbonData(newData)
  }

  // 计算碳排放
  const handleCalculateEmissions = () => {
    const results = calculateEmissions(carbonData)
    setCalculationResults(results)
  }

  // 下载报告
  const handleDownloadReport = () => {
    // 这里可以实现报告下载逻辑
    console.log("下载报告")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto py-8 space-y-8">
        {/* 页面标题 - 优化后的样式 */}
        <div className="text-center space-y-6">
          <div className="relative">
            <h1 className="text-5xl font-bold text-gray-800">
              交通基础设施碳核算实验
            </h1>
          </div>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            通过实际案例学习交通基础设施建设项目的全生命周期碳排放核算方法，
            掌握碳足迹计算的核心技能
          </p>
          
          {/* 实验特色标签 */}
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border border-blue-200">
              🏗️ 全生命周期核算
            </span>
            <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium border border-green-200">
              📊 数据驱动分析
            </span>
            <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-full text-sm font-medium border border-purple-200">
              🎯 实践导向学习
            </span>
            <span className="px-4 py-2 bg-orange-100 text-orange-800 rounded-full text-sm font-medium border border-orange-200">
              📈 实时计算结果
            </span>
          </div>
        </div>

        {/* 使用自定义 Stepper 组件 */}
        <div className="max-w-6xl mx-auto">
          <Stepper 
            steps={steps}
            currentStep={currentStepIndex}
            onStepChange={handleStepChange}
          />
        </div>

        {/* 步骤内容 */}
        <div className="max-w-6xl mx-auto">
          {/* 第一步：实验介绍 */}
          {currentStep === "intro" && (
            <IntroductionStep
              onComplete={() => {}}
              onNext={() => setCurrentStepIndex(1)}
            />
          )}

          {/* 第二步：工程清单内容 */}
          {currentStep === "inventory" && (
            <InventoryStep
              onComplete={() => {}}
              onNext={() => setCurrentStepIndex(2)}
              onPrevious={() => setCurrentStepIndex(0)}
            />
          )}

          {/* 第三步：碳核算 */}
          {currentStep === "calculation" && (
            <CalculationStep
              carbonData={carbonData}
              calculationResults={calculationResults}
              onDataUpdate={updateCarbonData}
              onCalculate={handleCalculateEmissions}
              onNext={() => setCurrentStepIndex(3)}
              onPrevious={() => setCurrentStepIndex(1)}
            />
          )}

          {/* 第四步：实验报告 */}
          {currentStep === "report" && calculationResults && (
            <ReportStep
              projectName={projectName}
              projectDescription={projectDescription}
              calculationResults={calculationResults}
              onComplete={() => {}}
              onPrevious={() => setCurrentStepIndex(2)}
              onDownloadReport={handleDownloadReport}
            />
          )}
        </div>
      </div>
    </div>
  )
} 