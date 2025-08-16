import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ArrowLeft, CheckCircle, Leaf, Users, Shield, TrendingUp, Award, FileText, Download } from "lucide-react"
import { SimulationData } from "./index"

interface ESGReportStepProps {
  simulationData: SimulationData
  onPrevious: () => void
  onComplete: () => void
  yearlyRecords: any[]
  upgradeHistory: any[]
}

export function ESGReportStep({ simulationData, onPrevious, onComplete, yearlyRecords, upgradeHistory }: ESGReportStepProps) {
  const { companyState } = simulationData
  const [showFinishDialog, setShowFinishDialog] = useState(false)

  // 计算关键指标
  const totalProfit = yearlyRecords.reduce((sum, y) => sum + (y.yearlyProfit || 0), 0)
  const finalCash = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].cashAsset : 0
  const totalCarbonEmission = yearlyRecords.reduce((sum, y) => sum + (y.carbonEmission || 0), 0)
  const totalAllowance = yearlyRecords.reduce((sum, y) => sum + (y.carbonAllowance || 0), 0)
  const totalUpgradeInvest = yearlyRecords.reduce((sum, y) => sum + (y.energyUpgradeCount * 250000 + y.emissionUpgradeCount * 200000), 0)
  const totalEnergyUpgradeCount = upgradeHistory.filter(u => u.type === 'energy').reduce((sum, u) => sum + (u.toLevel - u.fromLevel), 0)
  const totalEmissionUpgradeCount = upgradeHistory.filter(u => u.type === 'emission').reduce((sum, u) => sum + (u.toLevel - u.fromLevel), 0)
  const totalAllowanceTraded = yearlyRecords.reduce((sum, y) => sum + (y.quotaIncome || 0), 0)
  const avgCarbonLabel = yearlyRecords.length > 0 ? (yearlyRecords.reduce((sum, y) => sum + (y.productCarbonLabel || 0), 0) / yearlyRecords.length) : 0

  // 基于经营模拟结果计算ESG评分
  const calculateESGScore = () => {
    if (yearlyRecords.length === 0) {
      return {
        environment: 50,
        social: 50,
        governance: 50,
        overall: 50
      }
    }

    // 环境评分 (E) - 基于碳减排、技术升级、配额管理
    const carbonCompliance = totalCarbonEmission <= totalAllowance ? 100 : Math.max(0, 100 - ((totalCarbonEmission - totalAllowance) / totalAllowance) * 100)
    const upgradeScore = Math.min(100, (totalEnergyUpgradeCount + totalEmissionUpgradeCount) * 25) // 最多4次升级
    const carbonIntensityScore = Math.max(0, 100 - (avgCarbonLabel / 120000) * 100) // 基于产品碳标签
    const environmentScore = Math.round((carbonCompliance + upgradeScore + carbonIntensityScore) / 3)

    // 社会评分 (S) - 基于经营稳定性、可持续发展、社会责任
    const financialStability = finalCash >= 0 ? 100 : Math.max(0, 100 + (finalCash / 1000000) * 100)
    const sustainabilityScore = totalUpgradeInvest > 0 ? 100 : 50
    const operationalYears = Math.min(yearlyRecords.length, 5)
    const operationalScore = (operationalYears / 5) * 100
    const socialScore = Math.round((financialStability + sustainabilityScore + operationalScore) / 3)

    // 治理评分 (G) - 基于风险管理、决策执行、长期规划
    const riskManagement = finalCash > 1000000 ? 100 : finalCash > 500000 ? 80 : finalCash > 0 ? 60 : 30
    const planningScore = totalUpgradeInvest > 0 ? 100 : 60
    const tradingScore = totalAllowanceTraded > 0 ? 100 : 70
    const governanceScore = Math.round((riskManagement + planningScore + tradingScore) / 3)

    const overallScore = (environmentScore + socialScore + governanceScore) / 3

    return {
      environment: Math.round(environmentScore),
      social: Math.round(socialScore),
      governance: Math.round(governanceScore),
      overall: Math.round(overallScore)
    }
  }

  const esgScore = calculateESGScore()

  // 获取ESG等级
  const getESGRating = (score: number) => {
    if (score >= 90) return { rating: "AAA", color: "text-green-600", bg: "bg-green-100" }
    if (score >= 80) return { rating: "AA", color: "text-green-500", bg: "bg-green-50" }
    if (score >= 70) return { rating: "A", color: "text-blue-600", bg: "bg-blue-100" }
    if (score >= 60) return { rating: "BBB", color: "text-yellow-600", bg: "bg-yellow-100" }
    if (score >= 50) return { rating: "BB", color: "text-orange-600", bg: "bg-orange-100" }
    return { rating: "B", color: "text-red-600", bg: "bg-red-100" }
  }

  const overallRating = getESGRating(esgScore.overall)

  // 基于经营模拟结果计算碳足迹数据
  const calculateCarbonFootprint = () => {
    if (yearlyRecords.length === 0) {
      return {
        totalEmissions: 0,
        totalProduction: 0,
        carbonIntensity: 0,
        reductionRate: 0
      }
    }

    const totalEmissions = yearlyRecords.reduce((sum, y) => sum + (y.carbonEmission || 0), 0)
    const totalProduction = yearlyRecords.reduce((sum, y) => sum + (y.productionQuantity || 0), 0)
    const carbonIntensity = totalProduction > 0 ? totalEmissions / totalProduction : 0
    const totalAllowance = yearlyRecords.reduce((sum, y) => sum + (y.carbonAllowance || 0), 0)
    const reductionRate = totalAllowance > 0 ? Math.max(0, ((totalAllowance - totalEmissions) / totalAllowance) * 100) : 0
    
    return {
      totalEmissions,
      totalProduction,
      carbonIntensity: Math.round(carbonIntensity * 100) / 100,
      reductionRate: Math.round(reductionRate)
    }
  }

  const carbonData = calculateCarbonFootprint()

  // 基于经营模拟结果生成改进建议
  const generateRecommendations = () => {
    const recommendations = []
    
    if (yearlyRecords.length === 0) {
      return [
        {
          category: "环境",
          priority: "高",
          suggestion: "开始进行碳减排技改投资"
        },
        {
          category: "社会",
          priority: "中",
          suggestion: "建立稳定的经营策略"
        },
        {
          category: "治理",
          priority: "中",
          suggestion: "完善风险管理体系"
        }
      ]
    }

    const totalProfit = yearlyRecords.reduce((sum, y) => sum + (y.yearlyProfit || 0), 0)
    const finalCash = yearlyRecords.length > 0 ? yearlyRecords[yearlyRecords.length - 1].cashAsset : 0
    const totalCarbonEmission = yearlyRecords.reduce((sum, y) => sum + (y.carbonEmission || 0), 0)
    const totalAllowance = yearlyRecords.reduce((sum, y) => sum + (y.carbonAllowance || 0), 0)
    const totalUpgradeInvest = yearlyRecords.reduce((sum, y) => sum + (y.energyUpgradeCount * 250000 + y.emissionUpgradeCount * 200000), 0)
    
    if (esgScore.environment < 70) {
      if (totalCarbonEmission > totalAllowance) {
        recommendations.push({
          category: "环境",
          priority: "高",
          suggestion: "加强碳减排措施，避免超排罚款"
        })
      }
      if (totalUpgradeInvest === 0) {
      recommendations.push({
        category: "环境",
        priority: "高",
          suggestion: "加大清洁技术投资，降低碳排放强度"
      })
      }
    }
    
    if (esgScore.social < 70) {
      if (finalCash < 0) {
        recommendations.push({
          category: "社会",
          priority: "高",
          suggestion: "改善财务状况，避免破产风险"
        })
      }
      if (totalProfit < 0) {
      recommendations.push({
        category: "社会",
        priority: "中",
          suggestion: "优化经营策略，提高盈利能力"
      })
      }
    }
    
    if (esgScore.governance < 70) {
      if (finalCash < 500000) {
        recommendations.push({
          category: "治理",
          priority: "高",
          suggestion: "加强风险管理，建立资金预警机制"
        })
      }
      if (totalUpgradeInvest === 0) {
      recommendations.push({
        category: "治理",
        priority: "中",
          suggestion: "制定长期发展规划，提升决策执行效率"
      })
      }
    }
    
    if (recommendations.length === 0) {
      recommendations.push({
        category: "综合",
        priority: "低",
        suggestion: "继续保持当前ESG表现，持续优化"
      })
    }

    return recommendations
  }

  const recommendations = generateRecommendations()

  // 下载ESG报告功能 - 使用pdfmake生成PDF，支持中文
  const downloadESGReport = async () => {
    try {
      if (typeof window === 'undefined') return; // 只在浏览器端执行
      // 动态引入pdfmake及字体
      // @ts-expect-error: pdfmake无类型声明，忽略类型检查
      const pdfMake = (await import('pdfmake/build/pdfmake')).default;
      // @ts-expect-error: pdfmake无类型声明，忽略类型检查
      const pdfFonts = (await import('pdfmake/build/vfs_fonts')).default;
      pdfMake.vfs = pdfFonts.vfs;

      const docDefinition = {
        content: [
          { text: '企业ESG绩效评估报告', style: 'header', alignment: 'center' },
          { text: `报告日期：${new Date().toLocaleDateString('zh-CN')}`, margin: [0, 10, 0, 0] },
          { text: `综合评级：${overallRating.rating}级` },
          { text: `综合评分：${esgScore.overall}分`, margin: [0, 0, 0, 10] },
          { text: '一、ESG评分概览', style: 'subheader' },
          `环境评分 (E)：${esgScore.environment}分`,
          `社会评分 (S)：${esgScore.social}分`,
          `治理评分 (G)：${esgScore.governance}分`,
          { text: '二、环境绩效指标', style: 'subheader' },
          `总碳排放：${carbonData.totalEmissions.toLocaleString()} kg`,
          `碳强度：${carbonData.carbonIntensity.toLocaleString()} kg/产品`,
          `碳配额使用率：${totalAllowance > 0 ? Math.round((totalCarbonEmission / totalAllowance) * 100) : 0}%`,
          `技改投资总额：${totalUpgradeInvest.toLocaleString()} 元`,
          `节能技改次数：${totalEnergyUpgradeCount} 次`,
          `减排技改次数：${totalEmissionUpgradeCount} 次`,
          `平均产品碳标签：${avgCarbonLabel.toFixed(2)} kg/个`,
          `配额交易收入：${totalAllowanceTraded.toLocaleString()} 元`,
          { text: '三、社会与治理绩效', style: 'subheader' },
          `经营年限：${Math.min(yearlyRecords.length, 5)}/5年`,
          `最终现金：${finalCash.toLocaleString()} 元`,
          `累计利润：${totalProfit.toLocaleString()} 元`,
          `财务状况：${finalCash >= 0 ? '健康' : '困难'}`,
          `碳合规性：${totalCarbonEmission <= totalAllowance ? '合规' : '超排'}`,
          `技术升级：${totalUpgradeInvest > 0 ? '已投资' : '未投资'}`,
          `配额交易：${totalAllowanceTraded > 0 ? '已开展' : '未开展'}`,
          { text: '四、年度经营记录', style: 'subheader' },
          ...yearlyRecords.map((record: any) => (
            [
              { text: `第${record.year}年：`, margin: [0, 5, 0, 0], bold: true },
              `- 生产数量：${record.productionQuantity} 个`,
              `- 年度利润：${record.yearlyProfit.toLocaleString()} 元`,
              `- 现金资产：${record.cashAsset.toLocaleString()} 元`,
              `- 碳排放：${record.carbonEmission.toLocaleString()} kg`,
              `- 碳配额：${record.carbonAllowance.toLocaleString()} kg`,
              `- 配额结余：${record.quotaBalance.toLocaleString()} kg`,
              `- 配额收入：${record.quotaIncome.toLocaleString()} 元`,
            ]
          )).flat(),
          { text: '五、技术升级历史', style: 'subheader' },
          ...upgradeHistory.map((upgrade: any, index: number) => (
            [
              { text: `${index + 1}. 第${upgrade.year}年${upgrade.type === 'energy' ? '节能' : '减排'}技改`, margin: [0, 5, 0, 0], bold: true },
              `   - 升级前等级：${upgrade.fromLevel}`,
              `   - 升级后等级：${upgrade.toLevel}`,
              `   - 投资金额：${upgrade.cost.toLocaleString()} 元`,
            ]
          )).flat(),
          { text: '六、ESG改进建议', style: 'subheader' },
          ...recommendations.map((rec: any, index: number) => (
            [
              { text: `${index + 1}. [${rec.priority}优先级] ${rec.category}`, margin: [0, 5, 0, 0], bold: true },
              `   建议：${rec.suggestion}`,
            ]
          )).flat(),
          { text: '七、发展前景', style: 'subheader' },
          `基于当前ESG绩效表现，企业在可持续发展方面展现了${overallRating.rating}级水平。${yearlyRecords.length >= 5 ? '成功完成5年经营模拟，' : '在经营模拟过程中，'}通过持续的技术创新和管理优化，有望进一步提升ESG评级。`,
          `${totalUpgradeInvest > 0 ? '企业已积极开展技术升级投资，' : '建议加强技术升级投资，'}${totalCarbonEmission <= totalAllowance ? '碳配额管理合规，' : '需要加强碳配额管理，'}建议继续完善社会责任体系，提升治理水平，以实现更高质量的可持续发展目标。`,
          { text: '八、ESG价值体现', style: 'subheader' },
          `环境价值：通过${totalEnergyUpgradeCount + totalEmissionUpgradeCount}次技改投资，累计投入${totalUpgradeInvest.toLocaleString()}元，有效降低碳排放强度。`,
          `社会价值：在碳约束下实现${totalProfit >= 0 ? '盈利' : '经营'}，最终现金${finalCash.toLocaleString()}元，展现可持续发展能力。`,
          `治理价值：完成${yearlyRecords.length}年经营规划，${totalAllowanceTraded > 0 ? '积极开展配额交易' : '建立配额管理机制'}，体现风险管理水平。`,
          { text: `报告生成时间：${new Date().toLocaleString('zh-CN')}`, style: 'footer', margin: [0, 10, 0, 0] },
        ],
        styles: {
          header: { fontSize: 20, bold: true },
          subheader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
          footer: { fontSize: 8, color: '#888888' },
        },
        defaultStyle: {
          font: 'Helvetica' // vfs_fonts 里自带的字体，支持中文
        }
      }
      pdfMake.createPdf(docDefinition).download(`ESG绩效评估报告_${new Date().toISOString().split('T')[0]}.pdf`)
    } catch (err) {
      alert('PDF生成失败，请刷新页面重试！\n' + (typeof err === 'object' && err && 'message' in err ? (err as any).message : String(err)));
    }
  }

  return (
    <div className="space-y-6">
      {/* ESG评分概览 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-6 w-6 text-purple-600" />
            企业ESG绩效评估报告
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-6">
            {/* 综合评分 */}
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${overallRating.bg} mb-3`}>
                <span className={`text-2xl font-bold ${overallRating.color}`}>
                  {overallRating.rating}
                </span>
              </div>
              <div className="text-sm text-gray-500">综合评级</div>
              <div className="text-lg font-bold">{esgScore.overall}分</div>
            </div>

            {/* 环境评分 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5 text-green-600" />
                <span className="font-medium">环境 (E)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>评分</span>
                  <span className="font-medium">{esgScore.environment}分</span>
                </div>
                <Progress value={esgScore.environment} className="h-2" />
              </div>
            </div>

            {/* 社会评分 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium">社会 (S)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>评分</span>
                  <span className="font-medium">{esgScore.social}分</span>
                </div>
                <Progress value={esgScore.social} className="h-2" />
              </div>
            </div>

            {/* 治理评分 */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-600" />
                <span className="font-medium">治理 (G)</span>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>评分</span>
                  <span className="font-medium">{esgScore.governance}分</span>
                </div>
                <Progress value={esgScore.governance} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 环境绩效详情 */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              环境绩效指标
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-gray-500">总碳排放</div>
                <div className="text-xl font-bold text-green-600">{carbonData.totalEmissions.toLocaleString()}</div>
                <div className="text-xs text-gray-500">kg</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-500">碳强度</div>
                <div className="text-xl font-bold text-blue-600">{carbonData.carbonIntensity.toLocaleString()}</div>
                <div className="text-xs text-gray-500">kg/产品</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm">
                  <span>碳配额使用率：</span>
                  <span>{totalAllowance > 0 ? Math.round((totalCarbonEmission / totalAllowance) * 100) : 0}%</span>
                </div>
                <Progress value={totalAllowance > 0 ? Math.min(100, (totalCarbonEmission / totalAllowance) * 100) : 0} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>技改投资总额：</span>
                  <span>{totalUpgradeInvest.toLocaleString()} 元</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>节能技改次数：</span>
                  <span>{totalEnergyUpgradeCount} 次</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>减排技改次数：</span>
                  <span>{totalEmissionUpgradeCount} 次</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>平均产品碳标签：</span>
                  <span>{avgCarbonLabel.toFixed(2)} kg/个</span>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm">
                  <span>配额交易收入：</span>
                  <span>{totalAllowanceTraded.toLocaleString()} 元</span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2">技术升级投资</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>节能技改：</span>
                  <span>{totalEnergyUpgradeCount} 次</span>
                </div>
                <div className="flex justify-between">
                  <span>减排技改：</span>
                  <span>{totalEmissionUpgradeCount} 次</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span>总投资：</span>
                  <span>{totalUpgradeInvest.toLocaleString()} 元</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 社会与治理绩效 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              社会与治理绩效
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">经营稳定性</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>经营年限：</span>
                  <span>{Math.min(yearlyRecords.length, 5)}/5年</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>财务状况：</span>
                  <span className={finalCash >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {finalCash >= 0 ? '健康' : '困难'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>最终现金：</span>
                  <span className={finalCash >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {finalCash.toLocaleString()} 元
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>累计利润：</span>
                  <span className={totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    {totalProfit.toLocaleString()} 元
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">治理水平</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>规划执行：</span>
                  <span>{yearlyRecords.length}个年度</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>升级决策：</span>
                  <span>{upgradeHistory.length}次</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>技改投资：</span>
                  <span>{totalUpgradeInvest.toLocaleString()} 元</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>配额交易：</span>
                  <span>{totalAllowanceTraded > 0 ? '已开展' : '未开展'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">可持续发展</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>碳合规性：</span>
                  <span className={totalCarbonEmission <= totalAllowance ? 'text-green-600' : 'text-red-600'}>
                    {totalCarbonEmission <= totalAllowance ? '合规' : '超排'}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>技术升级：</span>
                  <span>{totalUpgradeInvest > 0 ? '已投资' : '未投资'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>绿色供应链：</span>
                  <span>{totalUpgradeInvest > 0 ? '已建立' : '待建立'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>长期规划：</span>
                  <span>{yearlyRecords.length >= 5 ? '已完成' : '进行中'}</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium text-gray-800 mb-3">碳配额管理</h4>
              <div className="space-y-2">
                {Array.isArray(companyState.carbonAllowances) && typeof companyState.currentYear === 'number' && companyState.currentYear > 0
                  ? companyState.carbonAllowances.slice(0, companyState.currentYear).map((allowance, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>第{allowance.year}年：</span>
                    <span className={allowance.used <= allowance.allowance ? 'text-green-600' : 'text-red-600'}>
                      {allowance.used}/{allowance.allowance}
                      {allowance.traded !== 0 && (
                        <span className="ml-1">
                          ({allowance.traded > 0 ? '+' : ''}{allowance.traded})
                        </span>
                      )}
                    </span>
                  </div>
                    ))
                  : <div className='text-gray-400'>暂无碳配额数据</div>
                }
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 改进建议 */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-orange-600" />
              ESG改进建议
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recommendations.map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <Badge variant={rec.priority === "高" ? "destructive" : "secondary"}>
                    {rec.priority}
                  </Badge>
                  <div className="flex-1">
                    <div className="font-medium text-gray-800">{rec.category}</div>
                    <div className="text-sm text-gray-600">{rec.suggestion}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 报告总结 */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle className="text-purple-700">📊 ESG报告总结</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-3">主要成就</h4>
              <ul className="text-sm text-gray-600 space-y-2">
                {esgScore.environment >= 70 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>环境绩效表现优秀，碳减排效果显著</span>
                  </li>
                )}
                {upgradeHistory.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>积极投资清洁技术，提升生产效率</span>
                  </li>
                )}
                {yearlyRecords.length >= 5 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>成功完成5年经营目标，展现可持续发展能力</span>
                  </li>
                )}
                {finalCash > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>保持良好的财务状况和经营稳定性</span>
                  </li>
                )}
                {totalCarbonEmission <= totalAllowance && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>碳配额管理合规，未出现超排情况</span>
                  </li>
                )}
                {totalUpgradeInvest > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span>重视技术升级投资，体现长期发展思维</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-800 mb-3">发展前景</h4>
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  基于当前ESG绩效表现，企业在可持续发展方面展现了{overallRating.rating}级水平。
                  {yearlyRecords.length >= 5 ? '成功完成5年经营模拟，' : '在经营模拟过程中，'}通过持续的技术创新和管理优化，有望进一步提升ESG评级。
                </p>
                <p>
                  {totalUpgradeInvest > 0 ? '企业已积极开展技术升级投资，' : '建议加强技术升级投资，'}
                  {totalCarbonEmission <= totalAllowance ? '碳配额管理合规，' : '需要加强碳配额管理，'}
                  建议继续完善社会责任体系，提升治理水平，以实现更高质量的可持续发展目标。
                </p>
                <p>
                  累计技改投资：{totalUpgradeInvest.toLocaleString()} 元 | 
                  碳配额使用率：{totalAllowance > 0 ? Math.round((totalCarbonEmission / totalAllowance) * 100) : 0}% | 
                  最终现金：{finalCash.toLocaleString()} 元
                </p>
              </div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-white rounded-lg border-l-4 border-purple-500">
            <h4 className="font-medium text-gray-800 mb-2">💡 ESG价值体现</h4>
            <p className="text-sm text-gray-600">
              本次模拟展示了ESG理念在企业经营中的重要作用。通过平衡环境保护、社会责任和公司治理，
              企业不仅能够应对碳约束挑战，还能够实现长期可持续发展，为所有利益相关者创造价值。
            </p>
            <div className="mt-3 text-sm text-gray-600 space-y-1">
              <p><strong>环境价值：</strong>通过{totalEnergyUpgradeCount + totalEmissionUpgradeCount}次技改投资，累计投入{totalUpgradeInvest.toLocaleString()}元，有效降低碳排放强度。</p>
              <p><strong>社会价值：</strong>在碳约束下实现{totalProfit >= 0 ? '盈利' : '经营'}，最终现金{finalCash.toLocaleString()}元，展现可持续发展能力。</p>
              <p><strong>治理价值：</strong>完成{yearlyRecords.length}年经营规划，{totalAllowanceTraded > 0 ? '积极开展配额交易' : '建立配额管理机制'}，体现风险管理水平。</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 控制按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          返回分析
        </Button>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-blue-50 hover:bg-blue-100" onClick={() => downloadESGReport()}>
            <Download className="mr-2 h-4 w-4" />
            下载报告
          </Button>
          
          <Button onClick={() => setShowFinishDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <CheckCircle className="mr-2 h-4 w-4" />
            完成实验
          </Button>
        </div>
      </div>

      {/* 完成实验弹窗 */}
      <Dialog open={showFinishDialog} onOpenChange={setShowFinishDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>🎉 恭喜完成实验！</DialogTitle>
          </DialogHeader>
          <div className="text-center text-lg font-medium my-4">您已顺利完成企业碳管理经营模拟实验。</div>
          <DialogFooter className="flex flex-col gap-2">
            <Button onClick={() => { setShowFinishDialog(false); downloadESGReport(); }} className="w-full bg-blue-600 hover:bg-blue-700">
              <Download className="mr-2 h-4 w-4" />下载ESG报告
            </Button>
            <Button onClick={() => { window.location.href = "/" }} variant="outline" className="w-full">返回主页</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 