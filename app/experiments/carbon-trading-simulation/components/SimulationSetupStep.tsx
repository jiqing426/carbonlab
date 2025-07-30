import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Settings, Info, ChevronDown, ChevronUp } from "lucide-react"
import { SimulationData } from "./index"
import { useState } from "react"

interface SimulationSetupStepProps {
  simulationData: SimulationData
  onDataUpdate: (data: Partial<SimulationData>) => void
  onNext: () => void
  onPrevious: () => void
}

export function SimulationSetupStep({ simulationData, onDataUpdate, onNext, onPrevious }: SimulationSetupStepProps) {
  const { companyState, marketData } = simulationData
  
  // 管理每个板块的展开/收叠状态
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    // 经营决策要素的展开状态
    production: false,    // 生产线参数
    finance: false,       // 年度财务参数
    government: false,    // 政府管理参数
    carbon: false,        // 碳交易市场
    material: false,      // 原材料供应市场
    customer: false,      // 客户产品市场
    power: false,         // 电力供应市场
    tech: false,          // 技改服务市场
    // 重要规则的展开状态
    assets: false,        // 资产类规则
    productionRules: false, // 生产类规则
  })

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  return (
    <div className="space-y-6">
      {/* 企业状态确认 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-blue-600" />
            企业初始状态设置
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-gray-800 mb-2">现金</h4>
              <p className="text-2xl font-bold text-green-600">1,500,000 元</p>
                </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-gray-800 mb-2">生产线资产</h4>
              <p className="text-2xl font-bold text-blue-600">1,000,000 元</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-md transition-shadow text-center">
              <h4 className="font-medium text-gray-800 mb-2">年度固定成本</h4>
              <p className="text-2xl font-bold text-purple-600">150,000 元</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 碳配额计划 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-green-600" />
            碳配额限制
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 计算步骤 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 text-lg">计算步骤：</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex flex-col justify-center">
                  <h5 className="font-bold text-gray-800 mb-2">生产线耗电碳排放</h5>
                  <p className="text-sm text-gray-700 mb-2">生产线耗电（度/季度）× 煤电碳排放（kg/度）× 4 = 年度生产线耗电碳排放（kg）</p>
                  <p className="text-lg font-bold text-gray-800">80,000 × 1 × 4 = 320,000</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex flex-col justify-center">
                  <h5 className="font-bold text-gray-800 mb-2">生产线碳排放</h5>
                  <p className="text-sm text-gray-700 mb-2">生产线碳排放（kg/季度）× 4 = 年度生产线碳排放（kg）</p>
                  <p className="text-lg font-bold text-gray-800">120,000 × 4 = 480,000</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex flex-col justify-center">
                  <h5 className="font-bold text-gray-800 mb-2">物料碳排放</h5>
                  <p className="text-sm text-gray-700 mb-2">每季度产能耗料（包）× 每包物料碳排放（kg）× 4 = 年度物料碳排放（kg）</p>
                  <p className="text-lg font-bold text-gray-800">10 × 8,000 × 4 = 320,000</p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 h-32 flex flex-col justify-center">
                  <h5 className="font-bold text-gray-800 mb-2">年度合计碳排放</h5>
                  <p className="text-sm text-gray-700 mb-2">合计年度合计碳排放（kg）：</p>
                  <p className="text-2xl font-bold text-gray-800">1,120,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* 各年度碳配额 */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800 text-lg">各年度碳配额占比和核定配额（kg）：</h4>
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center">
                <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-3">
                  <div className="text-sm text-gray-800 mb-1">第一年</div>
                  <div className="text-xl font-bold text-red-600">75.00%</div>
                  <div className="text-base font-medium text-red-700">840,000.00 kg</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-3">
                  <div className="text-sm text-gray-800 mb-1">第二年</div>
                  <div className="text-xl font-bold text-orange-600">65.00%</div>
                  <div className="text-base font-medium text-orange-700">728,000.00 kg</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-3">
                  <div className="text-sm text-gray-800 mb-1">第三年</div>
                  <div className="text-xl font-bold text-yellow-600">55.00%</div>
                  <div className="text-base font-medium text-yellow-700">616,000.00 kg</div>
                </div>
              </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-3">
                  <div className="text-sm text-gray-800 mb-1">第四年</div>
                  <div className="text-xl font-bold text-blue-600">45.00%</div>
                  <div className="text-base font-medium text-blue-700">504,000.00 kg</div>
                </div>
                  </div>
              
              <div className="text-center">
                <div className="bg-yellow-50 border-yellow-200 border rounded-lg p-3">
                  <div className="text-sm text-gray-800 mb-1">第五年</div>
                  <div className="text-xl font-bold text-green-600">30.00%</div>
                  <div className="text-base font-medium text-green-700">336,000.00 kg</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>提示：</strong>碳配额逐年递减，企业需要通过产线升级降低碳排放，或在年底通过碳交易市场购买额外配额。
              碳配额价格固定为 {marketData.carbonPrice}M/单位。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 经营决策要素 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-purple-600" />
            经营决策要素
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 表格头部 */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">参数类别</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">第1年</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">第2年</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">第3年</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">第4年</th>
                    <th className="border border-gray-300 px-4 py-2 text-center font-bold text-gray-800 w-1/6">第5年</th>
                  </tr>
                </thead>
              </table>
            </div>

            {/* 生产线参数 */}
            <Card className="border-blue-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('production')}
                >
                  <CardTitle className="text-blue-800 text-lg">生产线参数</CardTitle>
                  {expandedSections.production ? (
                    <ChevronUp className="h-5 w-5 text-blue-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-blue-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.production && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">产能 (个/季度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">耗料 (包/季度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">耗电 (度/季度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">80,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">碳排放 (kg/季度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">120,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 年度财务参数 */}
            <Card className="border-green-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('finance')}
                >
                  <CardTitle className="text-green-800 text-lg">年度财务参数</CardTitle>
                  {expandedSections.finance ? (
                    <ChevronUp className="h-5 w-5 text-green-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-green-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.finance && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">现金 (元)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1,500,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">生产线资产 (元)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1,000,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                          <td className="border border-gray-300 px-4 py-2 text-center text-gray-500">-</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">年度固定成本 (元)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 政府管理参数 */}
            <Card className="border-purple-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('government')}
                >
                  <CardTitle className="text-purple-800 text-lg">政府管理参数</CardTitle>
                  {expandedSections.government ? (
                    <ChevronUp className="h-5 w-5 text-purple-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-purple-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.government && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">碳配额占比 (%)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">75</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">65</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">55</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">45</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">30</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 碳交易市场 */}
            <Card className="border-orange-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('carbon')}
                >
                  <CardTitle className="text-orange-800 text-lg">碳交易市场</CardTitle>
                  {expandedSections.carbon ? (
                    <ChevronUp className="h-5 w-5 text-orange-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-orange-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.carbon && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">配额买入定价 (元/吨)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">100</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">150</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">400</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">碳汇卖出定价 (元/吨)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">50</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">100</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">180</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">350</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">超排罚款定价 (元/吨)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">500</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1,800</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">5,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10,000</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 原材料供应市场 */}
            <Card className="border-red-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('material')}
                >
                  <CardTitle className="text-red-800 text-lg">原材料供应市场</CardTitle>
                  {expandedSections.material ? (
                    <ChevronUp className="h-5 w-5 text-red-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.material && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">原材料单价 (元/包)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">2,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">2,400</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">2,800</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">3,200</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">3,600</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">碳排放量 (kg/包)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">8,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">6,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">3,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">500</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 客户产品市场 */}
            <Card className="border-indigo-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('customer')}
                >
                  <CardTitle className="text-indigo-800 text-lg">客户产品市场</CardTitle>
                  {expandedSections.customer ? (
                    <ChevronUp className="h-5 w-5 text-indigo-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-indigo-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.customer && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">产品基准单价 (元/个)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">30,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">35,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">40,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">45,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">50,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">违约罚款比例 (%)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">40</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">60</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">80</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">100</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 电力供应市场 */}
            <Card className="border-teal-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('power')}
                >
                  <CardTitle className="text-teal-800 text-lg">电力供应市场</CardTitle>
                  {expandedSections.power ? (
                    <ChevronUp className="h-5 w-5 text-teal-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-teal-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.power && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">绿电单价 (元/度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.2</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.44</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.56</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.68</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.8</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">绿电减排量 (kg/度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">0</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">煤电单价 (元/度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.2</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.3</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.4</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1.5</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">煤电碳排放 (kg/度)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">1</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">绿电占总电比例 (%)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">16</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">20</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">25</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">50</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">80</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>

            {/* 技改服务市场 */}
            <Card className="border-yellow-200">
              <CardHeader className="pb-3">
                <div 
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleSection('tech')}
                >
                  <CardTitle className="text-yellow-800 text-lg">技改服务市场</CardTitle>
                  {expandedSections.tech ? (
                    <ChevronUp className="h-5 w-5 text-yellow-600" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-yellow-600" />
                  )}
                </div>
              </CardHeader>
              {expandedSections.tech && (
                <CardContent className="pt-0">
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">节能技改费用 (元/次)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">250,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">能耗降低 (%) 1次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">10</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">能耗降低 (%) 2次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">能耗降低 (%) 3次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">19</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">19</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">19</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">19</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">19</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">能耗降低 (%) 4次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">21</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">21</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">21</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">21</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">21</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">减排技改费用 (元/次)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200,000</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">200,000</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">排放降低 (%) 1次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">15</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">排放降低 (%) 2次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">23</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">23</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">23</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">23</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">23</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">排放降低 (%) 3次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">29</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">29</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">29</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">29</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">29</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 text-gray-700">排放降低 (%) 4次</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">32</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">32</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">32</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">32</td>
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">32</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* 模拟流程 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5 text-indigo-600" />
            模拟流程
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* 流程图 */}
            <div className="flex flex-wrap items-center gap-3 justify-center">
              <div className="bg-blue-100 border-2 border-blue-300 rounded-lg px-4 py-3 text-center font-bold text-blue-800 h-20 flex items-center justify-center">开启经营年</div>
              <div className="text-blue-600 font-bold">→</div>
              <div className="bg-green-100 border-2 border-green-300 rounded-lg px-4 py-3 text-center font-bold text-green-800 h-20 flex items-center justify-center">确认期初数据</div>
              <div className="text-green-600 font-bold">→</div>
              <div className="bg-purple-100 border-2 border-purple-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-purple-800">技改计划</div>
                <div className="text-xs text-purple-700">①节能技改/减排技改</div>
                <div className="text-xs text-purple-700">②技改次数（金额）</div>
              </div>
              <div className="text-purple-600 font-bold">→</div>
              <div className="bg-orange-100 border-2 border-orange-300 rounded-lg px-4 py-3 text-center font-bold text-orange-800 h-20 flex items-center justify-center">领取年度核定配额</div>
              <div className="text-orange-600 font-bold">→</div>
              <div className="bg-red-100 border-2 border-red-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-red-800">碳汇采购</div>
                <div className="text-xs text-red-700">①采购数量</div>
                <div className="text-xs text-red-700">②碳汇卖出单价</div>
                <div className="text-xs text-red-700">③碳汇采购金额</div>
              </div>
              <div className="text-red-600 font-bold">→</div>
              <div className="bg-indigo-100 border-2 border-indigo-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-indigo-800">选择订单</div>
                <div className="text-xs text-indigo-700">①订单数量</div>
                <div className="text-xs text-indigo-700">②订单单价</div>
                <div className="text-xs text-indigo-700">③违约罚款（元/个）</div>
              </div>
              <div className="text-indigo-600 font-bold">→</div>
              <div className="bg-teal-100 border-2 border-teal-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-teal-800">设备改造</div>
                <div className="text-xs text-teal-700">①节能技改次数</div>
                <div className="text-xs text-teal-700">②减排技改次数</div>
              </div>
              <div className="text-teal-600 font-bold">→</div>
              <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-yellow-800">电力采购</div>
                <div className="text-xs text-yellow-700">①绿电证书购买数量</div>
                <div className="text-xs text-yellow-700">②购买总电力</div>
              </div>
              <div className="text-yellow-600 font-bold">→</div>
              <div className="bg-pink-100 border-2 border-pink-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-pink-800">物料采购</div>
                <div className="text-xs text-pink-700">采购数量</div>
              </div>
              <div className="text-pink-600 font-bold">→</div>
              <div className="bg-cyan-100 border-2 border-cyan-300 rounded-lg px-4 py-3 text-center h-20 flex flex-col items-center justify-center">
                <div className="font-bold text-cyan-800">产品生产</div>
                <div className="text-xs text-cyan-700">生产数量</div>
              </div>
              <div className="text-cyan-600 font-bold">→</div>
              <div className="bg-emerald-100 border-2 border-emerald-300 rounded-lg px-4 py-3 text-center font-bold text-emerald-800 h-20 flex items-center justify-center">产品交付</div>
              <div className="text-emerald-600 font-bold">→</div>
              <div className="bg-violet-100 border-2 border-violet-300 rounded-lg px-4 py-3 text-center font-bold text-violet-800 h-20 flex items-center justify-center">配额清缴</div>
            </div>
            {/* 说明文字 */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>流程说明：</strong>每个经营年度按照上述流程进行决策，每个步骤都需要根据市场情况和企业状况做出相应的选择。
                流程中的每个环节都会影响企业的碳排放、成本和收益，需要综合考虑各种因素做出最优决策。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 游戏规则提醒 */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-700">⚠️ 重要规则说明</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 资产类规则 */}
          <Card className="border-orange-200">
            <CardHeader className="pb-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('assets')}
              >
                <CardTitle className="text-orange-800 text-lg">📊 资产类规则</CardTitle>
                {expandedSections.assets ? (
                  <ChevronUp className="h-5 w-5 text-orange-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-orange-600" />
                )}
              </div>
            </CardHeader>
            {expandedSections.assets && (
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">1. 现金资产</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>现金（万）：</strong>首年期初固定（例：50万），随经营过程变化。业务收入包括产品销售和配额卖出。</p>
                    <p><strong>绿贷现金（万）：</strong>首年可做绿贷（例如150万，5年期，利率1.5%），其余年不提供。绿贷现金仅可用于支付绿色技术改造费用和绿贷还款，不得用于采购物料等生产经营用途。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">2. 生产线资产</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>生产线资产（万）：</strong>技术改造投入包括节能技改和减排技改两类。技改资金投入可用绿贷或自有现金。生产线的碳排放参与当年的产品碳排放计算。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">3. 碳配额资产</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>碳配额资产数量（吨）：</strong>每年年初政府发放配额，年底清缴配额后，剩余的碳配额可进行交易。</p>
                    <p><strong>碳配额资产价值（万）：</strong>库存碳配额价值的核算，按当年卖给碳市场的价格进行计算。</p>
                    <p><strong>碳配额交易：</strong>交易方式有三种：【系统卖出】、【协议转让】、【放弃交易】。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">4. 碳汇资产</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>碳汇资产数量（吨）：</strong>产品交付需要用等量碳汇实现中和。每年可到碳汇市场采购碳汇，碳汇价格逐年上升。</p>
                    <p><strong>碳汇资产价值（万）：</strong>库存碳汇的价值核算，按当年碳汇采购价计算。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">5. 库存物料</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>物料采购（包）：</strong>产品生产需要消耗物料，比例为1:1。每年可到物料市场采购，物料具有碳排放。</p>
                    <p><strong>库存物料价值（万）：</strong>各年物料价格呈现上升趋势，物料的碳排放呈现下降趋势。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">6. 库存绿电</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>绿电采购（度）：</strong>绿电证书：购电需要先购买【绿电证书】，一个绿电证书等于1000度绿电。每年可到电力市场采购，绿电和煤电按照配比采购。</p>
                    <p><strong>库存绿电价值（万）：</strong>生产消耗规则是优先消耗绿电，并且是优先消耗年初库存绿电。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">7. 库存煤电</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>库存煤电（度）：</strong>在采购绿电证书时，绿电与煤电进行配比采购，每年的比例都不同。</p>
                    <p><strong>库存煤电价值（万）：</strong>煤电消耗中优先消耗年初库存煤电。</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 生产类规则 */}
          <Card className="border-green-200">
            <CardHeader className="pb-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => toggleSection('productionRules')}
              >
                <CardTitle className="text-green-800 text-lg">🏭 生产类规则</CardTitle>
                {expandedSections.productionRules ? (
                  <ChevronUp className="h-5 w-5 text-green-600" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-green-600" />
                )}
              </div>
            </CardHeader>
            {expandedSections.productionRules && (
              <CardContent className="pt-0 space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold text-gray-800">8. 产品标签</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>单个产品生产过程中的碳排放（kg/个）：</strong>碳标签就是把产品在生产过程中碳排放量在产品标签上标示出来，以标签的形式告知消费者产品的碳信息。</p>
                    <p><strong>计算公式：</strong>生产消耗的碳汇资产（kg）÷产品交付数量（个）。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">9. 产品碳成本</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>单个产品生产过程中的碳排放成本（元）：</strong></p>
                    <p><strong>计算公式：</strong>生产消耗的碳汇资产（kg）×碳汇价格÷产品交付数量（个）。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">10. 资产折旧</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>生产线资产折旧率：</strong>生产线的价值每年按10%计算折旧率。</p>
                    <p><strong>计算公式：</strong>（生产线资产 + 当年技术改造费用）× 10%。</p>
                  </div>
                  
                  <h4 className="font-semibold text-gray-800">11. 违约罚款</h4>
                  <div className="pl-4 space-y-2 text-sm text-gray-700">
                    <p><strong>订单违约罚款（元）：</strong>无法按照【客户订单】的数量进行产品交付，需要缴纳罚款。</p>
                    <p><strong>计算公式：</strong>（订单数量 - 交付数量）× 订单单价 × 违约罚款比例。</p>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* 关键提醒 */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="font-semibold text-red-800 mb-2">⚠️ 关键提醒</h4>
            <ul className="space-y-2 text-sm text-red-700">
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>每年进行一次规划，包括产线升级和订单选择，年度内无法更改</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span><strong>季度约束：每季度只能安排一次技术升级，升级时无法生产</strong></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-1">•</span>
              <span>年底结算：超出碳配额需购买，结余可出售，资金不足游戏结束</span>
            </li>
          </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          上一步
        </Button>
        <Button onClick={onNext} className="bg-blue-600 hover:bg-blue-700">
          开始5年经营模拟
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
} 