import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, Plus, Trash2, Calculator, Truck, Zap, Wrench, Leaf, HardHat, Users, ChevronRight, Info, Hammer, Package, Trees } from "lucide-react"
import { ExperimentStep, CarbonCalculationData, CarbonEmissionItem, CalculationResults, presetEmissionFactors, PresetEmissionFactor, EmissionScope } from "./types"
import { useState } from "react"

// 材料数据库 - 材料名称与碳排放因子的对应关系
const materialDatabase = {
  "C10混凝土": { factor: 210, unit: "kg CO2/m3", scope: "范围一" },
  "C15混凝土": { factor: 235, unit: "kg CO2/m3", scope: "范围一" },
  "C20混凝土": { factor: 241, unit: "kg CO2/m3", scope: "范围一" },
  "C20透水混凝土": { factor: 224.8, unit: "kg CO2/m3", scope: "范围一" },
  "C25混凝土": { factor: 255, unit: "kg CO2/m3", scope: "范围一" },
  "C30混凝土": { factor: 295, unit: "kg CO2/m3", scope: "范围一" },
  "普通硅酸盐水泥(市场平均)": { factor: 735, unit: "kg CO2/t", scope: "范围一" },
  "1:2抹灰用水泥砂浆": { factor: 531.52, unit: "kg CO2/m3", scope: "范围一" },
  "页岩实心砖": { factor: 292, unit: "kg CO2/m3", scope: "范围一" },
  "乳化沥青": { factor: 221, unit: "kg CO2/t", scope: "范围一" },
  "改性沥青": { factor: 295.91, unit: "kg CO2/t", scope: "范围一" },
  "沥青混合料": { factor: 2.199, unit: "kg CO2/m3", scope: "范围一" },
  "透水沥青混凝土": { factor: 2.199, unit: "kg CO2/m3", scope: "范围一" },
  "PE透水管": { factor: 3.6, unit: "kg CO2/kg", scope: "范围一" },
  "高密度聚乙烯": { factor: 2620, unit: "kg CO2/t", scope: "范围一" },
  "硬聚氯乙烯管": { factor: 7.93, unit: "kg CO2/kg", scope: "范围一" },
  "聚乙烯管": { factor: 3.6, unit: "kg CO2/kg", scope: "范围一" },
  "防渗土工布": { factor: 2.098, unit: "kg CO2/kg", scope: "范围一" },
  "陶瓷透水砖": { factor: 2.21, unit: "kg CO2/m3", scope: "范围一" },
  "普通碳钢(市场平均)": { factor: 2.05, unit: "kg CO2/kg", scope: "范围一" },
  "热轧碳钢钢筋": { factor: 2.34, unit: "kg CO2/kg", scope: "范围一" },
  "热轧碳钢无缝钢管": { factor: 3150, unit: "kg CO2/t", scope: "范围一" }
}

// 材料名称列表，用于下拉菜单
const materialNames = Object.keys(materialDatabase)

// 根据材料名称获取对应的碳排放因子信息
const getMaterialInfo = (materialName: string) => {
  return materialDatabase[materialName as keyof typeof materialDatabase]
}

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
  // 控制各个折叠面板的展开状态
  const [openSections, setOpenSections] = useState({
    labor: true,
    transport: false,
    materials: false,
    energy: false,
    temporary: false,
    waste: false,
    carbonSink: false
  })

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  // 添加新条目
  const addItem = (category: keyof CarbonCalculationData) => {
    const newItem: CarbonEmissionItem = {
      id: Date.now().toString(),
      category: "",
      consumption: 0,
      unit: "t",
      factor: 0,
      emission: 0,
      scope: "范围一",
      transportWeight: 0,
      transportDistance: 0,
      transportType: "",
      diesel: 0,
      electricity: 0,
      shifts: 0,
      workdays: 0
    }

    // 根据类别设置不同的初始值
    switch (category) {
      case "energy":
        newItem.factor = 249.085
        newItem.scope = "范围一"
        break
      case "labor":
        newItem.factor = 2.09
        newItem.scope = "范围三"
        break
      case "temporary":
        newItem.factor = 0.5810
        newItem.scope = "范围二"
        break
      case "transport":
        newItem.factor = 0.078
        newItem.transportType = "重型柴油货车运输(载重30t)"
        break
      case "carbonSink":
        newItem.consumption = 0
        newItem.unit = "m2"
        newItem.factor = 3.4127
        newItem.scope = "范围一"
        break
    }
    
    const newData = {
      ...carbonData,
      [category]: [...carbonData[category], newItem]
    }
    onDataUpdate(newData)
  }

  // 删除条目
  const removeItem = (category: keyof CarbonCalculationData, itemId: string) => {
    const newData = {
      ...carbonData,
      [category]: carbonData[category].filter(item => item.id !== itemId)
    }
    onDataUpdate(newData)
  }

  // 更新条目
  const updateItem = (category: keyof CarbonCalculationData, itemId: string, field: keyof CarbonEmissionItem, value: any) => {
    const newData = {
      ...carbonData,
      [category]: carbonData[category].map(item => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value }
          
          // 如果是材料类别，且选择了材料名称，则自动填充相关信息
          if (category === "materials" && field === "category" && value) {
            const materialInfo = getMaterialInfo(value)
            if (materialInfo) {
              updatedItem.factor = materialInfo.factor
              updatedItem.unit = materialInfo.unit
              updatedItem.scope = materialInfo.scope as EmissionScope
            }
          }
          
          // 如果是施工机械类别，且台班量变化，则自动计算碳排放量
          if (category === "energy" && field === "shifts") {
            updatedItem.emission = Number((updatedItem.factor * value).toFixed(2))
          }
          
          // 如果是人员活动类别，且累计有效工作日变化，则自动计算碳排放量
          if (category === "labor" && field === "workdays") {
            updatedItem.emission = Number((updatedItem.factor * value).toFixed(2))
          }
          
          // 如果是临时用能类别，且用电量变化，则自动计算碳排放量
          if (category === "temporary" && field === "consumption") {
            updatedItem.emission = Number((updatedItem.factor * value).toFixed(2))
          }
          
          // 自动计算排放量
          if (field === "consumption" || field === "factor") {
            updatedItem.emission = updatedItem.consumption * updatedItem.factor
          }
          
          return updatedItem
        }
        return item
      })
    }
    onDataUpdate(newData)
  }

  // 从预设选项中选择
  const selectPreset = (category: keyof CarbonCalculationData, itemId: string, presetCategory: string) => {
    const preset = presetEmissionFactors[category].find(p => p.category === presetCategory) as PresetEmissionFactor
    if (preset) {
      updateItem(category, itemId, "category", preset.category)
      updateItem(category, itemId, "unit", preset.unit)
      updateItem(category, itemId, "factor", preset.factor)
      updateItem(category, itemId, "scope", preset.scope)
      if (category === "transport" && preset.transportType) {
        updateItem(category, itemId, "transportType", preset.transportType)
      }
    }
  }

  // 渲染条目列表
  const renderItemList = (category: keyof CarbonCalculationData, title: string, icon: React.ReactNode) => {
    const items = carbonData[category]
    const isOpen = openSections[category]

    return (
      <Collapsible open={isOpen} onOpenChange={() => toggleSection(category)}>
        <CollapsibleTrigger asChild>
          <Button variant="outline" className="w-full justify-between p-4 h-auto">
            <div className="flex items-center">
              {icon}
              <span className="text-lg font-semibold">{title}</span>
              <span className="ml-2 text-sm text-gray-500">({items.length} 项)</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-5 h-5" />
            ) : (
              <ChevronRight className="w-5 h-5" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-4 p-4 border rounded-lg bg-gray-50">
          <div className="space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>暂无数据，点击下方按钮添加条目</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="p-4 bg-white border rounded-lg">
                    <div className="grid grid-cols-1 md:grid-cols-7 gap-4 items-end">
                      <div>
                        <Label>碳排放品种</Label>
                        <Select
                          value={item.category}
                          onValueChange={(value) => selectPreset(category, item.id, value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择或输入品种" />
                          </SelectTrigger>
                          <SelectContent>
                            {presetEmissionFactors[category].map((preset) => (
                              <SelectItem key={preset.category} value={preset.category}>
                                {preset.category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Input
                          className="mt-2"
                          placeholder="或手动输入"
                          value={item.category}
                          onChange={(e) => updateItem(category, item.id, "category", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>消耗量</Label>
                        <Input
                          type="number"
                          value={item.consumption}
                          onChange={(e) => updateItem(category, item.id, "consumption", parseFloat(e.target.value) || 0)}
                        />
                      </div>
                      <div>
                        <Label>单位</Label>
                        <Input
                          value={item.unit}
                          onChange={(e) => updateItem(category, item.id, "unit", e.target.value)}
                        />
                      </div>
                      <div>
                        <Label>排放因子</Label>
                        <Input
                          type="number"
                          step="0.001"
                          value={item.factor}
                          onChange={(e) => updateItem(category, item.id, "factor", parseFloat(e.target.value) || 0)}
                        />
                        <div className="text-xs text-gray-500 mt-1">kg CO₂e/单位</div>
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
                        <Label>排放范围 <span className="text-red-500">*</span></Label>
                        <Select
                          value={item.scope}
                          onValueChange={(value: EmissionScope) => updateItem(category, item.id, "scope", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="选择范围" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="范围一">范围一</SelectItem>
                            <SelectItem value="范围二">范围二</SelectItem>
                            <SelectItem value="范围三">范围三</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="text-xs text-gray-500 mt-1">必选项</div>
                      </div>
                      <div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(category, item.id)}
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
              onClick={() => addItem(category)}
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
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calculator className="w-5 h-5 mr-2" />
          碳核算
        </CardTitle>
        <CardDescription>
          分别计算材料生产阶段、材料运输阶段、施工建设阶段、竣工交付阶段四个方面的碳排放，以及碳汇减碳量
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* 材料生产阶段碳排放 */}
        <Collapsible
          open={openSections.materials}
          onOpenChange={() => toggleSection("materials")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Package className="w-5 h-5 mr-3" />
              <span className="text-lg font-bold">材料生产阶段产生的碳排放</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSections.materials ? "transform rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="space-y-4">
              {/* 材料生产碳排放计算 */}
              <h4 className="text-md font-medium">材料生产碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">材料名称</th>
                      <th className="p-2 border">材料消耗量</th>
                      <th className="p-2 border">单位</th>
                      <th className="p-2 border">材料碳排放因子</th>
                      <th className="p-2 border">单位</th>
                      <th className="p-2 border">碳排放量(kg CO2)</th>
                      <th className="p-2 border">排放范围</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.materials.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.materials.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => updateItem("materials", item.id, "category", value)}
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.consumption}
                              onChange={(e) => updateItem("materials", item.id, "consumption", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              value={item.unit}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              value={getMaterialInfo(item.category)?.unit || ""}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border">
                            <Input
                              value={item.scope}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("materials", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("materials")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>材料名称与碳排放因子联动说明：</strong>
                  <br />
                  选择材料名称后，系统会自动填充对应的碳排放因子、单位和排放范围，确保数据的准确性和一致性。
                  <br />
                  碳排放量将根据材料消耗量和碳排放因子自动计算。
                  <br />
                  <strong>排放范围说明：</strong>范围一（直接排放）、范围二（间接排放-电力）、范围三（其他间接排放）。
                </AlertDescription>
              </Alert>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* 材料运输阶段碳排放 */}
        <Collapsible
          open={openSections.transport}
          onOpenChange={() => toggleSection("transport")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Truck className="w-5 h-5 mr-3" />
              <span className="text-lg font-bold">材料运输阶段产生的碳排放</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSections.transport ? "transform rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="space-y-4">
              {/* 材料运输碳排放计算 */}
              <h4 className="text-md font-medium">材料运输碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">材料名称</th>
                      <th className="p-2 border">材料重量（t）</th>
                      <th className="p-2 border">平均运输距离（km）</th>
                      <th className="p-2 border">运输汽车类型</th>
                      <th className="p-2 border">运输碳排放因子（kgCO₂/t·km）</th>
                      <th className="p-2 border">碳排放量（kg CO₂）</th>
                      <th className="p-2 border">排放范围</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.transport.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.transport.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                // 当选择材料名称时，自动填充运输相关信息
                                const newData = {
                                  ...carbonData,
                                  transport: carbonData.transport.map(t => {
                                    if (t.id === item.id) {
                                      return {
                                        ...t,
                                        category: value,
                                        factor: transportEmissionFactor,
                                        transportType: transportVehicleType,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.transportWeight || 0}
                              onChange={(e) => {
                                const weight = parseFloat(e.target.value) || 0
                                const newData = {
                                  ...carbonData,
                                  transport: carbonData.transport.map(t => {
                                    if (t.id === item.id) {
                                      const distance = t.transportDistance || 0
                                      const factor = t.factor || 0
                                      return {
                                        ...t,
                                        transportWeight: weight,
                                        emission: Number((weight * distance * factor).toFixed(2))
                                      }
                                    }
                                    return t
                                  })
                                }
                                onDataUpdate(newData)
                              }}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.transportDistance || 0}
                              onChange={(e) => {
                                const distance = parseFloat(e.target.value) || 0
                                const newData = {
                                  ...carbonData,
                                  transport: carbonData.transport.map(t => {
                                    if (t.id === item.id) {
                                      const weight = t.transportWeight || 0
                                      const factor = t.factor || 0
                                      return {
                                        ...t,
                                        transportDistance: distance,
                                        emission: Number((weight * distance * factor).toFixed(2))
                                      }
                                    }
                                    return t
                                  })
                                }
                                onDataUpdate(newData)
                              }}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              value={item.transportType || ""}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border">
                            <Input
                              value={item.scope}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("transport", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("transport")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>材料运输碳排放因子联动说明：</strong>
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
          open={openSections.energy}
          onOpenChange={() => toggleSection("energy")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Hammer className="w-5 h-5 mr-3" />
              <span className="text-lg font-bold">施工建设阶段产生的碳排放</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSections.energy ? "transform rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* 施工机械能源消耗碳排放计算 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">施工机械能源消耗碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">机械名称</th>
                      <th className="p-2 border">柴油(kg)</th>
                      <th className="p-2 border">电(kW·h)</th>
                      <th className="p-2 border">碳排放系数（kg CO2/台班）</th>
                      <th className="p-2 border">台班量</th>
                      <th className="p-2 border">碳排放量</th>
                      <th className="p-2 border">排放范围</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.energy.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.energy.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
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
                                          category: value,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.diesel || 0}
                              onChange={(e) => updateItem("energy", item.id, "diesel", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.electricity || 0}
                              onChange={(e) => updateItem("energy", item.id, "electricity", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.shifts || 0}
                              onChange={(e) => updateItem("energy", item.id, "shifts", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border">
                            <Input
                              value={item.scope}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("energy", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("energy")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>施工机械碳排放系数联动说明：</strong>
                  <br />
                  选择机械名称后，系统会自动填充对应的碳排放系数（kg CO2/台班）和排放范围。
                  <br />
                  柴油机械的排放范围为"范围一"（直接排放），电动机械的排放范围为"范围二"（间接排放-电力）。
                  <br />
                  碳排放量将根据碳排放系数和台班量自动计算。
                </AlertDescription>
              </Alert>
            </div>

            {/* 人员活动碳排放计算 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">人员活动碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">劳动者类型</th>
                      <th className="p-2 border">累计有效工作日</th>
                      <th className="p-2 border">生活碳排放因子（kg/人·天）</th>
                      <th className="p-2 border">碳排放量</th>
                      <th className="p-2 border">排放范围</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.labor.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.labor.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                const laborerInfo = getLaborerTypeInfo(value)
                                if (laborerInfo) {
                                  const newData = {
                                    ...carbonData,
                                    labor: carbonData.labor.map(l => {
                                      if (l.id === item.id) {
                                        return {
                                          ...l,
                                          category: value,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.workdays || 0}
                              onChange={(e) => updateItem("labor", item.id, "workdays", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border">
                            <Input
                              value={item.scope}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("labor", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("labor")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>劳动者类型与生活碳排放因子联动说明：</strong>
                  <br />
                  选择劳动者类型后，系统会自动填充对应的生活碳排放因子（kg/人·天）和排放范围。
                  <br />
                  所有人员活动的排放范围均为"范围三"（其他间接排放）。
                  <br />
                  碳排放量将根据生活碳排放因子和累计有效工作日自动计算。
                </AlertDescription>
              </Alert>
            </div>

            {/* 临时用能碳排放计算 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">临时用能碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">类型</th>
                      <th className="p-2 border">用电量/kWh</th>
                      <th className="p-2 border">电网排放因子（t/（MW·h））</th>
                      <th className="p-2 border">碳排量（kg）</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.temporary.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.temporary.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                const energyInfo = getTemporaryEnergyInfo(value)
                                if (energyInfo) {
                                  const newData = {
                                    ...carbonData,
                                    temporary: carbonData.temporary.map(t => {
                                      if (t.id === item.id) {
                                        return {
                                          ...t,
                                          category: value,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.consumption || 0}
                              onChange={(e) => updateItem("temporary", item.id, "consumption", parseFloat(e.target.value) || 0)}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("temporary", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("temporary")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>临时用能类型与电网排放因子联动说明：</strong>
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
          open={openSections.waste}
          onOpenChange={() => toggleSection("waste")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Truck className="w-5 h-5 mr-3" />
              <span className="text-lg font-bold">竣工交付阶段产生的碳排放</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSections.waste ? "transform rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            {/* 废弃物运输碳排放计算 */}
            <div className="space-y-4">
              <h4 className="text-md font-medium">废弃物运输碳排放计算</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">废弃物类型</th>
                      <th className="p-2 border">废弃物重量(t)</th>
                      <th className="p-2 border">运输距离（KM）</th>
                      <th className="p-2 border">运输汽车类型</th>
                      <th className="p-2 border">运输碳排放因子（kgCO₂/t·km）</th>
                      <th className="p-2 border">碳排放量（kg CO₂）</th>
                      <th className="p-2 border">排放范围</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.waste.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.waste.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                const wasteInfo = getWasteTypeInfo(value)
                                if (wasteInfo) {
                                  const newData = {
                                    ...carbonData,
                                    waste: carbonData.waste.map(w => {
                                      if (w.id === item.id) {
                                        return {
                                          ...w,
                                          category: value,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.transportWeight || 0}
                              onChange={(e) => {
                                const weight = parseFloat(e.target.value) || 0
                                const newData = {
                                  ...carbonData,
                                  waste: carbonData.waste.map(w => {
                                    if (w.id === item.id) {
                                      const distance = w.transportDistance || 0
                                      const factor = w.factor || 0
                                      return {
                                        ...w,
                                        transportWeight: weight,
                                        emission: Number((weight * distance * factor).toFixed(2))
                                      }
                                    }
                                    return w
                                  })
                                }
                                onDataUpdate(newData)
                              }}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.transportDistance || 0}
                              onChange={(e) => {
                                const distance = parseFloat(e.target.value) || 0
                                const newData = {
                                  ...carbonData,
                                  waste: carbonData.waste.map(w => {
                                    if (w.id === item.id) {
                                      const weight = w.transportWeight || 0
                                      const factor = w.factor || 0
                                      return {
                                        ...w,
                                        transportDistance: distance,
                                        emission: Number((weight * distance * factor).toFixed(2))
                                      }
                                    }
                                    return w
                                  })
                                }
                                onDataUpdate(newData)
                              }}
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              value={item.transportType || ""}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border">
                            <Input
                              value={item.scope}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("waste", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("waste")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
              
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>废弃物类型与运输碳排放因子联动说明：</strong>
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
          open={openSections.carbonSink}
          onOpenChange={() => toggleSection("carbonSink")}
        >
          <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <Trees className="w-5 h-5 mr-3" />
              <span className="text-lg font-bold">碳汇减碳量</span>
            </div>
            <ChevronDown className={`w-5 h-5 transition-transform ${openSections.carbonSink ? "transform rotate-180" : ""}`} />
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-4 space-y-4">
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-2 border">序号</th>
                      <th className="p-2 border">植物种类</th>
                      <th className="p-2 border">栽种量</th>
                      <th className="p-2 border">单位</th>
                      <th className="p-2 border">固碳系数</th>
                      <th className="p-2 border">单位</th>
                      <th className="p-2 border">年固碳量（kg）</th>
                      <th className="p-2 border">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {carbonData.carbonSink.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-4 text-center text-gray-500">
                          暂无数据，点击下方按钮添加条目
                        </td>
                      </tr>
                    ) : (
                      carbonData.carbonSink.map((item, index) => (
                        <tr key={item.id}>
                          <td className="p-2 border text-center">{index + 1}</td>
                          <td className="p-2 border">
                            <Select
                              value={item.category}
                              onValueChange={(value) => {
                                const preset = presetEmissionFactors.carbonSink.find(p => p.category === value)
                                if (preset) {
                                  const newData = {
                                    ...carbonData,
                                    carbonSink: carbonData.carbonSink.map(c => {
                                      if (c.id === item.id) {
                                        return {
                                          ...c,
                                          category: preset.category,
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.consumption || 0}
                              min={0}
                              onChange={(e) => {
                                const consumption = parseFloat(e.target.value) || 0
                                const newData = {
                                  ...carbonData,
                                  carbonSink: carbonData.carbonSink.map(c => {
                                    if (c.id === item.id) {
                                      const factor = c.factor || 0
                                      return {
                                        ...c,
                                        consumption: consumption,
                                        emission: Number((consumption * factor).toFixed(2))
                                      }
                                    }
                                    return c
                                  })
                                }
                                onDataUpdate(newData)
                              }}
                            />
                          </td>
                          <td className="p-2 border">
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
                          </td>
                          <td className="p-2 border">
                            <Input
                              type="number"
                              value={item.factor}
                              readOnly
                              className="bg-gray-50"
                            />
                          </td>
                          <td className="p-2 border">
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
                          </td>
                          <td className="p-2 border text-center">{item.emission}</td>
                          <td className="p-2 border text-center">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem("carbonSink", item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end">
                <Button onClick={() => addItem("carbonSink")}>
                  <Plus className="w-4 h-4 mr-2" />
                  添加条目
                </Button>
              </div>
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
  )
} 