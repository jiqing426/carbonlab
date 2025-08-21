import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Info, Target, BookOpen, TrendingUp, Calculator } from "lucide-react"
import { ExperimentStep } from "./types"

interface IntroductionStepProps {
  onComplete: () => void
  onNext: (step: ExperimentStep) => void
}

export function IntroductionStep({ onComplete, onNext }: IntroductionStepProps) {
  return (
    <div className="space-y-6">
      {/* 页面标题区域 */}
      <div className="text-center space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">实验介绍</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          了解交通基础设施碳核算的基本概念和实验流程
        </p>
      </div>

      {/* 实验介绍内容 */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50">
        <CardContent className="space-y-8 p-8">
          {/* 实验背景和目标 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 实验背景 */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border-l-4 border-blue-400 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">01</span>
                </div>
                <h3 className="text-xl font-semibold text-blue-800">实验背景</h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                交通基础设施建设是国民经济发展的重要支撑，但同时也是碳排放的重要来源。
                随着"双碳"目标的提出，交通基础设施的碳核算成为行业关注的焦点。
                通过本实验，学生将掌握碳核算的核心方法，为未来从事相关工作奠定基础。
              </p>
            </div>
            
            {/* 实验目标 */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-2xl border-l-4 border-green-500 shadow-lg">
              <div className="flex items-center mb-4">
                <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center mr-3">
                  <span className="text-sm font-bold">02</span>
                </div>
                <h3 className="text-xl font-semibold text-green-800">实验目标</h3>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>掌握交通基础设施碳核算的基本方法</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>了解建设过程中各环节的碳排放特征</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>学会使用碳核算工具进行实际计算</span>
                </li>
                <li className="flex items-start">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                  <span>分析碳排放结构，提出减排建议</span>
                </li>
              </ul>
            </div>
          </div>

          {/* 实验流程 */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-2xl border-l-4 border-purple-500 shadow-lg">
            <div className="flex items-center mb-6">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center mr-3">
                <span className="text-sm font-bold">03</span>
              </div>
              <h3 className="text-xl font-semibold text-purple-800">实验流程</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-blue-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">第一步：工程清单内容</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  建立详细的工程量清单，包括土方、混凝土、钢材等各类材料用量和施工工序
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-green-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">第二步：碳核算</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  分别计算材料生产阶段、材料运输阶段、施工建设阶段、竣工交付阶段四个方面的碳排放
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-purple-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <TrendingUp className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">第三步：结果分析</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  分析碳排放结构，识别主要排放源，提出针对性的减排建议和优化方案
                </p>
              </div>
              
              <div className="bg-white/70 backdrop-blur-sm p-6 rounded-xl border border-white/50 shadow-sm hover:shadow-md transition-all duration-300">
                <div className="flex items-center mb-3">
                  <div className="w-10 h-10 bg-orange-500 text-white rounded-lg flex items-center justify-center mr-3">
                    <Target className="w-5 h-5" />
                  </div>
                  <h4 className="font-semibold text-gray-800">第四步：实验报告</h4>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  生成完整的实验报告，包含核算结果、分析结论和减排建议，支持导出和分享
                </p>
              </div>
            </div>
          </div>

          {/* 开始实验按钮 */}
          <div className="text-center pt-4">
            <Button 
              onClick={() => onNext("inventory")}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
            >
              开始实验
              <TrendingUp className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 