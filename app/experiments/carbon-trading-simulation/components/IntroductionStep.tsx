import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Factory, TrendingUp, Calendar, Target, DollarSign, Zap, Globe, Brain, Settings, BarChart3, Shield, Lightbulb } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

interface IntroductionStepProps {
  onNext: () => void
}

export function IntroductionStep({ onNext }: IntroductionStepProps) {
  return (
    <div className="space-y-8">
      {/* 实验背景 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-6 w-6 text-blue-600" />
            实验背景
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700 leading-relaxed">
            中国政府高度重视应对气候变化工作，把应对气候变化作为推进生态文明建设、实现高质量发展的重要抓手，持续实施积极应对气候变化国家战略，采取一系列政策和措施，力争二氧化碳排放于 2030 年前达到峰值，努力争取2060 年前实现碳中和（"双碳"目标）。在全球气候变化的背景下，碳排放权交易作为一种市场化的减排机制，越来越受到各国政府和企业的重视。本实验旨在通过模拟碳排放权交易市场，帮助学生理解碳市场的运作机制，掌握碳资产管理的相关知识和技能。
          </p>
        </CardContent>
      </Card>

      {/* 实验概述 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-green-600" />
            实验目的
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg text-gray-700">
            本实验模拟一个生产型企业5年的经营过程，帮助学习者：
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-green-800 mb-2">掌握基本原理</h4>
              <p className="text-sm text-gray-600">掌握碳交易市场原理和运作机制</p>
            </div>
            
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-blue-800 mb-2">碳资产管理</h4>
              <p className="text-sm text-gray-600">学习如何进行碳资产的买卖和管理</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-4 rounded-lg border border-purple-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-purple-800 mb-2">分析决策能力</h4>
              <p className="text-sm text-gray-600">提高数据分析和决策制定能力</p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-4 rounded-lg border border-orange-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-orange-800 mb-2">实操技能</h4>
              <p className="text-sm text-gray-600">通过仿真实训，增强实际操作技能</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 学习要点 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-green-700">💡 学习要点</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-medium">（1）</span>
              <span>理解新发展理念、双碳目标等内涵，熟悉绿贷政策、绿电证书等工具的作用。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-medium">（2）</span>
              <span>掌握范围一、二、三排放的核算边界与方法，为碳成本测算和配额管理打基础。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-medium">（3）</span>
              <span>明晰碳配额机制，学会利用碳价规律和交易策略，通过调整生产优化碳排放以降低履约成本。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-medium">（4）</span>
              <span>认识碳成本对经营全流程的影响，学会通过数据分析平衡 "降碳" 与 "盈利"。</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="text-green-600 mt-1 font-medium">（5）</span>
              <span>关注供应链低碳化，兼顾上下游碳排放管控，应对国际贸易中的碳关税等要求。</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* 企业初始状态 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="border-blue-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600" />
              战略思维
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-200">
                <div className="w-6 h-6 bg-blue-300 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <div>
                  <h4 className="font-medium text-blue-600 mb-1">全局平衡思维</h4>
                  <p className="text-sm text-gray-600">平衡短期盈利与长期低碳转型，避免单一目标偏差。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-300">
                <div className="w-6 h-6 bg-blue-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <div>
                  <h4 className="font-medium text-blue-700 mb-1">前瞻性布局思维</h4>
                  <p className="text-sm text-gray-600">预判碳价、绿电趋势，提前规划生产与供应链降低转型成本。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <div>
                  <h4 className="font-medium text-blue-800 mb-1">系统协同思维</h4>
                  <p className="text-sm text-gray-600">整合生产、能源、供应链多环节，权衡降碳与成本关系。</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">思维成熟度</span>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">高级</Badge>
              </div>
              <Progress value={85} className="h-2 [&>div]:bg-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-6 w-6 text-purple-600" />
              实操技能
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-200">
                <div className="w-6 h-6 bg-purple-300 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                <div>
                  <h4 className="font-medium text-purple-600 mb-1">
                    数据驱动决策能力
                  </h4>
                  <p className="text-sm text-gray-600">基于数据核算碳成本，预测决策对排放和利润的影响。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-300">
                <div className="w-6 h-6 bg-purple-400 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                <div>
                  <h4 className="font-medium text-purple-700 mb-1">
                    碳管理实操能力
                  </h4>
                  <p className="text-sm text-gray-600">掌握碳核算、配额交易与成本控制，形成管理闭环。</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-400">
                <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                <div>
                  <h4 className="font-medium text-purple-800 mb-1">
                    资源优化配置技能
                  </h4>
                  <p className="text-sm text-gray-600">在有限资金下，结合政策工具实现资源最大化利用。</p>
                </div>
                </div>
              
              <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border-l-4 border-purple-500">
                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">4</div>
                <div>
                  <h4 className="font-medium text-purple-900 mb-1">
                    风险应对技能
                  </h4>
                  <p className="text-sm text-gray-600">快速响应碳价、超排等突发情况，及时调整策略解决问题。</p>
                </div>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-600">技能掌握度</span>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">高级</Badge>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 开始实验按钮 */}
      <div className="flex justify-center pt-6">
        <Button 
          onClick={onNext}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3"
        >
          开始模拟经营
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
      </div>
    </div>
  )
} 