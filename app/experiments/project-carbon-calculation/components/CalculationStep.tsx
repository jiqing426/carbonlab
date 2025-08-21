import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Plus, Trash2, Calculator, Truck, Zap, Wrench, Leaf, HardHat, Users, ChevronRight, Info, Hammer, Package, Trees, BarChart3 } from "lucide-react"
import { ExperimentStep, CarbonCalculationData, CarbonEmissionItem, CalculationResults, presetEmissionFactors, PresetEmissionFactor, EmissionScope } from "./types"
import { useState } from "react"

// 材料数据库 - 材料名称与碳排放因子的对应关系
const materialDatabase = {
  // 混凝土类
  "C10混凝土": { factor: 210, unit: "kg CO2/m3", scope: "范围一" },
  "C15混凝土": { factor: 235, unit: "kg CO2/m3", scope: "范围一" },
  "C20混凝土": { factor: 241, unit: "kg CO2/m3", scope: "范围一" },
  "C20透水混凝土": { factor: 224.8, unit: "kg CO2/m3", scope: "范围一" },
  "C25混凝土": { factor: 255, unit: "kg CO2/m3", scope: "范围一" },
  "C30混凝土": { factor: 295, unit: "kg CO2/m3", scope: "范围一" },
  
  // 水泥类
  "普通硅酸盐水泥(市场平均)": { factor: 735, unit: "kg CO2/t", scope: "范围一" },
  "1:2抹灰用水泥砂浆": { factor: 531.52, unit: "kg CO2/m3", scope: "范围一" },
  
  // 砖石类
  "页岩实心砖": { factor: 292, unit: "kg CO2/m3", scope: "范围一" },
  "陶瓷透水砖": { factor: 2.21, unit: "kg CO2/m3", scope: "范围一" },
  "花岗石铺装产品": { factor: 54.16, unit: "kg CO2/m3", scope: "范围一" },
  
  // 沥青类
  "乳化沥青": { factor: 221, unit: "kg CO2/t", scope: "范围一" },
  "改性沥青": { factor: 295.91, unit: "kg CO2/t", scope: "范围一" },
  "沥青混合料": { factor: 2.199, unit: "kg CO2/m3", scope: "范围一" },
  "透水沥青混凝土": { factor: 2.199, unit: "kg CO2/m3", scope: "范围一" },
  
  // 管材类
  "PE透水管": { factor: 3.6, unit: "kg CO2/kg", scope: "范围一" },
  "聚乙烯管": { factor: 3.6, unit: "kg CO2/kg", scope: "范围一" },
  "硬聚氯乙烯管": { factor: 7.93, unit: "kg CO2/kg", scope: "范围一" },
  "电缆": { factor: 4.49, unit: "kg CO2/m", scope: "范围一" },
  
  // 塑料类
  "高密度聚乙烯": { factor: 2620, unit: "kg CO2/t", scope: "范围一" },
  "聚乙烯": { factor: 570, unit: "kg CO2/t", scope: "范围一" },
  "玻璃纤维": { factor: 2250, unit: "kg CO2/t", scope: "范围一" },
  
  // 钢材类
  "普通碳钢(市场平均)": { factor: 2.05, unit: "kg CO2/kg", scope: "范围一" },
  "热轧碳钢钢筋": { factor: 2.34, unit: "kg CO2/kg", scope: "范围一" },
  "热轧碳钢小型型钢": { factor: 2.31, unit: "kg CO2/kg", scope: "范围一" },
  "热轧碳钢无缝钢管": { factor: 3150, unit: "kg CO2/t", scope: "范围一" },
  "钢管": { factor: 2050, unit: "kg CO2/t", scope: "范围一" },
  
  // 铸铁类
  "铸铁材料": { factor: 1.82, unit: "kg CO2/kg", scope: "范围一" },
  "铸铁管": { factor: 1.81, unit: "kg CO2/kg", scope: "范围一" },
  
  // 其他材料
  "防渗土工布": { factor: 2.098, unit: "kg CO2/kg", scope: "范围一" },
  "镀锌铁件": { factor: 1.92, unit: "kg CO2/kg", scope: "范围一" },
  "铝板带": { factor: 28.5, unit: "kg CO2/kg", scope: "范围一" },
  "发光二极管(LED)灯具": { factor: 26.4, unit: "kg CO2/个", scope: "范围一" },
  "肥料": { factor: 3.2838, unit: "kg CO2/kg", scope: "范围一" }
}

// 材料名称列表，用于下拉菜单
const materialNames = Object.keys(materialDatabase)

// 运输碳排放因子数据库 - 所有材料都使用相同的运输碳排放因子
const transportEmissionFactor = 0.078 // kgCO₂/t·km
const transportVehicleType = "重型柴油货车运输(载重30t)"

// 施工机械数据库 - 机械名称与碳排放系数的对应关系
const constructionMachineryDatabase = {
  "斗容量 1.0m³ 履带式单斗挖掘机": { 
    factor: 249.085, 
    scope: "范围一",
    type: "diesel"
  },
  "斗容量 0.6m³ 履带式单斗挖掘机": { 
    factor: 116.095, 
    scope: "范围一",
    type: "diesel"
  },
  "斗容量 1.0m³ 轮胎式装载机": { 
    factor: 151.993, 
    scope: "范围一",
    type: "diesel"
  },
  "最大摊铺宽度 12.5m 沥青混合料摊铺机(带自动找平)": { 
    factor: 422.313, 
    scope: "范围一",
    type: "diesel"
  },
  "25以内振动压路机": { 
    factor: 367.04, 
    scope: "范围一",
    type: "diesel"
  },
  "25~30t轮胎式压路机": { 
    factor: 243.04, 
    scope: "范围一",
    type: "diesel"
  },
  "功率15KW以内柴油发电机组": { 
    factor: 49.6, 
    scope: "范围一",
    type: "diesel"
  },
  "提升质量25t以内汽车式起重机(QY25)": { 
    factor: 126.015, 
    scope: "范围一",
    type: "diesel"
  },
  "最大作业高度10m以内高空作业车": { 
    factor: 64.945, 
    scope: "范围一",
    type: "diesel"
  },
  "蛙式夯土机(200~620N·m)": { 
    factor: 10.07454, 
    scope: "范围二",
    type: "electricity"
  },
  "插入式混凝土振捣器": { 
    factor: 3.24779, 
    scope: "范围二",
    type: "electricity"
  },
  "锯片直径400mm以内型材切割机": { 
    factor: 7.07658, 
    scope: "范围二",
    type: "electricity"
  },
  "直径(mm)40以内钢筋弯曲机": { 
    factor: 8.134, 
    scope: "范围二",
    type: "electricity"
  }
}

// 机械名称列表，用于下拉菜单
const machineryNames = Object.keys(constructionMachineryDatabase)

// 根据机械名称获取对应的碳排放系数信息
const getMachineryInfo = (machineryName: string) => {
  return constructionMachineryDatabase[machineryName as keyof typeof constructionMachineryDatabase]
}

// 劳动者类型数据库 - 劳动者类型与生活碳排放因子的对应关系
const laborerTypeDatabase = {
  "管理人员": { 
    factor: 2.09, 
    scope: "范围三",
    unit: "kg/人·天"
  },
  "机械操作手": { 
    factor: 2.42, 
    scope: "范围三",
    unit: "kg/人·天"
  },
  "工人": { 
    factor: 2.83, 
    scope: "范围三",
    unit: "kg/人·天"
  }
}

// 劳动者类型列表，用于下拉菜单
const laborerTypeNames = Object.keys(laborerTypeDatabase)

// 根据劳动者类型获取对应的生活碳排放因子信息
const getLaborerTypeInfo = (laborerTypeName: string) => {
  return laborerTypeDatabase[laborerTypeName as keyof typeof laborerTypeDatabase]
}

// 临时用能类型数据库 - 类型与电网排放因子的对应关系
const temporaryEnergyDatabase = {
  "生活用能": { 
    factor: 0.5810, 
    scope: "范围二",
    unit: "t/(MW·h)"
  }
}

// 临时用能类型列表，用于下拉菜单
const temporaryEnergyTypeNames = Object.keys(temporaryEnergyDatabase)

// 根据临时用能类型获取对应的电网排放因子信息
const getTemporaryEnergyInfo = (energyTypeName: string) => {
  return temporaryEnergyDatabase[energyTypeName as keyof typeof temporaryEnergyDatabase]
}

// 废弃物类型数据库 - 废弃物类型与运输碳排放因子的对应关系
const wasteTypeDatabase = {
  "弃土": { 
    factor: 0.078, 
    scope: "范围一",
    transportType: "重型柴油货车运输(载重30t)",
    unit: "kgCO₂/t·km"
  },
  "破除块": { 
    factor: 0.078, 
    scope: "范围一",
    transportType: "重型柴油货车运输(载重30t)",
    unit: "kgCO₂/t·km"
  },
  "淤泥、流砂": { 
    factor: 0.078, 
    scope: "范围一",
    transportType: "重型柴油货车运输(载重30t)",
    unit: "kgCO₂/t·km"
  }
}

// 废弃物类型列表，用于下拉菜单
const wasteTypeNames = Object.keys(wasteTypeDatabase)

// 根据废弃物类型获取对应的运输碳排放因子信息
const getWasteTypeInfo = (wasteTypeName: string) => {
  return wasteTypeDatabase[wasteTypeName as keyof typeof wasteTypeDatabase]
}

interface CalculationStepProps {
  carbonData: CarbonCalculationData
  calculationResults: CalculationResults | null
  onDataUpdate: (newData: CarbonCalculationData) => void
  onCalculate: () => void
  onNext: (step: ExperimentStep) => void
  onPrevious: (step: ExperimentStep) => void
}

export function CalculationStep({
  carbonData,
  calculationResults,
  onDataUpdate,
  onCalculate,
  onNext,
  onPrevious
}: CalculationStepProps) {
  const [activeTab, setActiveTab] = useState<keyof CarbonCalculationData>("labor")
  const [showMaterialDatabase, setShowMaterialDatabase] = useState(false)
  const [showMachineryDatabase, setShowMachineryDatabase] = useState(false)

  // 调试信息：显示材料数据库状态
  console.log("材料数据库:", materialDatabase)
  console.log("可用材料名称:", materialNames)
  console.log("材料名称数量:", materialNames.length)

  // 处理数据更新
  const handleDataUpdate = (category: keyof CarbonCalculationData, items: CarbonEmissionItem[]) => {
    const newData = { ...carbonData, [category]: items }
    onDataUpdate(newData)
  }

  // 添加新项目
  const addItem = (category: keyof CarbonCalculationData) => {
    const newItem: CarbonEmissionItem = {
      id: Date.now().toString(),
      category: "",
      consumption: 0,
      unit: "",
      factor: 0,
      emission: 0,
      scope: "范围一" as EmissionScope
    }
    
    const newItems = [...carbonData[category], newItem]
    handleDataUpdate(category, newItems)
  }

  // 删除项目
  const removeItem = (category: keyof CarbonCalculationData, itemId: string) => {
    const newItems = carbonData[category].filter(item => item.id !== itemId)
    handleDataUpdate(category, newItems)
  }

  // 更新项目
  const updateItem = (category: keyof CarbonCalculationData, itemId: string, field: keyof CarbonEmissionItem, value: any) => {
    const newItems = carbonData[category].map(item => 
      item.id === itemId ? { ...item, [field]: value } : item
    )
    handleDataUpdate(category, newItems)
  }

  // 获取材料信息
  const getMaterialInfo = (materialName: string) => {
    return materialDatabase[materialName as keyof typeof materialDatabase]
  }

  // 获取机械信息
  const getMachineryInfo = (machineryName: string) => {
    return constructionMachineryDatabase[machineryName as keyof typeof constructionMachineryDatabase]
  }

  // 计算总碳排放
  const calculateTotalEmissions = () => {
    let total = 0
    Object.values(carbonData).forEach(category => {
      category.forEach(item => {
        // 材料生产碳排放
        const materialEmissions = item.consumption * item.factor
        // 运输碳排放
        const transportEmissions = (item.transportWeight || 0) * (item.transportDistance || 0) * (transportEmissionFactor)
        total += materialEmissions + transportEmissions
      })
    })
    return total
  }

  // 获取分类图标和颜色
  const getCategoryConfig = (category: keyof CarbonCalculationData) => {
    const configs = {
      labor: { icon: Users, color: "blue", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800" },
      transport: { icon: Truck, color: "green", bgColor: "bg-green-50", borderColor: "border-green-200", textColor: "text-green-800" },
      materials: { icon: Package, color: "purple", bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-800" },
      energy: { icon: Zap, color: "yellow", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", textColor: "text-yellow-800" },
      temporary: { icon: Hammer, color: "orange", bgColor: "bg-orange-50", borderColor: "border-orange-200", textColor: "text-orange-800" },
      waste: { icon: Trash2, color: "red", bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-800" },
      carbonSink: { icon: Trees, color: "emerald", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800" }
    }
    return configs[category]
  }

  // 获取分类标签
  const getCategoryLabel = (category: keyof CarbonCalculationData) => {
    const labels = {
      labor: "人员活动",
      transport: "材料运输",
      materials: "材料生产",
      energy: "施工建设",
      temporary: "临时用能",
      waste: "竣工交付",
      carbonSink: "碳汇减碳"
    }
    return labels[category] || category
  }

  // 获取劳动者类型信息
  const getLaborerTypeInfo = (type: string) => {
    const laborerTypes = {
      "管理人员": { factor: 2.09, scope: "范围三" as EmissionScope },
      "机械操作手": { factor: 2.42, scope: "范围三" as EmissionScope },
      "工人": { factor: 2.83, scope: "范围三" as EmissionScope }
    }
    return laborerTypes[type as keyof typeof laborerTypes] || { factor: 2.09, scope: "范围三" as EmissionScope }
  }

  // 获取临时用能信息
  const getTemporaryEnergyInfo = (type: string) => {
    const energyTypes = {
      "生活用能": { factor: 0.5810, scope: "范围二" as EmissionScope }
    }
    return energyTypes[type as keyof typeof energyTypes] || { factor: 0.5810, scope: "范围二" as EmissionScope }
  }

  // 获取废弃物类型信息
  const getWasteTypeInfo = (type: string) => {
    const wasteTypes = {
      "弃土": { factor: 0.078, transportType: "重型柴油货车运输(载重30t)" }
    }
    return wasteTypes[type as keyof typeof wasteTypes] || { factor: 0.078, transportType: "重型柴油货车运输(载重30t)" }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题区域 */}
      <div className="text-center space-y-4 bg-gradient-to-r from-green-50 to-emerald-50 p-8 rounded-2xl border border-green-200">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
            <Calculator className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-gray-800">碳核算</h2>
        </div>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          计算各类碳排放，包括材料生产、运输、施工机械等全生命周期碳排放
        </p>
      </div>


      {/* 数据输入区域 */}
      <div className="grid lg:grid-cols-4 gap-6">
        {/* 左侧分类导航 */}
        <div className="lg:col-span-1">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b border-gray-200">
              <CardTitle className="flex items-center text-gray-800">
                <BarChart3 className="w-5 h-5 mr-2" />
                排放分类
              </CardTitle>
              <CardDescription className="text-gray-600">
                选择要计算的碳排放类别
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              <div className="space-y-2">
                {Object.entries(carbonData).map(([category, items]) => {
                  const config = getCategoryConfig(category as keyof CarbonCalculationData)
                  const IconComponent = config.icon
                  const isActive = activeTab === category

    return (
                    <button
                      key={category}
                      onClick={() => setActiveTab(category as keyof CarbonCalculationData)}
                      className={`w-full p-3 rounded-lg text-left transition-all duration-200 flex items-center space-x-3 ${
                        isActive 
                          ? `${config.bgColor} ${config.borderColor} border-2 ${config.textColor} shadow-md` 
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      <IconComponent className={`w-5 h-5 ${isActive ? config.textColor : 'text-gray-500'}`} />
                      <div className="flex-1">
                        <div className="font-medium">{getCategoryLabel(category as keyof CarbonCalculationData)}</div>
                        <div className="text-sm opacity-75">{items.length} 项</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧数据输入区域 */}
        <div className="lg:col-span-3">
          <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
              <CardTitle className="flex items-center text-blue-800">
                {(() => {
                  const config = getCategoryConfig(activeTab)
                  const IconComponent = config.icon
                  return <IconComponent className="w-5 h-5 mr-2" />
                })()}
                {getCategoryLabel(activeTab)}碳排放计算
              </CardTitle>
              <CardDescription className="text-blue-700">
                输入{getCategoryLabel(activeTab)}相关数据，系统将自动计算碳排放量
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              {/* 材料生产阶段碳排放 */}
              <Collapsible
                open={activeTab === "materials"}
                onOpenChange={() => setActiveTab("materials")}
              >
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center">
                      <Package className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">材料生产阶段产生的碳排放</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.materials.length} 项)</span>
            </div>
                    {activeTab === "materials" ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-4">
                    {carbonData.materials.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无数据，点击下方按钮添加条目</p>
              </div>
            ) : (
              <div className="space-y-4">
                        {carbonData.materials.map((item) => (
                  <div key={item.id} className="p-4 bg-white border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                      <div>
                        <Label>材料名称</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => {
                            console.log("=== 材料选择调试信息 ===")
                            console.log("选择的材料名称:", value)
                            console.log("当前材料数据库:", materialDatabase)
                            console.log("可用材料名称列表:", materialNames)
                            console.log("材料名称数量:", materialNames.length)
                            
                            // 当选择材料名称时，自动填充对应的碳排放因子和单位
                            const materialInfo = getMaterialInfo(value)
                            console.log("获取到的材料信息:", materialInfo)
                            
                            if (materialInfo) {
                              console.log("找到材料信息，开始更新...")
                              // 直接更新所有字段
                              const updatedItem = {
                                ...item,
                                category: value,
                                factor: materialInfo.factor,
                                unit: materialInfo.unit,
                                scope: materialInfo.scope
                              }
                              console.log("更新后的项目:", updatedItem)
                              
                              // 更新数据
                              updateItem("materials", item.id, "category", value)
                              updateItem("materials", item.id, "factor", materialInfo.factor)
                              updateItem("materials", item.id, "unit", materialInfo.unit)
                              updateItem("materials", item.id, "scope", materialInfo.scope)
                              
                              console.log("材料信息更新完成")
                              
                              // 强制重新渲染
                              setTimeout(() => {
                                console.log("延迟检查 - 当前项目状态:", item)
                              }, 100)
                            } else {
                              console.log("未找到材料信息，仅更新名称")
                              updateItem("materials", item.id, "category", value)
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择材料" />
                          </SelectTrigger>
                          <SelectContent>
                            {materialNames.map((name) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 mt-1">选择材料后自动填充碳排放因子</div>
                      </div>
                      <div>
                                <Label>材料消耗量</Label>
                        <Input
                          type="number"
                          value={item.consumption}
                                  onChange={(e) => updateItem("materials", item.id, "consumption", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>计量单位</Label>
                        <Input
                          value={item.unit}
                          readOnly
                          className="bg-gray-50"
                        />
                        <div className="text-xs text-gray-500 mt-1">根据材料名称自动填充</div>
                      </div>
                      <div>
                        <Label>材料碳排放因子</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.factor}
                          readOnly
                          className="bg-gray-50"
                        />
                        <div className="text-xs text-gray-500 mt-1">根据材料名称自动填充</div>
                      </div>
                      <div>
                        <Label>排放量</Label>
                        <Input
                          type="number"
                          value={item.emission}
                          readOnly
                          className="bg-gray-100"
                        />
                        <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                      </div>
                      <div>
                        <Label>排放范围</Label>
                        <Input
                          value={item.scope}
                          readOnly
                          className="bg-gray-50"
                        />
                        <div className="text-xs text-gray-500 mt-1">根据材料名称自动填充</div>
                      </div>
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                                  onClick={() => removeItem("materials", item.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <Button
              variant="outline"
                      onClick={() => addItem("materials")}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              添加条目
            </Button>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>
                可以从预设选项中选择常见的碳排放品种，或手动输入自定义品种。排放量将根据消耗量和排放因子自动计算。
                <br />
                <strong>排放范围说明：</strong>范围一（直接排放）、范围二（间接排放-电力）、范围三（其他间接排放）。
              </AlertDescription>
            </Alert>
          </div>
        </CollapsibleContent>
      </Collapsible>

              {/* 材料运输阶段碳排放 */}
          <Collapsible
                open={activeTab === "transport"}
                onOpenChange={() => setActiveTab("transport")}
          >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center">
                      <Truck className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">材料运输阶段产生的碳排放</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.transport.length} 项)</span>
              </div>
                    {activeTab === "transport" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
            </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.transport.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.transport.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>材料名称</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  // 当选择材料名称时，自动填充运输相关信息
                                  const newData = {
                                    ...carbonData,
                                    transport: carbonData.transport.map(t => {
                                      if (t.id === item.id) {
                                        return {
                                          ...t,
                                            name: value,
                                            transportEmissionFactor: transportEmissionFactor,
                                            transportVehicleType: transportVehicleType,
                                          scope: "范围一" as EmissionScope
                                        }
                                      }
                                      return t
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择材料" />
                                </SelectTrigger>
                                <SelectContent>
                                  {materialNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>材料重量（t）</Label>
                              <Input
                                type="number"
                                  value={item.quantity || 0}
                                onChange={(e) => {
                                    const quantity = parseFloat(e.target.value) || 0
                                  const newData = {
                                    ...carbonData,
                                    transport: carbonData.transport.map(t => {
                                      if (t.id === item.id) {
                                        const distance = t.transportDistance || 0
                                          const factor = t.transportEmissionFactor || 0
                                        return {
                                          ...t,
                                            quantity: quantity,
                                            emission: Number((quantity * distance * factor).toFixed(2))
                                        }
                                      }
                                      return t
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              />
                              </div>
                              <div>
                                <Label>平均运输距离（km）</Label>
                              <Input
                                type="number"
                                value={item.transportDistance || 0}
                                onChange={(e) => {
                                  const distance = parseFloat(e.target.value) || 0
                                  const newData = {
                                    ...carbonData,
                                    transport: carbonData.transport.map(t => {
                                      if (t.id === item.id) {
                                          const quantity = t.quantity || 0
                                          const factor = t.transportEmissionFactor || 0
                                        return {
                                          ...t,
                                          transportDistance: distance,
                                            emission: Number((quantity * distance * factor).toFixed(2))
                                        }
                                      }
                                      return t
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              />
                              </div>
                              <div>
                                <Label>运输汽车类型</Label>
                              <Input
                                  value={item.transportVehicleType || ""}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>运输碳排放因子（kgCO₂/t·km）</Label>
                              <Input
                                type="number"
                                  value={item.transportEmissionFactor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>碳排放量（kg CO₂）</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                                <Label>排放范围</Label>
                              <Input
                                value={item.scope}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("transport", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("transport")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                        <strong>说明：</strong>
                    <br />
                    选择材料名称后，系统会自动填充运输碳排放因子（0.078 kgCO₂/t·km）、运输汽车类型（重型柴油货车运输(载重30t)）和排放范围（范围一）。
                    <br />
                    所有材料的运输碳排放因子均为0.078 kgCO₂/t·km，这是基于重型柴油货车运输的标准值。
                    <br />
                    碳排放量将根据材料重量、运输距离和运输碳排放因子自动计算。
                  </AlertDescription>
                </Alert>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 施工建设阶段碳排放 */}
          <Collapsible
                open={activeTab === "energy"}
                onOpenChange={() => setActiveTab("energy")}
          >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center">
                <Hammer className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">施工建设阶段产生的碳排放</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.energy.length} 项)</span>
              </div>
                    {activeTab === "energy" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
            </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.energy.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.energy.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>机械名称</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  // 当选择机械名称时，自动填充相关信息
                                  const machineryInfo = getMachineryInfo(value)
                                  if (machineryInfo) {
                                    const newData = {
                                      ...carbonData,
                                      energy: carbonData.energy.map(e => {
                                        if (e.id === item.id) {
                                          return {
                                            ...e,
                                              name: value,
                                            factor: machineryInfo.factor,
                                            scope: machineryInfo.scope as EmissionScope
                                          }
                                        }
                                        return e
                                      })
                                    }
                                    onDataUpdate(newData)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择机械" />
                                </SelectTrigger>
                                <SelectContent>
                                  {machineryNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>柴油(kg)</Label>
                              <Input
                                type="number"
                                value={item.diesel || 0}
                                onChange={(e) => updateItem("energy", item.id, "diesel", parseFloat(e.target.value) || 0)}
                              />
                              </div>
                              <div>
                                <Label>电(kW·h)</Label>
                              <Input
                                type="number"
                                value={item.electricity || 0}
                                onChange={(e) => updateItem("energy", item.id, "electricity", parseFloat(e.target.value) || 0)}
                              />
                              </div>
                              <div>
                                <Label>碳排放系数（kg CO2/台班）</Label>
                              <Input
                                type="number"
                                value={item.factor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>台班量</Label>
                              <Input
                                type="number"
                                value={item.shifts || 0}
                                onChange={(e) => updateItem("energy", item.id, "shifts", parseFloat(e.target.value) || 0)}
                              />
                              </div>
                              <div>
                                <Label>碳排放量</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                                <Label>排放范围</Label>
                              <Input
                                value={item.scope}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("energy", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("energy")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                        <strong>说明：</strong>
                    <br />
                    选择机械名称后，系统会自动填充对应的碳排放系数（kg CO2/台班）和排放范围。
                    <br />
                    柴油机械的排放范围为"范围一"（直接排放），电动机械的排放范围为"范围二"（间接排放-电力）。
                    <br />
                    碳排放量将根据碳排放系数和台班量自动计算。
                  </AlertDescription>
                </Alert>
              </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 人员活动碳排放计算 */}
              <Collapsible
                open={activeTab === "labor"}
                onOpenChange={() => setActiveTab("labor")}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">人员活动碳排放计算</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.labor.length} 项)</span>
                    </div>
                    {activeTab === "labor" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.labor.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.labor.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>劳动者类型</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  const laborerInfo = getLaborerTypeInfo(value)
                                  if (laborerInfo) {
                                    const newData = {
                                      ...carbonData,
                                      labor: carbonData.labor.map(l => {
                                        if (l.id === item.id) {
                                          return {
                                            ...l,
                                              name: value,
                                            factor: laborerInfo.factor,
                                            scope: laborerInfo.scope as EmissionScope
                                          }
                                        }
                                        return l
                                      })
                                    }
                                    onDataUpdate(newData)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  {laborerTypeNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>累计有效工作日</Label>
                              <Input
                                type="number"
                                  value={item.quantity || 0}
                                  onChange={(e) => updateItem("labor", item.id, "quantity", parseFloat(e.target.value) || 0)}
                              />
                              </div>
                              <div>
                                <Label>生活碳排放因子（kg/人·天）</Label>
                              <Input
                                type="number"
                                value={item.factor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>碳排放量</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                                <Label>排放范围</Label>
                              <Input
                                value={item.scope}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("labor", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("labor")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                        <strong>说明：</strong>
                    <br />
                    选择劳动者类型后，系统会自动填充对应的生活碳排放因子（kg/人·天）和排放范围。
                    <br />
                    所有人员活动的排放范围均为"范围三"（其他间接排放）。
                    <br />
                    碳排放量将根据生活碳排放因子和累计有效工作日自动计算。
                  </AlertDescription>
                </Alert>
              </div>
                </CollapsibleContent>
              </Collapsible>

              {/* 临时用能碳排放计算 */}
              <Collapsible
                open={activeTab === "temporary"}
                onOpenChange={() => setActiveTab("temporary")}
              >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
                    <div className="flex items-center">
                      <Hammer className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">临时用能碳排放计算</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.temporary.length} 项)</span>
                    </div>
                    {activeTab === "temporary" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.temporary.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.temporary.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>类型</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  const energyInfo = getTemporaryEnergyInfo(value)
                                  if (energyInfo) {
                                    const newData = {
                                      ...carbonData,
                                      temporary: carbonData.temporary.map(t => {
                                        if (t.id === item.id) {
                                          return {
                                            ...t,
                                              name: value,
                                            factor: energyInfo.factor,
                                            scope: energyInfo.scope as EmissionScope
                                          }
                                        }
                                        return t
                                      })
                                    }
                                    onDataUpdate(newData)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  {temporaryEnergyTypeNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>用电量/kWh</Label>
                              <Input
                                type="number"
                                  value={item.quantity || 0}
                                  onChange={(e) => updateItem("temporary", item.id, "quantity", parseFloat(e.target.value) || 0)}
                              />
                              </div>
                              <div>
                                <Label>电网排放因子（t/（MW·h））</Label>
                              <Input
                                type="number"
                                value={item.factor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>碳排量（kg）</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("temporary", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("temporary")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                        <strong>说明：</strong>
                    <br />
                    选择临时用能类型后，系统会自动填充对应的电网排放因子（t/(MW·h)）和排放范围。
                    <br />
                    临时用能的排放范围为"范围二"（间接排放-电力）。
                    <br />
                    碳排放量将根据电网排放因子和用电量自动计算。
                  </AlertDescription>
                </Alert>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 竣工交付阶段碳排放 */}
          <Collapsible
                open={activeTab === "waste"}
                onOpenChange={() => setActiveTab("waste")}
          >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center">
                <Truck className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">竣工交付阶段产生的碳排放</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.waste.length} 项)</span>
              </div>
                    {activeTab === "waste" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
            </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.waste.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.waste.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>废弃物类型</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  const wasteInfo = getWasteTypeInfo(value)
                                  if (wasteInfo) {
                                    const newData = {
                                      ...carbonData,
                                      waste: carbonData.waste.map(w => {
                                        if (w.id === item.id) {
                                          return {
                                            ...w,
                                              name: value,
                                            factor: wasteInfo.factor,
                                            transportType: wasteInfo.transportType,
                                            scope: wasteInfo.scope as EmissionScope
                                          }
                                        }
                                        return w
                                      })
                                    }
                                    onDataUpdate(newData)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择废弃物类型" />
                                </SelectTrigger>
                                <SelectContent>
                                  {wasteTypeNames.map((name) => (
                                    <SelectItem key={name} value={name}>
                                      {name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>废弃物重量(t)</Label>
                              <Input
                                type="number"
                                  value={item.quantity || 0}
                                onChange={(e) => {
                                    const quantity = parseFloat(e.target.value) || 0
                                  const newData = {
                                    ...carbonData,
                                    waste: carbonData.waste.map(w => {
                                      if (w.id === item.id) {
                                        const distance = w.transportDistance || 0
                                        const factor = w.factor || 0
                                        return {
                                          ...w,
                                            quantity: quantity,
                                            emission: Number((quantity * distance * factor).toFixed(2))
                                        }
                                      }
                                      return w
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              />
                              </div>
                              <div>
                                <Label>运输距离（KM）</Label>
                              <Input
                                type="number"
                                value={item.transportDistance || 0}
                                onChange={(e) => {
                                  const distance = parseFloat(e.target.value) || 0
                                  const newData = {
                                    ...carbonData,
                                    waste: carbonData.waste.map(w => {
                                      if (w.id === item.id) {
                                          const quantity = w.quantity || 0
                                        const factor = w.factor || 0
                                        return {
                                          ...w,
                                          transportDistance: distance,
                                            emission: Number((quantity * distance * factor).toFixed(2))
                                        }
                                      }
                                      return w
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              />
                              </div>
                              <div>
                                <Label>运输汽车类型</Label>
                              <Input
                                  value={item.transportVehicleType || ""}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>运输碳排放因子（kgCO₂/t·km）</Label>
                              <Input
                                type="number"
                                value={item.factor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>碳排放量（kg CO₂）</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                                <Label>排放范围</Label>
                              <Input
                                value={item.scope}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("waste", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("waste")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
                
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                        <strong>说明：</strong>
                    <br />
                    选择废弃物类型后，系统会自动填充运输碳排放因子（0.078 kgCO₂/t·km）、运输汽车类型（重型柴油货车运输(载重30t)）和排放范围（范围一）。
                    <br />
                    所有废弃物类型的运输碳排放因子均为0.078 kgCO₂/t·km，这是基于重型柴油货车运输的标准值。
                    <br />
                    碳排放量将根据废弃物重量、运输距离和运输碳排放因子自动计算。
                  </AlertDescription>
                </Alert>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 碳汇减碳量 */}
          <Collapsible
                open={activeTab === "carbonSink"}
                onOpenChange={() => setActiveTab("carbonSink")}
          >
                <CollapsibleTrigger asChild>
                  <Button variant="outline" className="w-full justify-between p-4 h-auto">
              <div className="flex items-center">
                <Trees className="w-5 h-5 mr-3" />
                      <span className="text-lg font-semibold">碳汇减碳量</span>
                      <span className="ml-2 text-sm text-gray-500">({carbonData.carbonSink.length} 项)</span>
              </div>
                    {activeTab === "carbonSink" ? (
                      <ChevronDown className="w-5 h-5" />
                    ) : (
                      <ChevronRight className="w-5 h-5" />
                    )}
                  </Button>
            </CollapsibleTrigger>
                <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
              <div className="space-y-4">
                      {carbonData.carbonSink.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>暂无数据，点击下方按钮添加条目</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {carbonData.carbonSink.map((item) => (
                          <div key={item.id} className="p-4 bg-white border rounded-lg">
                            <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                              <div>
                                <Label>植物种类</Label>
                              <Select
                                  value={item.name}
                                onValueChange={(value) => {
                                  const preset = presetEmissionFactors.carbonSink.find(p => p.category === value)
                                  if (preset) {
                                    const newData = {
                                      ...carbonData,
                                      carbonSink: carbonData.carbonSink.map(c => {
                                        if (c.id === item.id) {
                                          return {
                                            ...c,
                                              name: preset.category,
                                            unit: preset.unit,
                                            factor: preset.factor,
                                            scope: preset.scope
                                          }
                                        }
                                        return c
                                      })
                                    }
                                    onDataUpdate(newData)
                                  }
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择植物种类" />
                                </SelectTrigger>
                                <SelectContent>
                                  {presetEmissionFactors.carbonSink.map((preset) => (
                                    <SelectItem key={preset.category} value={preset.category}>
                                      {preset.category}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>栽种量</Label>
                              <Input
                                type="number"
                                  value={item.quantity || 0}
                                min={0}
                                onChange={(e) => {
                                    const quantity = parseFloat(e.target.value) || 0
                                  const newData = {
                                    ...carbonData,
                                    carbonSink: carbonData.carbonSink.map(c => {
                                      if (c.id === item.id) {
                                        const factor = c.factor || 0
                                        return {
                                          ...c,
                                            quantity: quantity,
                                            emission: Number((quantity * factor).toFixed(2))
                                        }
                                      }
                                      return c
                                    })
                                  }
                                  onDataUpdate(newData)
                                }}
                              />
                              </div>
                              <div>
                                <Label>单位</Label>
                              <Select
                                value={item.unit}
                                onValueChange={(value) => updateItem("carbonSink", item.id, "unit", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择单位" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="m2">m2</SelectItem>
                                  <SelectItem value="株">株</SelectItem>
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>固碳系数</Label>
                              <Input
                                type="number"
                                value={item.factor}
                                readOnly
                                className="bg-gray-50"
                              />
                              </div>
                              <div>
                                <Label>年固碳量（kg）</Label>
                              <Select
                                value={item.unit === "m2" ? "kg/m2" : "kg/a"}
                                onValueChange={(value) => updateItem("carbonSink", item.id, "unit", value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="选择单位" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="kg/m2">kg/m2</SelectItem>
                                  <SelectItem value="kg/a">kg/a</SelectItem>
                                </SelectContent>
                              </Select>
                              </div>
                              <div>
                                <Label>碳排放量</Label>
                                <Input
                                  type="number"
                                  value={item.emission}
                                  readOnly
                                  className="bg-gray-100"
                                />
                                <div className="text-xs text-gray-500 mt-1">kg CO₂e</div>
                              </div>
                              <div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem("carbonSink", item.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <Button
                      variant="outline"
                      onClick={() => addItem("carbonSink")}
                      className="w-full"
                    >
                    <Plus className="w-4 h-4 mr-2" />
                    添加条目
                  </Button>
              </div>
            </CollapsibleContent>
          </Collapsible>

          <div className="flex justify-center mt-6">
            <Button onClick={onCalculate}>
              计算碳排放
            </Button>
          </div>

          {/* 计算结果 */}
          {calculationResults && (
            <div className="mt-6 p-6 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">碳排放计算结果</h3>
              
              {/* 按类别分类 */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">按类别分类</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-sky-500">{calculationResults.materials}</div>
                    <div className="text-sm text-gray-600">材料生产 (kg CO₂e)</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-amber-700">{calculationResults.transport}</div>
                    <div className="text-sm text-gray-600">材料运输 (kg CO₂e)</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{calculationResults.construction}</div>
                    <div className="text-sm text-gray-600">施工建设 (kg CO₂e)</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{calculationResults.completion}</div>
                    <div className="text-sm text-gray-600">竣工交付 (kg CO₂e)</div>
                  </div>
                </div>
              </div>

              {/* 按范围分类 */}
              <div className="mb-6">
                <h4 className="text-md font-medium mb-3 text-gray-700">按排放范围分类</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-white rounded-lg border-l-4 border-red-500">
                    <div className="text-2xl font-bold text-red-600">{calculationResults.scope1}</div>
                    <div className="text-sm text-gray-600">范围一 (kg CO₂e)</div>
                    <div className="text-xs text-gray-500 mt-1">直接排放</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border-l-4 border-yellow-500">
                    <div className="text-2xl font-bold text-yellow-600">{calculationResults.scope2}</div>
                    <div className="text-sm text-gray-600">范围二 (kg CO₂e)</div>
                    <div className="text-xs text-gray-500 mt-1">间接排放-电力</div>
                  </div>
                  <div className="text-center p-4 bg-white rounded-lg border-l-4 border-blue-500">
                    <div className="text-2xl font-bold text-blue-600">{calculationResults.scope3}</div>
                    <div className="text-sm text-gray-600">范围三 (kg CO₂e)</div>
                    <div className="text-xs text-gray-500 mt-1">其他间接排放</div>
                  </div>
                </div>
              </div>

              {/* 碳汇减碳量 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3 text-gray-700">碳汇减碳计算结果</h4>
                <div className="text-center p-4 bg-white rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{calculationResults.carbonSink || 0}</div>
                  <div className="text-sm text-gray-600">碳汇减碳总量 (kg CO₂e)</div>
                </div>
              </div>

              {/* 总计 */}
              <div className="mb-6">
                <h4 className="text-lg font-bold mb-3 text-gray-700">总碳排放计算结果</h4>
              <div className="text-center p-4 bg-white rounded-lg border-2 border-gray-300">
                  <div className="text-2xl font-bold text-red-600">{calculationResults.total}</div>
                  <div className="text-sm text-gray-600">总碳排放 (kg CO₂e)</div>
                  <div className="text-sm text-gray-500 mt-1">已扣除碳汇减碳量</div>
              </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
        </div>
      </div>
    </div>
  )
} 