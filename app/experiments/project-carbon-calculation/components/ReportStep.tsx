"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BarChart3, Download, ArrowLeft, CheckCircle, Building2, Calculator } from "lucide-react"
import { CalculationResults, ExperimentStep } from "./types"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, CartesianGrid, XAxis, YAxis, Bar, LineChart, Line } from "recharts"
import { useRef, useState } from "react"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { toast } from "sonner"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ReportStepProps {
  projectName: string
  projectDescription: string
  calculationResults: CalculationResults
  onComplete: () => void
  onPrevious: (step: ExperimentStep) => void
  onDownloadReport: () => void
}

export function ReportStep({
  projectName,
  projectDescription,
  calculationResults,
  onComplete,
  onPrevious,
  onDownloadReport
}: ReportStepProps) {
  const reportRef = useRef<HTMLDivElement>(null)
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false)

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return

    try {
      toast.loading("正在生成报告...")
      
      // 创建 PDF 文档
      const pdf = new jsPDF("p", "mm", "a4")
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      
      // 获取报告内容
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: reportRef.current.scrollWidth,
        windowHeight: reportRef.current.scrollHeight
      })
      
      // 将 canvas 转换为图片
      const imgData = canvas.toDataURL("image/png")
      
      // 计算图片尺寸
      const imgWidth = pageWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      // 计算需要的页数
      const pageCount = Math.ceil(imgHeight / pageHeight)
      
      // 添加图片到 PDF，分页处理
      for (let i = 0; i < pageCount; i++) {
        if (i > 0) {
          pdf.addPage()
        }
        
        const position = -i * pageHeight
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      }
      
      // 下载 PDF
      pdf.save(`碳核算实验报告_${projectName || "未命名项目"}.pdf`)
      
      toast.success("报告下载成功")
    } catch (error) {
      console.error("生成 PDF 失败:", error)
      toast.error("生成报告失败，请重试")
    }
  }

  const handlePrevious = () => {
    onPrevious("calculation")
  }

  // 准备饼图数据
  const scopeData = [
    {
      name: "范围一",
      value: calculationResults.scope1,
      description: "直接排放",
      color: "#ef4444"
    },
    {
      name: "范围二", 
      value: calculationResults.scope2,
      description: "间接排放-电力",
      color: "#eab308"
    },
    {
      name: "范围三",
      value: calculationResults.scope3,
      description: "其他间接排放",
      color: "#10b981"
    }
  ]

  // 准备柱状图数据
  const categoryData = [
    { name: "材料生产", value: calculationResults.materials, color: "#8b5cf6" },
    { name: "材料运输", value: calculationResults.transport, color: "#06b6d4" },
    { name: "施工建设", value: calculationResults.construction, color: "#f59e0b" },
    { name: "竣工交付", value: calculationResults.completion, color: "#ef4444" },
    { name: "碳汇减碳", value: -calculationResults.carbonSink, color: "#10b981" }
  ]

  // 准备折线图数据
  const timelineData = [
    { stage: "材料生产", emissions: calculationResults.materials },
    { stage: "材料运输", emissions: calculationResults.transport },
    { stage: "施工建设", emissions: calculationResults.construction },
    { stage: "竣工交付", emissions: calculationResults.completion },
    { stage: "碳汇减碳", emissions: -calculationResults.carbonSink },
    { stage: "总计", emissions: calculationResults.total }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题区域 */}
      <div className="text-center space-y-4 bg-gradient-to-r from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">实验报告</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          查看碳核算结果和分析，生成完整的实验报告
        </p>
      </div>

      {/* 报告内容 */}
      <div ref={reportRef} className="bg-white rounded-2xl shadow-xl border-0 overflow-hidden">
        {/* 报告头部 */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white p-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">项目碳精算实验报告</h1>
            <div className="flex items-center justify-center space-x-4 text-emerald-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>实验完成</span>
              </div>
              <div className="w-1 h-1 bg-emerald-300 rounded-full"></div>
              <span>生成时间：{new Date().toLocaleDateString('zh-CN')}</span>
            </div>
          </div>
        </div>

        {/* 项目信息 */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="w-4 h-4 text-emerald-600" />
            </div>
            项目基本信息
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="font-semibold text-gray-700">项目名称：</span>
                <span className="text-gray-900">{projectName}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2"></div>
          <div>
                  <span className="font-semibold text-gray-700">项目描述：</span>
                  <p className="text-gray-900 mt-1 text-sm leading-relaxed">{projectDescription}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 碳排放汇总 */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <Calculator className="w-4 h-4 text-blue-600" />
            </div>
            碳排放汇总
          </h2>
          
          {/* 总排放量卡片 */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 mb-6">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">
                {(calculationResults.total / 1000).toFixed(2)} 吨 CO₂e
              </div>
              <p className="text-blue-700">项目总碳排放量</p>
            </div>
          </div>

          {/* 分类排放量 */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">
                  {(calculationResults.materials / 1000).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">材料生产</p>
                <p className="text-xs text-gray-500">吨 CO₂e</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-cyan-600 mb-1">
                  {(calculationResults.transport / 1000).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">材料运输</p>
                <p className="text-xs text-gray-500">吨 CO₂e</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600 mb-1">
                  {(calculationResults.construction / 1000).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">施工建设</p>
                <p className="text-xs text-gray-500">吨 CO₂e</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600 mb-1">
                  {(calculationResults.completion / 1000).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">竣工交付</p>
                <p className="text-xs text-gray-500">吨 CO₂e</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {(-calculationResults.carbonSink / 1000).toFixed(2)}
                </div>
                <p className="text-sm text-gray-600">碳汇减碳</p>
                <p className="text-xs text-gray-500">吨 CO₂e</p>
              </div>
            </div>
          </div>
        </div>

        {/* 数据可视化 */}
        <div className="p-8 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <BarChart3 className="w-4 h-4 text-purple-600" />
            </div>
            数据可视化分析
          </h2>
          
          <div className="grid lg:grid-cols-2 gap-8">
            {/* 排放范围饼图 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">排放范围分布</h3>
              <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={scopeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {scopeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(2)} 吨 CO₂e`} />
                    <Legend />
                    </PieChart>
                  </ResponsiveContainer>
              </div>
            </div>

            {/* 分类排放柱状图 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">分类排放对比</h3>
              <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(2)} 吨 CO₂e`} />
                    <Bar dataKey="value" fill="#8884d8">
                      {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                    </Bar>
                  </BarChart>
                    </ResponsiveContainer>
              </div>
                  </div>
                    </div>

          {/* 排放趋势折线图 */}
          <div className="mt-8 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">排放趋势分析</h3>
            <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                        <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                        <YAxis />
                  <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(2)} 吨 CO₂e`} />
                        <Line 
                          type="monotone" 
                    dataKey="emissions" 
                          stroke="#8884d8"
                    strokeWidth={3}
                    dot={{ fill: '#8884d8', strokeWidth: 2, r: 6 }}
                  />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

        {/* 结论与建议 */}
        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="w-4 h-4 text-orange-600" />
            </div>
            结论与建议
          </h2>
          
          <div className="space-y-4">
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-semibold text-orange-800 mb-2">主要发现</h4>
              <ul className="text-orange-700 space-y-1 text-sm">
                <li>• 项目总碳排放量为 {(calculationResults.total / 1000).toFixed(2)} 吨 CO₂e</li>
                <li>• 材料生产阶段是主要排放源，占比 {((calculationResults.materials / calculationResults.total) * 100).toFixed(1)}%</li>
                <li>• 碳汇减碳量为 {(calculationResults.carbonSink / 1000).toFixed(2)} 吨 CO₂e</li>
                  </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-800 mb-2">优化建议</h4>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• 优先选择低碳材料，降低材料生产阶段的碳排放</li>
                <li>• 优化运输路线，减少材料运输距离</li>
                <li>• 采用节能施工设备，提高施工效率</li>
                <li>• 增加绿化面积，提升碳汇减碳效果</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
      <div className="flex justify-between items-center">
        <Button
          onClick={handlePrevious}
          variant="outline"
          className="flex items-center space-x-2 px-6 py-3"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>上一步</span>
        </Button>
        
        <div className="flex space-x-4">
          <Button
            onClick={handleDownloadPDF}
            className="flex items-center space-x-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="w-4 h-4" />
            <span>下载PDF报告</span>
            </Button>
          
          <Button
            onClick={() => setIsCompleteDialogOpen(true)}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700"
          >
            <CheckCircle className="w-4 h-4" />
            <span>完成实验</span>
            </Button>
        </div>
          </div>

      {/* 完成实验确认对话框 */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>实验完成</span>
            </DialogTitle>
            <DialogDescription>
              恭喜您完成了项目碳精算实验！您已经成功掌握了碳核算的基本方法和流程。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-3">
            <Button 
              onClick={() => {
                setIsCompleteDialogOpen(false)
                if (typeof window !== 'undefined') {
                  window.location.href = "/"
                }
              }} 
              variant="outline"
              className="flex-1"
            >
              返回主页
            </Button>
            <Button 
              onClick={() => {
                setIsCompleteDialogOpen(false)
                handleDownloadPDF()
              }} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700"
            >
              <Download className="w-4 h-4 mr-2" />
              下载报告
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 