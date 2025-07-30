import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, BarChart3, TrendingUp, DollarSign } from "lucide-react"
import { SimulationData } from "./index"
import React from "react"
import { ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Bar, ResponsiveContainer } from 'recharts'

interface ResultAnalysisStepProps {
  simulationData: SimulationData
  onPrevious: () => void
  onComplete: () => void
  yearlyRecords: any[]
  upgradeHistory: any[]
}

export function ResultAnalysisStep({ simulationData, onPrevious, onComplete, yearlyRecords, upgradeHistory }: ResultAnalysisStepProps) {
  const { companyState, annualPlans } = simulationData

  // 5年动态统计
  const totalProfit = yearlyRecords.reduce((sum, y) => sum + (y.yearlyProfit || 0), 0)
  const finalCash = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].cashAsset : 0
  const finalLineAsset = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].productionLineAsset : 0
  const avgCarbonLabel = yearlyRecords.length > 0 ? (yearlyRecords.reduce((sum, y) => sum + (y.productCarbonLabel || 0), 0) / yearlyRecords.length) : 0
  const avgCarbonCost = yearlyRecords.length > 0 ? (yearlyRecords.reduce((sum, y) => sum + (y.productCarbonCost || 0), 0) / yearlyRecords.length) : 0
  const totalCarbonEmission = yearlyRecords.reduce((sum, y) => sum + (y.carbonEmission || 0), 0)
  const finalMaterialStock = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].materialStock : 0
  const finalMaterialStockValue = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].materialStockValue : 0
  const finalCarbonCreditStock = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].carbonCreditStock : 0
  const finalCarbonCreditStockValue = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].carbonCreditStockValue : 0
  const finalGreenPowerStock = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].greenPowerStock : 0
  const finalGreenPowerStockValue = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].greenPowerStockValue : 0
  const finalCoalPowerStock = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].coalPowerStock : 0
  const finalCoalPowerStockValue = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].coalPowerStockValue : 0

  // 动态统计升级等级、单位能耗/碳排、总升级投资、配额使用等
  const finalEnergyUpgrade = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].energyUpgradeCount : 0
  const finalEmissionUpgrade = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].emissionUpgradeCount : 0
  const totalUpgradeInvest = yearlyRecords.reduce((sum, y) => sum + (y.energyUpgradeCount * 250000 + y.emissionUpgradeCount * 200000), 0)
  const finalUnitEnergy = 8000 * (1 - (finalEnergyUpgrade === 0 ? 0 : finalEnergyUpgrade / 100))
  const finalUnitEmission = 120000 * (1 - (finalEmissionUpgrade === 0 ? 0 : finalEmissionUpgrade / 100))
  const totalAllowance = yearlyRecords.reduce((sum, y) => sum + (y.carbonAllowance || 0), 0)
  const totalAllowanceUsed = yearlyRecords.reduce((sum, y) => sum + (y.carbonEmission || 0), 0)
  const totalAllowanceTraded = yearlyRecords.reduce((sum, y) => sum + (y.quotaIncome || 0), 0)

  // 累计升级级别
  const totalEnergyUpgradeCount = upgradeHistory.filter(u => u.type === 'energy').reduce((sum, u) => sum + (u.toLevel - u.fromLevel), 0)
  const totalEmissionUpgradeCount = upgradeHistory.filter(u => u.type === 'emission').reduce((sum, u) => sum + (u.toLevel - u.fromLevel), 0)

  // 先对 yearlyRecords 按 year 去重，保证每年只保留一条记录
  const uniqueYearlyRecords = yearlyRecords.filter(
    (rec, idx, arr) => arr.findIndex(r => r.year === rec.year) === idx
  )

  // 构造混合图数据（累计等级和当年新增投入，确保无重复）
  let cumulativeEnergy = 0
  let cumulativeEmission = 0
  const upgradeData = uniqueYearlyRecords.map((record) => {
    cumulativeEnergy += record.energyUpgradeCount || 0
    cumulativeEmission += record.emissionUpgradeCount || 0
    return {
      year: `第${record.year}年`,
      energyLevel: cumulativeEnergy,
      emissionLevel: cumulativeEmission,
      energyInvestment: (record.energyUpgradeCount || 0) * 250000,
      emissionInvestment: (record.emissionUpgradeCount || 0) * 200000,
    }
  })

  return (
    <div className="space-y-6">
      {/* 最终经营结果 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            5年经营结果总览
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-sm text-gray-500">最终现金</div>
              <div className={`text-2xl font-bold ${finalCash >= 0 ? 'text-blue-600' : 'text-red-600'}`}>{finalCash.toLocaleString()} 元</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-sm text-gray-500">生产线资产</div>
              <div className="text-2xl font-bold text-purple-600">{finalLineAsset.toLocaleString()} 元</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-500">平均碳标签</div>
              <div className="text-2xl font-bold text-green-600">{avgCarbonLabel.toFixed(2)} kg/个</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-sm text-gray-500">平均碳成本</div>
              <div className="text-2xl font-bold text-orange-600">{avgCarbonCost.toLocaleString()} 元/个</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-500">累计利润</div>
              <div className="text-2xl font-bold text-gray-600">{totalProfit.toLocaleString()} 元</div>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg">
              <div className="text-sm text-gray-500">总碳排放</div>
              <div className="text-2xl font-bold text-cyan-600">{totalCarbonEmission.toLocaleString()} kg</div>
            </div>
            <div className="text-center p-4 bg-pink-50 rounded-lg">
              <div className="text-sm text-gray-500">物料库存</div>
              <div className="text-xl font-bold text-pink-600">{finalMaterialStock.toLocaleString()} 包</div>
              <div className="text-xs text-gray-500">价值：{finalMaterialStockValue.toLocaleString()}元</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 碳管理绩效 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            碳管理绩效分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">产线升级投资</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">能耗降低级别：</span>
                  <span className="font-medium">{finalEnergyUpgrade} 级</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">碳排降低级别：</span>
                  <span className="font-medium">{finalEmissionUpgrade} 级</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前单位能耗：</span>
                  <span className="font-medium">{finalUnitEnergy.toLocaleString()} 单位</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">当前单位碳排：</span>
                  <span className="font-medium">{finalUnitEmission.toLocaleString()} 单位</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600">总升级投资：</span>
                  <span className="font-medium">
                    {totalUpgradeInvest.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-gray-800">碳配额使用情况</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">累计配额：</span>
                  <span className="font-medium">{totalAllowance.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">已使用配额：</span>
                  <span className="font-medium">{totalAllowanceUsed.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">配额交易收入：</span>
                  <span className="font-medium">{totalAllowanceTraded.toLocaleString()} 元</span>
                </div>
              </div>
            </div>

            <div className="w-full md:col-span-4 mb-6">
              <div className="text-lg font-bold mb-1">升级历史记录</div>
              <div className="text-xs text-gray-500 mb-3">
                升级标准：左轴为累计升级等级（折线），右轴为当年投入金额（柱状），节能/减排分色。
              </div>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={upgradeData} margin={{ top: 20, right: 120, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis yAxisId="left" allowDecimals={false} label={{ value: '累计等级', angle: -90, position: 'insideLeft' }} />
                  <YAxis yAxisId="right" orientation="right" label={{ value: '当年投入(元)', angle: 90, position: 'outside' }} />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="energyInvestment" fill="#eab308" barSize={30} isAnimationActive={false} />
                  <Bar yAxisId="right" dataKey="emissionInvestment" fill="#86efac" barSize={30} isAnimationActive={false} />
                  <Line yAxisId="left" type="monotone" dataKey="energyLevel" stroke="#2563eb" strokeWidth={2} />
                  <Line yAxisId="left" type="monotone" dataKey="emissionLevel" stroke="#9333ea" strokeWidth={2} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 财务分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-600" />
            财务绩效分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <h4 className="font-medium text-gray-800">年度经营记录</h4>
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
                      <th className="text-left p-2">生产线资产</th>
                      <th className="text-left p-2">碳排放</th>
                      <th className="text-left p-2">碳配额</th>
                      <th className="text-left p-2">配额结余</th>
                      <th className="text-left p-2">配额收入</th>
                      <th className="text-left p-2">物料库存</th>
                      <th className="text-left p-2">碳汇库存</th>
                      <th className="text-left p-2">煤电库存</th>
                      <th className="text-left p-2">绿电库存</th>
                    </tr>
                  </thead>
                  <tbody>
                    {yearlyRecords.map((record, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2">第{record.year}年</td>
                        <td className="p-2">{record.productionQuantity} 个</td>
                        <td className="p-2">{record.totalRevenue?.toLocaleString()} 元</td>
                        <td className="p-2">{record.totalCost?.toLocaleString()} 元</td>
                        <td className={`p-2 ${record.yearlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>{record.yearlyProfit?.toLocaleString()} 元</td>
                        <td className="p-2">{record.cashAsset?.toLocaleString()} 元</td>
                        <td className="p-2">{record.productionLineAsset?.toLocaleString()} 元</td>
                        <td className="p-2">{record.carbonEmission?.toLocaleString()} kg</td>
                        <td className="p-2">{record.carbonAllowance?.toLocaleString()} kg</td>
                        <td className="p-2">{record.quotaBalance?.toLocaleString()} kg</td>
                        <td className="p-2">{record.quotaIncome?.toLocaleString()} 元</td>
                        <td className="p-2">{record.materialStock?.toLocaleString()} 包</td>
                        <td className="p-2">{record.carbonCreditStock?.toLocaleString()} kg</td>
                        <td className="p-2">{record.coalPowerStock?.toLocaleString()} 度</td>
                        <td className="p-2">{record.greenPowerStock?.toLocaleString()} 度</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">暂无年度经营记录</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 企业ESG绩效评估报告 */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader>
          <CardTitle className="text-blue-700">🌱 企业ESG绩效评估报告</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 环境绩效指标 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4">环境绩效指标 (Environmental)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h5 className="font-semibold text-green-800 mb-2">碳排放管理</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>总碳排放量：</span>
                    <span className="font-medium">{totalCarbonEmission.toLocaleString()} kg</span>
                  </div>
                  <div className="flex justify-between">
                    <span>碳配额使用率：</span>
                    <span className="font-medium">{totalAllowance > 0 ? ((totalAllowanceUsed / totalAllowance) * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>减排投资总额：</span>
                    <span className="font-medium">{totalUpgradeInvest.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>平均产品碳标签：</span>
                    <span className="font-medium">{avgCarbonLabel.toFixed(2)} kg/个</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h5 className="font-semibold text-blue-800 mb-2">绿色投资</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>节能升级次数：</span>
                    <span className="font-medium">{totalEnergyUpgradeCount} 次</span>
                  </div>
                  <div className="flex justify-between">
                    <span>减排升级次数：</span>
                    <span className="font-medium">{totalEmissionUpgradeCount} 次</span>
                  </div>
                  <div className="flex justify-between">
                    <span>绿电使用比例：</span>
                    <span className="font-medium">{yearlyRecords.length > 0 ? (yearlyRecords[yearlyRecords.length - 1].greenPowerReduction / yearlyRecords[yearlyRecords.length - 1].carbonNeutralized * 100).toFixed(1) : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>碳配额交易收入：</span>
                    <span className="font-medium">{totalAllowanceTraded.toLocaleString()} 元</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 社会与治理绩效 */}
          <div>
            <h4 className="font-medium text-gray-800 mb-4">社会与治理绩效 (Social & Governance)</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h5 className="font-semibold text-purple-800 mb-2">社会责任</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>环保合规性：</span>
                    <span className={`font-medium ${totalCarbonEmission <= totalAllowance ? 'text-green-600' : 'text-red-600'}`}>
                      {totalCarbonEmission <= totalAllowance ? '合规' : '超排'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>可持续发展投资：</span>
                    <span className="font-medium">{totalUpgradeInvest.toLocaleString()} 元</span>
                  </div>
                  <div className="flex justify-between">
                    <span>绿色供应链管理：</span>
                    <span className="font-medium">{finalMaterialStock > 0 ? '有效' : '需改进'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>碳信息披露：</span>
                    <span className="font-medium">透明</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <h5 className="font-semibold text-orange-800 mb-2">治理绩效</h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>财务稳定性：</span>
                    <span className={`font-medium ${finalCash >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {finalCash >= 0 ? '稳定' : '风险'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>风险管理能力：</span>
                    <span className="font-medium">{finalCash > 1000000 ? '优秀' : finalCash > 500000 ? '良好' : '需加强'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>长期投资规划：</span>
                    <span className="font-medium">{totalUpgradeInvest > 0 ? '有规划' : '需规划'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>合规经营：</span>
                    <span className="font-medium">合规</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ESG综合评级 */}
          <div className="bg-gradient-to-r from-green-100 to-blue-100 p-4 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-3">ESG综合评级</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {(() => {
                    const envScore = Math.min(100, Math.max(0, 
                      (totalUpgradeInvest / 1000000 * 30) + 
                      (totalAllowanceTraded / 100000 * 20) + 
                      (totalCarbonEmission <= totalAllowance ? 50 : 20)
                    ))
                    return Math.round(envScore)
                  })()}
                </div>
                <div className="text-sm text-gray-600">环境绩效</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {(() => {
                    const socialScore = Math.min(100, Math.max(0,
                      (totalUpgradeInvest > 0 ? 40 : 20) +
                      (finalCash >= 0 ? 30 : 10) +
                      (totalCarbonEmission <= totalAllowance ? 30 : 10)
                    ))
                    return Math.round(socialScore)
                  })()}
                </div>
                <div className="text-sm text-gray-600">社会责任</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(() => {
                    const govScore = Math.min(100, Math.max(0,
                      (finalCash > 1000000 ? 40 : finalCash > 500000 ? 30 : 20) +
                      (totalUpgradeInvest > 0 ? 30 : 15) +
                      (totalProfit >= 0 ? 30 : 15)
                    ))
                    return Math.round(govScore)
                  })()}
                </div>
                <div className="text-sm text-gray-600">治理绩效</div>
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <div className="text-lg font-semibold text-gray-800">
                综合评级：{(() => {
                  const envScore = Math.min(100, Math.max(0, 
                    (totalUpgradeInvest / 1000000 * 30) + 
                    (totalAllowanceTraded / 100000 * 20) + 
                    (totalCarbonEmission <= totalAllowance ? 50 : 20)
                  ))
                  const socialScore = Math.min(100, Math.max(0,
                    (totalUpgradeInvest > 0 ? 40 : 20) +
                    (finalCash >= 0 ? 30 : 10) +
                    (totalCarbonEmission <= totalAllowance ? 30 : 10)
                  ))
                  const govScore = Math.min(100, Math.max(0,
                    (finalCash > 1000000 ? 40 : finalCash > 500000 ? 30 : 20) +
                    (totalUpgradeInvest > 0 ? 30 : 15) +
                    (totalProfit >= 0 ? 30 : 15)
                  ))
                  const avgScore = Math.round((envScore + socialScore + govScore) / 3)
                  return avgScore >= 80 ? 'A级' : avgScore >= 60 ? 'B级' : avgScore >= 40 ? 'C级' : 'D级'
                })()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 经营策略评估 */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-green-700">📊 经营策略评估</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">成功要素分析</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {(() => {
                  const successFactors = []
                  if (totalUpgradeInvest > 0) {
                    successFactors.push("合理的产线升级投资时机选择")
                  }
                  if (totalProfit > 0) {
                    successFactors.push("平衡短期收益与长期减排目标")
                  }
                  if (finalMaterialStock > 0 || finalCarbonCreditStock > 0) {
                    successFactors.push("有效的库存和订单管理策略")
                  }
                  if (totalAllowanceTraded > 0) {
                    successFactors.push("碳配额交易的合理运用")
                  }
                  if (successFactors.length === 0) {
                    successFactors.push("基础经营策略执行")
                  }
                  return successFactors.map((factor, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-green-600 mt-1">✓</span>
                      <span>{factor}</span>
                    </li>
                  ))
                })()}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-3">改进建议</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {(() => {
                  const suggestions = []
                  if (totalUpgradeInvest === 0) {
                    suggestions.push("建议进行产线升级投资，降低后期碳交易成本")
                  }
                  if (totalProfit < 0) {
                    suggestions.push("优化订单选择，提高资金周转效率")
                  }
                  if (finalCash < 1000000) {
                    suggestions.push("建立风险预警机制，避免资金链断裂")
                  }
                  if (totalCarbonEmission > totalAllowance) {
                    suggestions.push("加强减排措施，避免超排罚款")
                  }
                  if (suggestions.length === 0) {
                    suggestions.push("继续保持当前经营策略")
                  }
                  return suggestions.map((suggestion, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 mt-1">→</span>
                      <span>{suggestion}</span>
                    </li>
                  ))
                })()}
              </ul>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-green-500">
            <h4 className="font-medium text-gray-800 mb-2">💡 学习收获</h4>
            <p className="text-sm text-gray-600">
              通过本次模拟，您体验了企业在碳约束下的经营决策过程。{(() => {
                const insights = []
                if (totalUpgradeInvest > 0) {
                  insights.push("理解了产线升级投资与碳减排的平衡关系")
                }
                if (totalAllowanceTraded > 0) {
                  insights.push("掌握了碳配额交易策略的运用方法")
                }
                if (totalProfit > 0) {
                  insights.push("学会了在环保约束下实现财务绩效的平衡")
                }
                if (insights.length === 0) {
                  insights.push("初步了解了碳约束下的企业经营决策流程")
                }
                return insights.join("，") + "。这些经验对于实际企业的可持续发展具有重要指导意义。"
              })()}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回模拟
        </Button>
        <Button onClick={onComplete} className="bg-green-600 hover:bg-green-700">
          <CheckCircle className="mr-2 h-4 w-4" />
          生成ESG报告
        </Button>
      </div>
    </div>
  )
} 