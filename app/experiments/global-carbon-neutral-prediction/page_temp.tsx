"use client"

import { useState, useEffect } from "react"
import dynamic from 'next/dynamic'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Play, FileText, BarChart3, TrendingUp, Leaf } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts'

// 绫诲瀷瀹氫箟
type ProvinceData = {
  name: string
  code: string
  center: [number, number]
  carbonEmission: number // 纰虫帓鏀鹃噺 (涓囧惃)
  population: number // 甯镐綇浜哄彛 (涓囦汉)
  urbanizationRate: number // 鍩庨晣鍖栫巼 (%)
  gdp: number // 鐪丟DP (浜垮厓)
  energyConsumption: number // 鎬昏兘鑰?(涓囧惃鏍囧噯鐓?
  coalConsumption: number // 鐓ょ偔娑堣€楅噺 (涓囧惃)
  secondaryIndustryValue: number // 绗簩浜т笟澧炲姞鍊?(浜垮厓)
  landTypes: {
    farmland: number // 鑰曞湴闈㈢Н (涓囧叕椤?
    forestland: number // 鏋楀湴闈㈢Н (涓囧叕椤?
    grassland: number // 鑽夊湴闈㈢Н (涓囧叕椤?
    urbanGreen: number // 鍩庡競缁垮湴闈㈢Н (涓囧叕椤?
  }
  carbonAbsorption: number // 纰冲惛鏀堕噺 (涓囧惃)
}

// STIRPAT妯″瀷鍙傛暟绫诲瀷
type STIRPATParams = {
  province: string
  cons: number // 甯告暟椤?  lnP: number // 浜哄彛绯绘暟
  lnU: number // 鍩庨晣鍖栫巼绯绘暟
  lnA: number // 浜哄潎GDP绯绘暟
  lnA2: number // 浜哄潎GDP骞虫柟椤圭郴鏁?  lnT: number // 纰虫帓鏀惧己搴︾郴鏁?  lnE1: number // 鑳芥簮寮哄害绯绘暟
  lnE2: number // 鑳芥簮缁撴瀯绯绘暟
  lnIS: number // 浜т笟缁撴瀯绯绘暟
  r2: number // R虏鍊?}

// 涓浗鍚勭渷浠芥暟鎹紙绀轰緥鏁版嵁锛?const provinceData: ProvinceData[] = [
  {
    name: "鍖椾含",
    code: "110000",
    center: [116.4074, 39.9042],
    carbonEmission: 12500,
    population: 2189,
    urbanizationRate: 86.5,
    gdp: 40269,
    energyConsumption: 7200,
    coalConsumption: 1800,
    secondaryIndustryValue: 7716,
    landTypes: { farmland: 12.8, forestland: 61.4, grassland: 8.2, urbanGreen: 4.6 },
    carbonAbsorption: 245.2
  },
  {
    name: "涓婃捣",
    code: "310000",
    center: [121.4737, 31.2304],
    carbonEmission: 18900,
    population: 2487,
    urbanizationRate: 88.1,
    gdp: 43214,
    energyConsumption: 11200,
    coalConsumption: 2800,
    secondaryIndustryValue: 10968,
    landTypes: { farmland: 18.5, forestland: 9.8, grassland: 2.1, urbanGreen: 3.2 },
    carbonAbsorption: 52.4
  },
  {
    name: "骞夸笢",
    code: "440000",
    center: [113.2644, 23.1291],
    carbonEmission: 65800,
    population: 12601,
    urbanizationRate: 74.2,
    gdp: 129118,
    energyConsumption: 32500,
    coalConsumption: 8900,
    secondaryIndustryValue: 53728,
    landTypes: { farmland: 156.2, forestland: 1052.8, grassland: 45.6, urbanGreen: 12.8 },
    carbonAbsorption: 4058.7
  },
  {
    name: "姹熻嫃",
    code: "320000",
    center: [118.7633, 32.0615],
    carbonEmission: 78200,
    population: 8515,
    urbanizationRate: 73.4,
    gdp: 122875,
    energyConsumption: 35600,
    coalConsumption: 12800,
    secondaryIndustryValue: 56909,
    landTypes: { farmland: 345.6, forestland: 156.8, grassland: 12.4, urbanGreen: 8.9 },
    carbonAbsorption: 625.8
  },
  {
    name: "灞变笢",
    code: "370000",
    center: [117.0009, 36.6758],
    carbonEmission: 89500,
    population: 10152,
    urbanizationRate: 63.8,
    gdp: 83095,
    energyConsumption: 42800,
    coalConsumption: 18900,
    secondaryIndustryValue: 33546,
    landTypes: { farmland: 456.8, forestland: 298.5, grassland: 34.2, urbanGreen: 15.6 },
    carbonAbsorption: 1205.4
  },
  {
    name: "娌冲崡",
    code: "410000",
    center: [113.6401, 34.7566],
    carbonEmission: 67800,
    population: 9883,
    urbanizationRate: 56.5,
    gdp: 61345,
    energyConsumption: 28900,
    coalConsumption: 15600,
    secondaryIndustryValue: 27598,
    landTypes: { farmland: 678.9, forestland: 245.6, grassland: 56.8, urbanGreen: 12.3 },
    carbonAbsorption: 1025.6
  }
]

// STIRPAT妯″瀷鍙傛暟鏁版嵁锛堝熀浜庣爺绌惰〃鏍硷級
const stirpatParams: STIRPATParams[] = [
  {
    province: "鍖椾含",
    cons: -17.675,
    lnP: 0.285,
    lnU: 5.458,
    lnA: 0.025,
    lnA2: -0.001,
    lnT: 0.379,
    lnE1: 0.183,
    lnE2: -0.021,
    lnIS: -0.250,
    r2: 0.806
  },
  {
    province: "涓婃捣",
    cons: -1.684,
    lnP: 0.342,
    lnU: 1.877,
    lnA: 0.140,
    lnA2: 0.027,
    lnT: 0.061,
    lnE1: 0.002,
    lnE2: -0.055,
    lnIS: -0.016,
    r2: 0.942
  },
  {
    province: "骞夸笢",
    cons: -1.449,
    lnP: 1.017,
    lnU: 0.719,
    lnA: 0.120,
    lnA2: 0.025,
    lnT: -0.001,
    lnE1: -0.024,
    lnE2: 0.403,
    lnIS: 0.145,
    r2: 0.971
  },
  {
    province: "姹熻嫃",
    cons: -35.044,
    lnP: 4.862,
    lnU: 0.543,
    lnA: 0.134,
    lnA2: 0.016,
    lnT: 0.187,
    lnE1: 0.004,
    lnE2: 0.639,
    lnIS: -0.154,
    r2: 0.907
  },
  {
    province: "灞变笢",
    cons: 1.437,
    lnP: 1.000,
    lnU: 0.102,
    lnA: 0.112,
    lnA2: 0.023,
    lnT: -0.040,
    lnE1: -0.013,
    lnE2: -0.031,
    lnIS: 0.086,
    r2: 0.861
  },
  {
    province: "娌冲崡",
    cons: 61.576,
    lnP: -5.730,
    lnU: 0.501,
    lnA: 0.224,
    lnA2: 0.056,
    lnT: 0.099,
    lnE1: -0.103,
    lnE2: -0.185,
    lnIS: 0.914,
    r2: 0.930
  }
]

// 纰冲惛鏀剁郴鏁?const carbonAbsorptionCoefficients = {
  farmland: 0.007, // t路hm虏路a鈦宦?  forestland: 3.8096,
  grassland: 0.9482,
  urbanGreen: 2.3789 // (鏋楀湴+鑽夊湴)/2
}

// 鍔ㄦ€佸鍏ュ湴鍥剧粍浠?const ChinaMap = dynamic(
  () => import('./china-map-component'),
  { ssr: false }
)

export default function CarbonNeutralPredictionPage() {
  const [currentStep, setCurrentStep] = useState(1)
  const [selectedProvince, setSelectedProvince] = useState<string>("鍏ㄥ浗")
  const [predictionYears, setPredictionYears] = useState(30)
  const [carbonIntensityReduction, setCarbonIntensityReduction] = useState(3.5) // 骞撮€掑噺鐜?%
  const [policyAdvice, setPolicyAdvice] = useState("")
  const [excelData, setExcelData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  
  // 鎶ュ憡鍐呭鐘舵€?  const [experimentOverview, setExperimentOverview] = useState("")
  const [predictionResults, setPredictionResults] = useState("")
  const [absorptionAnalysis, setAbsorptionAnalysis] = useState("")
  const [carbonNeutralPrediction, setCarbonNeutralPrediction] = useState("")
  
  // 鏃堕棿杞存帶鍒剁姸鎬?  const [timeRange, setTimeRange] = useState([2019, 2060])
  
  // 鍔犺浇Excel鏁版嵁
  useEffect(() => {
    const loadExcelData = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/read-excel-data')
        const result = await response.json()
        if (result.success) {
          setExcelData(result.data)
        }
      } catch (error) {
        console.error('鍔犺浇Excel鏁版嵁澶辫触:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadExcelData()
  }, [])
  
  // 璁＄畻纰冲惛鏀堕噺
  const calculateCarbonAbsorption = (province: ProvinceData) => {
    const { landTypes } = province
    return (
      landTypes.farmland * 10000 * carbonAbsorptionCoefficients.farmland +
      landTypes.forestland * 10000 * carbonAbsorptionCoefficients.forestland +
      landTypes.grassland * 10000 * carbonAbsorptionCoefficients.grassland +
      landTypes.urbanGreen * 10000 * carbonAbsorptionCoefficients.urbanGreen
    ) / 10000 // 杞崲涓轰竾鍚?  }

  // 浠嶦xcel鏁版嵁璁＄畻纰冲惛鏀堕噺 - 涓ユ牸鎸夌収鍏紡 C岬?= S岬?脳 V岬?  const calculateCarbonAbsorptionFromExcel = (provinceData: any) => {
    const farmland = provinceData['farmland'] || 0
    const forestland = provinceData['forestland'] || 0
    const grassland = provinceData['grassland'] || 0
    const urbanGreen = provinceData['urbanGreen'] || 0
    
    // 纰冲惛鏀剁郴鏁?    const carbonAbsorptionCoefficients = {
      farmland: 0.007, // t路hm虏路a鈦宦?      forestland: 3.8096,
      grassland: 0.9482,
      urbanGreen: 2.3789
    }
    
    // 涓ユ牸鎸夌収鍏紡 C岬?= S岬?脳 V岬?    const totalAbsorption = 
      farmland * carbonAbsorptionCoefficients.farmland +
      forestland * carbonAbsorptionCoefficients.forestland +
      grassland * carbonAbsorptionCoefficients.grassland +
      urbanGreen * carbonAbsorptionCoefficients.urbanGreen
    
    return totalAbsorption / 10000 // 杞崲涓轰竾鍚?  }

  // 鍥涚鎯呮櫙鐨勭⒊鎺掓斁寮哄害涓嬮檷鐜?- 鍩轰簬鏀跨瓥鏂囦欢鏁版嵁
  const scenarioRates = {
    inertial: 3.85,     // 鎯€у彂灞曟儏鏅?- 3.85%骞村潎閫掑噺鐜囷紙鍩轰簬鍥藉鑷富璐＄尞锛?    planning: 3.9,      // 瑙勫垝鎺у埗鎯呮櫙 - 3.9%骞村潎涓嬮檷鐜囷紙鍩轰簬"鍗佷笁浜?鏂规锛?    peak: 3.89,         // 杈惧嘲绾︽潫鎯呮櫙 - 3.89%骞村潎涓嬮檷鐜囷紙鍩轰簬鐩稿叧鐮旂┒锛?    green: 4.1          // 缁胯壊鍙戝睍鎯呮櫙 - 鍩虹4.1%锛屾瘡5骞磋皟楂?.5%锛堝熀浜?030骞寸⒊杈惧嘲琛屽姩鏂规锛?  }

  // 璁＄畻纰宠揪宄板勾浠?- 鍩轰簬鍘熸枃棰勬祴缁撴灉
  const calculatePeakYear = (scenario: keyof typeof scenarioRates, provinceName: string) => {
    // 鍩轰簬鍘熸枃鐨勯娴嬬粨鏋滐紝涓轰笉鍚岀渷浠藉拰鎯呮櫙璁剧疆杈惧嘲骞翠唤
    const peakYears: Record<string, Record<keyof typeof scenarioRates, number>> = {
      "榛戦緳姹?: { inertial: 2031, planning: 2025, peak: 2029, green: 2020 },
      "澶╂触": { inertial: 2033, planning: 2022, peak: 2029, green: 2020 },
      "娌冲寳": { inertial: 2033, planning: 2022, peak: 2029, green: 2020 },
      "鍐呰挋鍙?: { inertial: 2033, planning: 2024, peak: 2029, green: 2020 },
      "鏂扮枂": { inertial: 2034, planning: 2044, peak: 2029, green: 2021 },
      "鍖椾含": { inertial: 2052, planning: 2021, peak: 2029, green: 2021 },
      "涓婃捣": { inertial: 2040, planning: 2021, peak: 2029, green: 2020 },
      "骞夸笢": { inertial: 2038, planning: 2021, peak: 2029, green: 2021 },
      "姹熻嫃": { inertial: 2036, planning: 2023, peak: 2029, green: 2021 },
      "娴欐睙": { inertial: 2035, planning: 2023, peak: 2029, green: 2021 },
      "灞变笢": { inertial: 2037, planning: 2023, peak: 2029, green: 2020 },
      "娴峰崡": { inertial: 2045, planning: 2048, peak: 2029, green: 2022 },
      "闈掓捣": { inertial: 2042, planning: 2040, peak: 2029, green: 2021 },
      "灞辫タ": { inertial: 2039, planning: 2032, peak: 2029, green: 2020 },
      "浜戝崡": { inertial: 2041, planning: 2031, peak: 2029, green: 2022 },
      "瀹夊窘": { inertial: 2051, planning: 2025, peak: 2029, green: 2022 },
      "璐靛窞": { inertial: 2050, planning: 2026, peak: 2029, green: 2023 },
      "婀栧寳": { inertial: 2044, planning: 2024, peak: 2029, green: 2021 },
      "鐢樿們": { inertial: 2043, planning: 2027, peak: 2029, green: 2020 },
      "杈藉畞": { inertial: 2035, planning: 2024, peak: 2029, green: 2020 },
      "鍚夋灄": { inertial: 2034, planning: 2025, peak: 2029, green: 2020 },
      "娌冲崡": { inertial: 2040, planning: 2025, peak: 2029, green: 2021 } // 娣诲姞娌冲崡
    }
    
    // 濡傛灉娌℃湁鐗瑰畾鐪佷唤鐨勬暟鎹紝浣跨敤榛樿鍊?    const defaultPeakYears = {
      inertial: 2040, // 鎯€у彂灞曟儏鏅粯璁?040骞磋揪宄?      planning: 2025, // 瑙勫垝鎺у埗鎯呮櫙榛樿2025骞磋揪宄?      peak: 2029,     // 杈惧嘲绾︽潫鎯呮櫙缁熶竴2029骞磋揪宄?      green: 2021     // 缁胯壊鍙戝睍鎯呮櫙榛樿2021骞磋揪宄?    }
    
    return peakYears[provinceName]?.[scenario] || defaultPeakYears[scenario]
  }

  // 璁＄畻2005-2019骞碐DP骞村潎澧為暱鐜?  const calculateGDPGrowthRate = (provinceName: string) => {
    // 鑾峰彇2005骞村拰2019骞寸殑GDP鏁版嵁
    const gdp2005 = excelData.find(item => item['鐪佷唤'] === provinceName && item['骞翠唤'] === 2005)?.['gdp'] || 0
    const gdp2019 = excelData.find(item => item['鐪佷唤'] === provinceName && item['骞翠唤'] === 2019)?.['gdp'] || 0
    
    if (gdp2005 > 0 && gdp2019 > 0) {
      // 璁＄畻骞村潎澧為暱鐜囷細(2019骞碐DP/2005骞碐DP)^(1/14) - 1
      const years = 2019 - 2005
      const growthRate = Math.pow(gdp2019 / gdp2005, 1/years) - 1
      return growthRate
    }
    
    // 濡傛灉娌℃湁鏁版嵁锛屼娇鐢ㄩ粯璁ゅ€?    return 0.05 // 榛樿5%
  }

  // 鑾峰彇2015骞寸⒊鎺掓斁寮哄害鏁版嵁
  const get2015CarbonIntensity = (provinceName: string) => {
    const data2015 = excelData.find(item => item['鐪佷唤'] === provinceName && item['骞翠唤'] === 2015)
    if (data2015) {
      const carbonEmission2015 = data2015['co2Emission'] || 0 // 涓囧惃
      const gdp2015 = data2015['gdp'] || 0 // 浜垮厓
      const baseEmission2015 = carbonEmission2015 * 10000 // 杞崲涓哄惃
      const baseGDP2015 = gdp2015 * 10000 // 杞崲涓轰竾鍏?      return baseEmission2015 / baseGDP2015 // 纰虫帓鏀惧己搴︼紙t/涓囧厓锛?    }
    return null
  }

  // 鑾峰彇2020骞寸⒊鎺掓斁寮哄害鏁版嵁
  const get2020CarbonIntensity = (provinceName: string) => {
    const data2020 = excelData.find(item => item['鐪佷唤'] === provinceName && item['骞翠唤'] === 2020)
    if (data2020) {
      return data2020['carbonIntensity'] || null
    }
    return null
  }

  // 涓ユ牸鎸夌収鏂囨。鏂规硶瀹炵幇纰虫帓鏀鹃娴?- 鎵€鏈夋暟鎹粠鍘熷鏂囦欢鑾峰彇
  const predictCarbonEmissionFromExcel = (provinceData: any, year: number, scenario: keyof typeof scenarioRates = 'inertial') => {
    const baseYear = 2019
    const yearDiff = year - baseYear
    const provinceName = provinceData['鐪佷唤'] || "鍏ㄥ浗"
    
    // 浠嶦xcel鏁版嵁鑾峰彇鍩虹淇℃伅 - 鎵€鏈夋暟鎹兘浠庡師濮嬫枃浠惰幏鍙?    const carbonEmission = provinceData['co2Emission'] || 0 // 涓囧惃
    const population = provinceData['population'] || 0 // 涓囦汉
    const urbanizationRate = provinceData['urbanizationRate'] || 0 // %
    const gdp = provinceData['gdp'] || 0 // 浜垮厓
    const energyConsumption = provinceData['energyConsumption'] || 0 // 涓囧惃鏍囧噯鐓?    const coalConsumption = provinceData['coalConsumption'] || 0 // 涓囧惃
    const secondaryIndustryValue = provinceData['secondaryIndustryRatio'] || 0 // %
    
    // 瀵逛簬鍩哄噯骞达紙2019骞达級锛岀洿鎺ヨ繑鍥炲師濮嬫暟鎹紝涓嶅簲鐢ㄩ娴嬪叕寮?    if (year === baseYear) {
      return carbonEmission // 鐩存帴杩斿洖2019骞寸殑瀹為檯纰虫帓鏀鹃噺
    }
    
    // 鍩轰簬2019骞村熀鍑嗘暟鎹?    const baseEmission = carbonEmission * 10000 // 杞崲涓哄惃
    const baseGDP = gdp * 10000 // 杞崲涓轰竾鍏?    const basePopulation = population * 10000 // 杞崲涓轰汉
    const basePerCapitaGDP = baseGDP / basePopulation // 浜哄潎GDP锛堝厓锛?    const baseCarbonIntensity = baseEmission / baseGDP // 纰虫帓鏀惧己搴︼紙t/涓囧厓锛?    const baseEnergyIntensity = energyConsumption * 10000 / baseGDP // 鑳芥簮寮哄害锛坱ce/涓囧厓锛?    const baseEnergyStructure = coalConsumption / energyConsumption * 100 // 鑳芥簮缁撴瀯锛堢叅鐐崰姣?锛?    const baseIndustryStructure = secondaryIndustryValue // 浜т笟缁撴瀯锛堢浜屼骇涓氬崰姣?锛?    
    // 璁＄畻2005-2019骞碐DP骞村潎澧為暱鐜?- 浠庡師濮嬫暟鎹幏鍙?    const gdpGrowthRate = calculateGDPGrowthRate(provinceName)
    
    // 棰勬祴GDP锛堝熀浜?005-2019骞寸殑鐪熷疄骞村潎鍙樺寲閲忥級
    const predictedGDP = baseGDP * Math.pow(1 + gdpGrowthRate, yearDiff)
    
    // 鏍规嵁鎯呮櫙璁＄畻纰虫帓鏀惧己搴︿笅闄嶇巼 - 鍩轰簬鍘熷鏁版嵁璁＄畻
    let carbonIntensityReductionRate = 0
    
    switch (scenario) {
      case 'inertial':
        // 鎯€у彂灞曟儏鏅細GDP浠?005-2019骞寸殑骞村潎鍙樺寲閲忓钩绋抽€掑锛岀⒊鎺掓斁寮哄害浠ヤ腑鍥藉浗瀹惰嚜涓昏础鐚腑鐨勬壙璇轰负渚濇嵁閫掑噺
        // 鏍规嵁涓浗鍥藉鑷富璐＄尞锛氫负瀹炵幇2030骞村崟浣岹DP浜屾哀鍖栫⒊鎺掓斁姣?005骞翠笅闄?0%鑷?5%鐨勭洰鏍囷紝
        // 2015-2030骞翠腑鍥界⒊寮哄害涓嬮檷鐜囧皢杩炵画25骞翠繚鎸佸勾鍧?.6%鑷?.1%
        // 鍙栦腑闂村€?.85%浣滀负鎯€у彂灞曟儏鏅殑纰虫帓鏀惧己搴﹀勾鍧囬€掑噺鐜?        carbonIntensityReductionRate = 0.0385 // 3.85%骞村潎閫掑噺鐜囷紙鍩轰簬鍥藉鑷富璐＄尞锛?        break
        
      case 'planning':
        // 瑙勫垝鎺у埗鎯呮櫙锛氭牴鎹?鍗佷笁浜?鎺у埗娓╁姘斾綋鎺掓斁鏂规
        // T鈧?= T鈧?1 - u), v鈧?= (T鈧?/ T鈧?^(1/5) - 1
        // 浠庡師濮嬫暟鎹幏鍙?015骞村拰2020骞寸⒊鎺掓斁寮哄害
        const T1 = get2015CarbonIntensity(provinceName) || baseCarbonIntensity
        const T2 = get2020CarbonIntensity(provinceName) || baseCarbonIntensity
        
        if (T1 && T2 && T1 > 0) {
          // 浣跨敤鐪熷疄鐨?020骞存暟鎹绠楀勾鍧囦笅闄嶇巼
          carbonIntensityReductionRate = Math.pow(T2 / T1, 1/5) - 1 // 骞村潎涓嬮檷鐜?        } else {
          // 濡傛灉鏁版嵁涓嶅畬鏁达紝浣跨敤鏀跨瓥榛樿鍊?          // 鏍规嵁"鍗佷笁浜?鎺у埗娓╁姘斾綋鎺掓斁鏂规锛屾瘡涓簲骞磋鍒掔⒊鎺掓斁寮哄害涓嬮檷18%
          carbonIntensityReductionRate = 0.039 // 3.9%骞村潎涓嬮檷鐜囷紙鍩轰簬"鍗佷笁浜?鏂规锛?        }
        break
        
      case 'peak':
        // 杈惧嘲绾︽潫鎯呮櫙锛氭牴鎹腑鍥?CO鈧傛帓鏀惧姏浜変簬2030骞磋揪鍒板嘲鍊?鐨勭洰鏍囪绠?        // 鏍规嵁鐩稿叧鐮旂┒锛氳嫢姣忎釜浜斿勾璁″垝纰虫帓鏀惧己搴︿笅闄?8%锛岀⒊杈惧嘲鏃剁粡娴庡閫熶笂闄愪负4.05%锛?        // 姝ゆ椂纰虫帓鏀惧己搴﹀勾绠楁湳骞冲潎涓嬮檷3.6%锛屽勾鍑犱綍骞冲潎涓嬮檷3.89%
        // 纰虫帓鏀惧己搴︿笅闄嶇巼绯绘暟涓庣粡娴庡閫熶笂闄愬瓨鍦ㄤ竴瀹氬叧鑱旓紝澶ц嚧鍦?.6%鑷?.89%宸﹀彸
        const gdpGrowthRate2030 = Math.log(predictedGDP / baseGDP) / yearDiff
        // 浣跨敤3.89%浣滀负杈惧嘲绾︽潫鎯呮櫙鐨勭⒊鎺掓斁寮哄害涓嬮檷鐜囩郴鏁?        carbonIntensityReductionRate = Math.min(gdpGrowthRate2030, 0.0389) // 鍙朑DP澧為暱鐜囧拰3.89%鐨勮緝灏忓€?        break
        
      case 'green':
        // 缁胯壊鍙戝睍鎯呮櫙锛氬湪鎯€у彂灞曟儏鏅殑鍩虹涓婏紝鏀剧紦GDP澧為暱閫熷害锛屽皢GDP鐨勫闀跨巼璋冧綆1涓櫨鍒嗙偣
        // 鏍规嵁銆?030骞村墠纰宠揪宄拌鍔ㄦ柟妗堛€嬶細鍒?030骞达紝鍗曚綅鍥藉唴鐢熶骇鎬诲€间簩姘у寲纰虫帓鏀炬瘮2005骞翠笅闄?5%浠ヤ笂
        // 鍩轰簬65%鐨勪笅闄嶇洰鏍囷紝璁＄畻寰楀埌纰虫帓鏀惧己搴﹀勾鍧囦笅闄嶇巼涓?.1%
        // 鍦ㄦ鍩虹涓婏紝浠?骞翠负鍛ㄦ湡灏嗕笅闄嶇巼璋冮珮0.5涓櫨鍒嗙偣
        const baseReductionRate = 0.041 // 鍩虹涓嬮檷鐜?.1%锛堝熀浜?030骞寸⒊杈惧嘲琛屽姩鏂规锛?        const cycle = Math.floor(yearDiff / 5)
        carbonIntensityReductionRate = baseReductionRate + cycle * 0.005 // 姣?骞磋皟楂?.5涓櫨鍒嗙偣
        
        // 缁胯壊鍙戝睍鎯呮櫙涓嬶紝GDP澧為暱鐜囪皟浣?涓櫨鍒嗙偣
        const greenGDPGrowthRate = gdpGrowthRate - 0.01
        const greenPredictedGDP = baseGDP * Math.pow(1 + greenGDPGrowthRate, yearDiff)
        const greenPredictedEmission = greenPredictedGDP * baseCarbonIntensity * Math.pow(1 - carbonIntensityReductionRate, yearDiff)
        return greenPredictedEmission / 10000 // 杞崲鍥炰竾鍚?    }
    
    // 棰勬祴纰虫帓鏀惧己搴?    const predictedCarbonIntensity = baseCarbonIntensity * Math.pow(1 - carbonIntensityReductionRate, yearDiff)
    
    // 浣跨敤鍏紡 C鈧?= GDP鈧?脳 T鈧?    const predictedEmission = predictedGDP * predictedCarbonIntensity
    
    return predictedEmission / 10000 // 杞崲鍥炰竾鍚?  }

  // 璁＄畻纰充腑鍜屽勾浠?- 褰撶⒊鎺掓斁閲忕瓑浜庣⒊鍚告敹閲忔椂
  const calculateCarbonNeutralYear = (provinceData: any, scenario: keyof typeof scenarioRates = 'inertial') => {
    const baseAbsorption = calculateCarbonAbsorptionFromExcel(provinceData)
    
    // 浠?019骞村紑濮嬮€愬勾妫€鏌ワ紝鎵惧埌纰虫帓鏀鹃噺棣栨灏忎簬绛変簬纰冲惛鏀堕噺鐨勫勾浠?    for (let year = 2019; year <= 2100; year++) {
      const emission = predictCarbonEmissionFromExcel(provinceData, year, scenario)
      if (emission <= baseAbsorption) {
        return year
      }
    }
    
    return 2100 // 濡傛灉2100骞翠粛鏈揪鍒扮⒊涓拰锛岃繑鍥?100
  }

  // 纰充腑鍜屽害璁＄畻 - 涓ユ牸鎸夌収鍏紡 N鈧傗個鈧嗏個 = (S鈧傗個鈧嗏個 / C鈧傗個鈧嗏個) 脳 100%
  const calculateCarbonNeutralityDegree = (absorption: number, emission: number) => {
    if (emission <= 0) return 100 // 濡傛灉鎺掓斁涓?鎴栬礋鏁帮紝纰充腑鍜屽害涓?00%
    return (absorption / emission) * 100
  }

  // 鐢熸垚棰勬祴鏁版嵁 - 浣跨敤Excel鏁版嵁锛屾敮鎸佸洓绉嶆儏鏅?  const generatePredictionData = () => {
    const currentYear = 2019 // 鏀逛负浣跨敤2019骞翠綔涓哄熀鍑?    const data = []
    
    // 鑾峰彇2019骞寸殑鏁版嵁浣滀负鍩哄噯
    const baseData2019 = excelData.filter(item => item['骞翠唤'] === 2019)
    
    // 鐢熸垚鍒?100骞寸殑鏁版嵁锛岀‘淇濇湁瓒冲鐨勬暟鎹緵鏃堕棿杞存帶鍒朵娇鐢?    const maxYears = Math.max(predictionYears, 81) // 鑷冲皯鐢熸垚鍒?100骞?(2019+81)
    
    for (let i = 0; i <= maxYears; i++) {
      const year = currentYear + i
      let totalEmissionInertial = 0
      let totalEmissionPlanning = 0
      let totalEmissionPeak = 0
      let totalEmissionGreen = 0
      let totalAbsorption = 0
      
      if (selectedProvince === "鍏ㄥ浗") {
        // 璁＄畻鍏ㄥ浗鏁版嵁
        baseData2019.forEach(provinceData => {
          totalEmissionInertial += predictCarbonEmissionFromExcel(provinceData, year, 'inertial')
          totalEmissionPlanning += predictCarbonEmissionFromExcel(provinceData, year, 'planning')
          totalEmissionPeak += predictCarbonEmissionFromExcel(provinceData, year, 'peak')
          totalEmissionGreen += predictCarbonEmissionFromExcel(provinceData, year, 'green')
          totalAbsorption += calculateCarbonAbsorptionFromExcel(provinceData)
        })
      } else {
        // 璁＄畻鐗瑰畾鐪佷唤鏁版嵁
        const provinceData = baseData2019.find(p => p['鐪佷唤'] === selectedProvince)
        if (provinceData) {
          totalEmissionInertial = predictCarbonEmissionFromExcel(provinceData, year, 'inertial')
          totalEmissionPlanning = predictCarbonEmissionFromExcel(provinceData, year, 'planning')
          totalEmissionPeak = predictCarbonEmissionFromExcel(provinceData, year, 'peak')
          totalEmissionGreen = predictCarbonEmissionFromExcel(provinceData, year, 'green')
          totalAbsorption = calculateCarbonAbsorptionFromExcel(provinceData)
        }
      }
      
      data.push({
        year,
        emissionInertial: Math.round(totalEmissionInertial),
        emissionPlanning: Math.round(totalEmissionPlanning),
        emissionPeak: Math.round(totalEmissionPeak),
        emissionGreen: Math.round(totalEmissionGreen),
        absorption: Math.round(totalAbsorption),
        netInertial: Math.round(totalEmissionInertial - totalAbsorption),
        netPlanning: Math.round(totalEmissionPlanning - totalAbsorption),
        netPeak: Math.round(totalEmissionPeak - totalAbsorption),
        netGreen: Math.round(totalEmissionGreen - totalAbsorption)
      })
    }
    
    return data
  }

  const predictionData = generatePredictionData()
  const carbonNeutralYear = predictionData.find(d => d.netInertial <= 0)?.year || null

  const steps = [
    { id: 1, title: "瀹為獙浠嬬粛", icon: Play },
    { id: 2, title: "鏁版嵁鎺㈢储", icon: BarChart3 },
    { id: 3, title: "纰虫帓鏀鹃娴?, icon: TrendingUp },
    { id: 4, title: "纰冲惛鏀堕娴?, icon: Leaf },
    { id: 5, title: "纰充腑鍜岄娴?, icon: TrendingUp },
    { id: 6, title: "鎶ュ憡鎾板啓", icon: FileText }
  ]

  // 鑾峰彇Excel鏁版嵁涓殑鐪佷唤鍒楄〃
  const getProvinceList = () => {
    const provinces = [...new Set(excelData.map(item => item['鐪佷唤']).filter(Boolean))]
    return provinces.sort()
  }

  // 鏁版嵁涓嬭浇鍔熻兘
  const downloadData = () => {
    const csvContent = [
      ["鐪佷唤", "纰虫帓鏀鹃噺(涓囧惃)", "甯镐綇浜哄彛(涓囦汉)", "鍩庨晣鍖栫巼(%)", "GDP(浜垮厓)", "鎬昏兘鑰?涓囧惃鏍囧噯鐓?", "鐓ょ偔娑堣€楅噺(涓囧惃)", "绗簩浜т笟澧炲姞鍊?浜垮厓)", "纰冲惛鏀堕噺(涓囧惃)"],
      ...provinceData.map(province => [
        province.name,
        province.carbonEmission,
        province.population,
        province.urbanizationRate,
        province.gdp,
        province.energyConsumption,
        province.coalConsumption,
        province.secondaryIndustryValue,
        calculateCarbonAbsorption(province).toFixed(1)
      ])
    ].map(row => row.join(",")).join("\n")
    
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", "carbon_data.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 鎶ュ憡涓嬭浇鍔熻兘
  const downloadReport = () => {
    const reportContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>纰充腑鍜岄娴嬪疄楠屾姤鍛?/title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        body { 
            font-family: "Microsoft YaHei", "SimSun", serif; 
            line-height: 1.6; 
            margin: 40px; 
            max-width: 800px; 
            margin: 40px auto;
        }
        h1 { 
            text-align: center; 
            color: #333; 
            border-bottom: 2px solid #333; 
            padding-bottom: 10px; 
            font-size: 24px;
        }
        h2 { 
            color: #444; 
            margin-top: 30px; 
            margin-bottom: 15px; 
            font-size: 18px;
        }
        p { 
            text-indent: 2em; 
            margin-bottom: 10px; 
            font-size: 14px;
        }
        .report-info { 
            text-align: right; 
            color: #666; 
            font-size: 12px; 
            margin-top: 30px; 
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        .highlight { 
            font-weight: bold; 
            color: #2c5aa0; 
        }
        .print-instructions {
            background: #f0f8ff;
            border: 1px solid #ccc;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 5px;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="print-instructions no-print">
        <strong>鎵撳嵃璇存槑锛?/strong>鎸?Ctrl+P (Windows) 鎴?Cmd+P (Mac) 鎵撳紑鎵撳嵃瀵硅瘽妗嗭紝閫夋嫨"鍙﹀瓨涓篜DF"鍗冲彲淇濆瓨涓篜DF鏂囦欢銆?    </div>
    
    <h1>纰充腑鍜岄娴嬪疄楠屾姤鍛?/h1>
    
    <h2>涓€銆佸疄楠屾杩?/h2>
    <p>${experimentOverview || `鏈疄楠屽熀浜嶴TIRPAT妯″瀷瀵?{selectedProvince}鐨勭⒊鎺掓斁杩涜棰勬祴锛岀粨鍚堝湡鍦板埄鐢ㄧ被鍨嬭绠楃⒊鍚告敹閲忥紝鍒嗘瀽纰充腑鍜屽疄鐜拌矾寰勩€俙}</p>
    
    <h2>浜屻€佺⒊鎺掓斁棰勬祴缁撴灉</h2>
    <p>${predictionResults || `鏍规嵁STIRPAT妯″瀷棰勬祴锛屽湪褰撳墠鍙戝睍瓒嬪娍涓嬶紝${selectedProvince}鐨勭⒊鎺掓斁閲忓皢鍦ㄦ湭鏉?{predictionYears}骞村唴鍛堢幇${carbonIntensityReduction > 3 ? "蹇€? : "缂撴參"}涓嬮檷瓒嬪娍銆傚勾鍧囬€掑噺鐜囪瀹氫负${carbonIntensityReduction}%銆俙}</p>
    
    <h2>涓夈€佺⒊鍚告敹閲忓垎鏋?/h2>
    <p>${absorptionAnalysis || `鍩轰簬鍦熷湴鍒╃敤绫诲瀷鍜岀⒊鍚告敹绯绘暟璁＄畻锛?{selectedProvince}褰撳墠纰冲惛鏀惰兘鍔涗负${predictionData[0]?.absorption.toLocaleString()}涓囧惃/骞淬€傚叾涓灄鍦拌础鐚渶澶э紝纰冲惛鏀剁郴鏁颁负3.8096 t路hm虏路a鈦宦广€俙}</p>
    
    <h2>鍥涖€佺⒊涓拰棰勬祴</h2>
    <p>${carbonNeutralPrediction || `缁煎悎纰虫帓鏀惧拰纰冲惛鏀堕娴嬬粨鏋滐紝${selectedProvince}棰勮鍦?{carbonNeutralYear || "2060骞村悗"}瀹炵幇纰充腑鍜岀洰鏍囥€傚綋鍓嶅噣鎺掓斁閲忎负${predictionData[0]?.netInertial.toLocaleString()}涓囧惃銆俙}</p>
    
    <h2>浜斻€佹斂绛栧缓璁?/h2>
    <p>${policyAdvice || "璇峰湪瀹為獙涓～鍐欐斂绛栧缓璁?}</p>
    
    <div class="report-info">
        鎶ュ憡鐢熸垚鏃堕棿锛?{new Date().toLocaleString()}
    </div>
</body>
</html>
    `.trim()
    
    const blob = new Blob([reportContent], { type: "text/html;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `纰充腑鍜岄娴嬫姤鍛奯${selectedProvince}_${new Date().toISOString().split('T')[0]}.html`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 涓嬭浇鐪佷唤鐩稿叧鏁版嵁Excel鏂囦欢
  const downloadProvinceData = () => {
    try {
      // 鐩存帴涓嬭浇public鐩綍涓殑鏂囦欢
      const link = document.createElement('a')
      link.href = '/纰充腑鍜岄娴嬪疄楠岀渷浠界浉鍏虫暟鎹?xlsx'
      link.download = '纰充腑鍜岄娴嬪疄楠岀渷浠界浉鍏虫暟鎹?xlsx'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('涓嬭浇澶辫触:', error)
      alert('涓嬭浇澶辫触锛岃绋嶅悗閲嶈瘯')
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 姝ラ瀵艰埅 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            纰充腑鍜岄娴嬪疄楠?          </CardTitle>
          <CardDescription>
            鍩轰簬鏈哄櫒瀛︿範鍜屽ぇ鏁版嵁鍒嗘瀽鐨勫叏鐞冪⒊涓拰璺緞棰勬祴涓庢儏鏅ā鎷?          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {steps.map((step) => (
              <Button
                key={step.id}
                variant={currentStep === step.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentStep(step.id)}
                className="flex items-center gap-2"
              >
                <step.icon className="h-4 w-4" />
                {step.title}
              </Button>
            ))}
          </div>
          <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
        </CardContent>
      </Card>

      {/* 姝ラ1: 瀹為獙浠嬬粛 */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-blue-600" />
              瀹為獙浠嬬粛
            </CardTitle>
            <CardDescription>浜嗚В纰充腑鍜岄娴嬪疄楠岀殑鑳屾櫙銆佺洰鏍囧拰鏂规硶</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 瀹為獙鑳屾櫙 */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                <h3 className="text-lg font-semibold mb-3 text-blue-800">
                  <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm">01</span>
                  <span className="ml-2">瀹為獙鑳屾櫙</span>
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  鍦ㄥ叏鐞冩皵鍊欏彉鍖栧拰纰冲噺鎺掔殑鍥介檯鑳屾櫙涓嬶紝寮€灞曞尯鍩熺⒊鏀舵敮鏍哥畻骞堕娴嬬⒊涓拰鏈潵婕斿彉鎬佸娍锛屼笉浠呮湁鍔╀簬缁煎悎璇勪及鍖哄煙纰冲钩琛＄姸鍐点€侀浼扮⒊涓拰瀹炵幇绋嬪害锛屼篃鏄帹鍔ㄧ粡娴庣ぞ浼氱豢鑹蹭綆纰宠浆鍨嬪彂灞曠殑杩垏闇€姹傘€備粠鐪佸煙灏哄害寮€灞曠⒊杈惧嘲纰充腑鍜岄娴嬨€佽瘎浼颁笉鍚岀渷浠?鍙岀⒊"鐩爣鐨勫疄鐜扮▼搴︼紝瀵逛簬鍖哄煙宸埆鍖栫⒊鍑忔帓銆佸姹囨斂绛栫殑璁捐銆佹帹鍔ㄥ尯鍩熷叕骞冲崗鍚屽噺鎺掋€佷績杩?鍙岀⒊"鐩爣鐨勫疄鐜板叿鏈夐噸瑕佹剰涔夈€?                </p>
              </div>
              
              {/* 瀹為獙鐩殑 */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-lg border-l-4 border-green-500">
                <h3 className="text-lg font-semibold mb-3 text-green-800">
                  <span className="bg-green-600 text-white px-2 py-1 rounded text-sm">02</span>
                  <span className="ml-2">瀹為獙鐩殑</span>
                </h3>
                <div className="bg-white p-4 rounded-lg border">
                  <p className="text-gray-700 leading-relaxed">
                    瀹為獙鐩殑鍦ㄤ簬浠庣悊璁轰笂杩涗竴姝ユ繁鍖栫渷鍩熷昂搴︾⒊杈惧嘲纰充腑鍜岃瘎浠峰拰鎯呮櫙棰勬祴鐮旂┒锛屾彮绀烘湭鏉ョ⒊杈惧嘲鍙婄⒊涓拰瀹炵幇绋嬪害鐨勭渷闄呭樊寮傦紝涓哄尯鍩熷樊鍒寲纰冲噺鎺掋€佸姹囨斂绛栫殑鍒跺畾鎻愪緵鍙傝€冨拰瀹炶返鎸囧銆?                  </p>
                </div>
              </div>
              
              {/* 瀹為獙鏂规硶 */}
              <div className="bg-gradient-to-r from-purple-50 to-violet-50 p-6 rounded-lg border-l-4 border-purple-500">
                <h3 className="text-lg font-semibold mb-3 text-purple-800">
                  <span className="bg-purple-600 text-white px-2 py-1 rounded text-sm">03</span>
                  <span className="ml-2">瀹為獙鏂规硶</span>
                </h3>
                <div className="space-y-3">
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">绗竴姝ワ細纰虫敹鏀牳绠?/span>
                    </div>
                    <p className="text-gray-700 text-sm">浠庣渷鍩熷昂搴﹀2005-2019骞翠笉鍚岀渷浠界殑纰虫敹鏀繘琛屾牳绠?/p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">绗簩姝ワ細褰卞搷鍥犵礌鍒嗘瀽</span>
                    </div>
                    <p className="text-gray-700 text-sm">鍩轰簬STIRPAT妯″瀷鍒嗘瀽鍚勫湴鍖虹⒊鎺掓斁鐨勫奖鍝嶅洜绱?/p>
                  </div>
                  <div className="bg-white p-4 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <span className="font-medium text-purple-700">绗笁姝ワ細鎯呮櫙棰勬祴</span>
                    </div>
                    <p className="text-gray-700 text-sm">鍩轰簬鎯€у彂灞曘€佽鍒掓帶鍒躲€佽揪宄扮害鏉熷拰缁胯壊鍙戝睍绛?绉嶄笉鍚屾儏鏅紝瀵?020-2060骞村害鍚勫湴鍖虹⒊杈惧嘲鍜岀⒊涓拰瀹炵幇绋嬪害杩涜棰勬祴</p>
                  </div>
                </div>
              </div>

              {/* 瀹為獙鐗硅壊 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-orange-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-orange-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Leaf className="h-6 w-6 text-orange-600" />
                    </div>
                    <h4 className="font-semibold text-orange-700 mb-2">纰充腑鍜岀洰鏍?/h4>
                    <p className="text-sm text-gray-600">棰勬祴2060骞寸⒊涓拰瀹炵幇璺緞</p>
                  </CardContent>
                </Card>
                <Card className="border-blue-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <TrendingUp className="h-6 w-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-blue-700 mb-2">澶氭儏鏅垎鏋?/h4>
                    <p className="text-sm text-gray-600">鍥涚涓嶅悓鍙戝睍鎯呮櫙瀵规瘮</p>
                  </CardContent>
                </Card>
                <Card className="border-green-200 hover:shadow-md transition-shadow">
                  <CardContent className="p-4 text-center">
                    <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                      <BarChart3 className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-700 mb-2">鐪佸煙灏哄害</h4>
                    <p className="text-sm text-gray-600">绮剧‘鍒扮渷绾х殑纰虫敹鏀牳绠?/p>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <div className="flex justify-end mt-8">
              <Button onClick={() => setCurrentStep(2)} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                寮€濮嬪疄楠?鈫?              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 姝ラ2: 鐩稿叧鏁版嵁 */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>鐩稿叧鏁版嵁鍙婁笅杞?/CardTitle>
            <CardDescription>鍩轰簬涓浗鍦板浘鐨勫悇鐪佺⒊鎺掓斁閲忓拰鐩稿叧鎸囨爣鍙鍖?/CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 涓浗鍚勭渷纰虫帓鏀惧垎甯冨浘 */}
              <div>
                <h3 className="text-lg font-semibold mb-4">涓浗鍚勭渷纰虫帓鏀惧垎甯冨浘</h3>
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex justify-center mb-4">
                    <img 
                      src="/涓浗鍚勭渷纰虫帓鏀惧垎甯冨浘.webp" 
                      alt="涓浗鍚勭渷纰虫帓鏀惧垎甯冨浘" 
                      className="max-w-full h-auto rounded-lg shadow-md"
                    />
                  </div>
                  <div className="text-sm text-gray-600 text-center">
                    <p className="mb-2">
                      娉細璇ュ浘鍩轰簬鍥藉娴嬬粯鍦扮悊淇℃伅灞€鏍囧噯鍦板浘鏈嶅姟缃戠珯涓嬭浇鐨勫鍥惧彿涓篏S(2020)4619鐨勬爣鍑嗗湴鍥惧埗浣滐紝搴曞浘鏃犱慨鏀广€?                    </p>
                    <p className="font-bold">
                      鍥?  2005銆?009骞翠腑鍥藉悇鐪佺⒊鏀舵敮閲?                    </p>
                  </div>
                </div>
              </div>

              {/* 鐪佷唤鐩稿叧鏁版嵁 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">鐪佷唤鐩稿叧鏁版嵁</h3>
                  <Button size="sm" variant="outline" onClick={downloadProvinceData}>
                    <Download className="h-4 w-4 mr-2" />
                    涓嬭浇瀹屾暣鏁版嵁
                  </Button>
                </div>
                
                {/* 鎯呮櫙璁剧疆琛ㄦ牸 */}
                <div className="mb-6">
                  <h4 className="text-md font-semibold mb-3">鎯呮櫙璁剧疆</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="border border-gray-300 px-4 py-2 text-left"></th>
                          <th className="border border-gray-300 px-4 py-2 text-center">鎯€у彂灞曟儏鏅?/th>
                          <th className="border border-gray-300 px-4 py-2 text-center">瑙勫垝鎺у埗鎯呮櫙</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">杈惧嘲绾︽潫鎯呮櫙</th>
                          <th className="border border-gray-300 px-4 py-2 text-center">缁胯壊鍙戝睍鎯呮櫙</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 px-4 py-2 font-medium">纰虫帓鏀惧己搴︿笅闄嶇巼 (%)</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.32%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.05%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">12.60%</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">4.11%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <h4 className="text-md font-semibold mb-3">鍚勭渷浠藉叧閿寚鏍囨暟鎹〃</h4>
                  <table className="w-full border-collapse border border-gray-300">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="border border-gray-300 px-4 py-2 text-center">鐪佷唤</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">纰虫帓鏀鹃噺(涓囧惃)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">甯镐綇浜哄彛(涓囦汉)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">鍩庨晣鍖栫巼(%)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">GDP(浜垮厓)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">鎬昏兘鑰?涓囧惃鏍囧噯鐓?</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">鐓ょ偔娑堣€楅噺(涓囧惃)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">绗簩浜т笟澧炲姞鍊?浜垮厓)</th>
                        <th className="border border-gray-300 px-4 py-2 text-center">纰冲惛鏀堕噺(涓囧惃)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {provinceData.map(province => (
                        <tr key={province.code} className="hover:bg-gray-50">
                          <td className="border border-gray-300 px-4 py-2 text-center font-medium">{province.name}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.carbonEmission.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.population.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.urbanizationRate}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.gdp.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.energyConsumption.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.coalConsumption.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{province.secondaryIndustryValue.toLocaleString()}</td>
                          <td className="border border-gray-300 px-4 py-2 text-center">{calculateCarbonAbsorption(province).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg mb-4 mt-6">
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>鏁版嵁璇存槑锛?/strong>"鍚勭渷浠藉叧閿寚鏍囨暟鎹〃"灞曠ず浜嗗悇鐪佷唤鐨勫叧閿寚鏍囨暟鎹紝瀹屾暣鏁版嵁璇蜂笅杞紼xcel鏂囦欢鏌ョ湅銆?/p>
                    <p><strong>鏁版嵁鏉ユ簮锛?/strong>鍥藉缁熻灞€銆佸悇鐪佺粺璁″勾閴淬€佺敓鎬佺幆澧冮儴绛夊畼鏂规暟鎹?/p>
                    <p><strong>鏇存柊鏃堕棿锛?/strong>2023骞?/p>
                  </div>
                </div>
              </div>

              {/* 鍦板浘鍙鍖?*/}
              <div>
                <h3 className="text-lg font-semibold mb-4">涓浗鍚勭渷纰虫帓鏀惧彲瑙嗗寲鍦板浘</h3>
                
                <div className="h-[500px] bg-gray-50 rounded-lg flex items-center justify-center">
                  <ChinaMap 
                    selectedProvince={selectedProvince === "鍏ㄥ浗" ? undefined : selectedProvince}
                    onProvinceSelect={(province) => setSelectedProvince(province)}
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                鈫?涓婁竴姝?              </Button>
              <Button onClick={() => setCurrentStep(3)}>
                涓嬩竴姝?鈫?              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 姝ラ3: 纰虫帓鏀鹃娴?*/}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>纰虫帓鏀鹃噺棰勬祴</CardTitle>
            <CardDescription>鍩轰簬STIRPAT妯″瀷鐨勭⒊鎺掓斁棰勬祴鍒嗘瀽</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* 妯″瀷浠嬬粛 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  灏嗗彉閲忓厛绾冲叆STIRPAT妯″瀷鍐嶇瓫閫夛紝鏋勫缓鎵╁睍鐨凷TIRPAT妯″瀷濡傝〃杈惧紡锛堝涓嬶級, 涓洪伩鍏嶅奖鍝嶅洜绱犱箣闂村瓨鍦ㄥ閲嶅叡绾挎€э紝鍦⊿PSS杞欢鐜涓嬭繘琛屽箔鍥炲綊鍒嗘瀽锛岃幏寰楀悇鐪佺⒊鎺掓斁鐨勪富鎺у洜绱犮€?                </p>
              </div>

              {/* 妯″瀷鍏紡 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">STIRPAT妯″瀷鍏紡</h3>
                <div className="font-mono text-sm bg-white p-3 rounded border">
                  ln I = ln a + b ln P + c ln U + d ln A + f (ln A)虏 + g ln T + h ln E鈧?+ j ln E鈧?+ k ln I鈧?                </div>
                <div className="mt-3 text-sm text-gray-600">
                  <p><strong>寮忎腑锛?/strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>I: CO鈧傛帓鏀鹃噺(鍗曚綅:t)</li>
                    <li>P: 甯镐綇浜哄彛(鍗曚綅:涓囦汉)</li>
                    <li>U: 鍩庨晣鍖栫巼(鍗曚綅:%)</li>
                    <li>A: 浜哄潎GDP(鍗曚綅:鍏?</li>
                    <li>T: 纰虫帓鏀惧己搴?鍗曚綅:t/涓囧厓)</li>
                    <li>E鈧? 鑳芥簮寮哄害(鍗曚綅:tce/涓囧厓)</li>
                    <li>E鈧? 鑳芥簮缁撴瀯(鍗曚綅:%锛岀叅鐐秷鑰楀崰姣?</li>
                    <li>I鈧? 浜т笟缁撴瀯(鍗曚綅:%锛岀浜屼骇涓氬鍔犲€煎崰GDP姣旈噸)</li>
                    <li>a: 妯″瀷绯绘暟</li>
                    <li>b, c, d, f, g, h, j, k, A: 鍚勫彉閲忕殑寮规€х郴鏁?/li>
                  </ul>
                </div>
              </div>

              {/* 鍏紡鍙婅绠楁楠?*/}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">鍏紡鍙婅绠楁楠?/h3>
                <p className="text-gray-700 mb-4">
                  鏈爺绌朵互2019骞翠负鍩烘湡 锛岄娴嬩笉鍚屾儏鏅笅2020-2060骞翠腑鍥藉悇鐪佺殑纰虫帓鏀鹃噺銆傝绠楁柟娉曞涓嬶細
                </p>
                
                <div className="font-mono text-sm bg-white p-3 rounded border mb-4">
                  C鈧?= GDP鈧?脳 T鈧?                </div>
                
                <div className="text-sm text-gray-600 mb-6">
                  <p><strong>寮忎腑锛?/strong></p>
                  <ul className="list-disc list-inside space-y-1 mt-2">
                    <li>C鈧? 棰勬祴骞寸殑纰虫帓鏀鹃噺锛堝崟浣嶏細t锛?/li>
                    <li>GDP鈧? 棰勬祴骞寸殑鍦板尯鐢熶骇鎬诲€硷紙鍗曚綅锛氫竾鍏冿級</li>
                    <li>T鈧? 棰勬祴骞寸殑纰虫帓鏀惧己搴︼紙鍗曚綅锛歵/涓囧厓锛?/li>
                    <li>t 鈭?[2020, 2060]</li>
                  </ul>
                </div>

                <p className="text-gray-700 mb-4">
                  鍚屾椂鏈爺绌惰缃儻鎬у彂灞曘€佽鍒掓帶鍒躲€佽揪宄扮害鏉熷拰缁胯壊鍙戝睍绛?绉嶄笉鍚屾儏鏅紝棰勬祴2020-2060骞村悇鐪佺⒊鎺掓斁閲忋€傚悇鎯呮櫙妯″紡璁惧畾濡備笅锛?                </p>

                <div className="space-y-4">
                  {/* 鎯€у彂灞曟儏鏅?*/}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-red-600 mb-2">(1) 鎯€у彂灞曟儏鏅?/h4>
                    <p className="text-sm text-gray-700 mb-2">
                      GDP浠?005-2019骞寸殑骞村潎鍙樺寲閲忓钩绋抽€掑锛岀⒊鎺掓斁寮哄害浠ヤ腑鍥藉浗瀹惰嚜涓昏础鐚腑鐨勬壙璇轰负渚濇嵁閫掑噺銆?                    </p>
                  </div>

                  {/* 瑙勫垝鎺у埗鎯呮櫙 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-blue-600 mb-2">(2) 瑙勫垝鎺у埗鎯呮櫙</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      鏍规嵁鍚勭渷甯?鍗佸洓浜?瑙勫垝涓璆DP骞村潎澧為暱鐜囬娴婫DP锛岀粨鍚?鍗佷笁浜?鎺у埗娓╁姘斾綋鎺掓斁鏂规涓悇鐪佸競纰虫帓鏀惧己搴︿笅闄嶆寚鏍囪绠楃⒊鎺掓斁寮哄害骞村潎涓嬮檷鐜囥€傝绠楁柟娉曞涓嬶細
                    </p>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      T鈧?= T鈧?1 - u)
                    </div>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      v鈧?= (T鈧?/ T鈧?^(1/5) - 1
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>寮忎腑锛?/strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>T鈧併€乀鈧? 鍒嗗埆涓?015銆?020骞磋鍒掓帶鍒舵儏鏅笅鐨勭⒊鎺掓斁寮哄害锛堝崟浣嶏細t/涓囧厓锛?/li>
                        <li>u: "鍗佷笁浜?鎺у埗娓╁姘斾綋鎺掓斁鏂规纰虫帓鏀惧己搴︿笅闄嶆寚鏍囷紙鍗曚綅锛?锛?/li>
                        <li>v鈧? 瑙勫垝鎺у埗鎯呮櫙涓嬬殑纰虫帓鏀惧己搴︿笅闄嶇巼锛堝崟浣嶏細锛咃級</li>
                      </ul>
                    </div>
                  </div>

                  {/* 杈惧嘲绾︽潫鎯呮櫙 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-green-600 mb-2">(3) 杈惧嘲绾︽潫鎯呮櫙</h4>
                    <p className="text-sm text-gray-700 mb-2">
                      GDP浠?005-2019骞寸殑骞村潎鍙樺寲閲忓钩绋抽€掑锛屾牴鎹腑鍥?CO鈧傛帓鏀惧姏浜変簬2030骞磋揪鍒板嘲鍊?鐨勭洰鏍囪绠楃⒊鎺掓斁寮哄害骞村潎涓嬮檷鐜囥€傝绠楁柟娉曞涓嬶細
                    </p>
                    <div className="font-mono text-sm bg-gray-50 p-3 rounded border mb-2">
                      v鈧?鈭?[ln(GDP鈧椻倞鈧?/ GDP鈧?, ln(GDP鈧樷倞鈧?/ GDP鈧?]
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>寮忎腑锛?/strong></p>
                      <ul className="list-disc list-inside space-y-1 mt-2">
                        <li>v鈧? 杈惧嘲绾︽潫鎯呮櫙涓嬬殑纰虫帓鏀惧己搴︿笅闄嶇巼锛堝崟浣嶏細%锛?/li>
                        <li>GDP: 鍦板尯鐢熶骇鎬诲€硷紙鍗曚綅锛氫竾鍏冿級</li>
                        <li>l 鈭?[2030, 2059], m 鈭?[2020, 2029]</li>
                        <li>涓轰繚璇佸悇鐪佸湪2030骞村墠瀹炵幇纰宠揪宄帮紝v鈧傚彇鏈€澶у€?/li>
                      </ul>
                    </div>
                  </div>

                  {/* 缁胯壊鍙戝睍鎯呮櫙 */}
                  <div className="bg-white p-4 rounded border">
                    <h4 className="font-semibold text-yellow-600 mb-2">(4) 缁胯壊鍙戝睍鎯呮櫙</h4>
                    <p className="text-sm text-gray-700">
                      鍦ㄦ儻鎬у彂灞曟儏鏅殑鍩虹涓婏紝鏀剧紦GDP澧為暱閫熷害锛屽皢GDP鐨勫闀跨巼璋冧綆1涓櫨鍒嗙偣銆傛牴鎹腑鍥藉浗瀹惰嚜涓昏础鐚腑"2030骞村崟浣嶅浗鍐呯敓浜ф€诲€糃O鈧傛帓鏀鹃噺姣?005骞翠笅闄?0%锝?5%"鐨勬壙璇鸿缃⒊鎺掓斁寮哄害涓嬮檷鐩爣涓?5%锛屽弬鐓ц鍒掓帶鍒舵儏鏅笅鐨勫叕寮忚绠楀緱鍒扮⒊鎺掓斁寮哄害骞村潎涓嬮檷鐜囦负4.11%锛屽湪姝ゅ熀纭€涓婏紝浠?骞翠负鍛ㄦ湡灏嗕笅闄嶇巼璋冮珮0.5涓櫨鍒嗙偣锛屼綔涓哄悇鐪佺⒊鎺掓斁寮哄害鐨勪笅闄嶇巼銆?                    </p>
                  </div>
                </div>
              </div>

              {/* 棰勬祴鍙傛暟璁剧疆 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label>棰勬祴骞撮檺: {predictionYears} 骞?/Label>
                  <Slider
                    value={[predictionYears]}
                    min={10}
                    max={50}
                    step={5}
                    onValueChange={([value]) => setPredictionYears(value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>纰虫帓鏀惧己搴﹀勾閫掑噺鐜? {carbonIntensityReduction}%</Label>
                  <Slider
                    value={[carbonIntensityReduction]}
                    min={1}
                    max={10}
                    step={0.5}
                    onValueChange={([value]) => setCarbonIntensityReduction(value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label>GDP骞村潎澧為暱鐜? {(calculateGDPGrowthRate(selectedProvince) * 100).toFixed(2)}%</Label>
                  <div className="text-sm text-gray-600 mt-2">
                    鍩轰簬{selectedProvince}2005-2019骞碐DP鏁版嵁璁＄畻
                  </div>
                </div>
              </div>

              {/* 鍘熷鏁版嵁鏄剧ず */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">鍘熷鏁版嵁淇℃伅</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {(() => {
                    const currentProvinceData = excelData.find(item => item['鐪佷唤'] === selectedProvince && item['骞翠唤'] === 2019)
                    const gdp2005 = excelData.find(item => item['鐪佷唤'] === selectedProvince && item['骞翠唤'] === 2005)?.['gdp'] || 0
                    const gdp2019 = currentProvinceData?.['gdp'] || 0
                    const carbonIntensity2015 = get2015CarbonIntensity(selectedProvince)
                    
                    return (
                      <>
                        <div>
                          <div className="font-semibold">2019骞碐DP</div>
                          <div className="text-blue-600">{gdp2019.toFixed(0)} 浜垮厓</div>
                        </div>
                        <div>
                          <div className="font-semibold">2005骞碐DP</div>
                          <div className="text-blue-600">{gdp2005.toFixed(0)} 浜垮厓</div>
                        </div>
                        <div>
                          <div className="font-semibold">2019骞寸⒊鎺掓斁寮哄害</div>
                          <div className="text-red-600">{currentProvinceData ? (currentProvinceData['co2Emission'] * 10000 / (currentProvinceData['gdp'] * 10000)).toFixed(4) : 0} t/涓囧厓</div>
                        </div>
                        <div>
                          <div className="font-semibold">2015骞寸⒊鎺掓斁寮哄害</div>
                          <div className="text-red-600">{carbonIntensity2015 ? carbonIntensity2015.toFixed(4) : '鏃犳暟鎹?} t/涓囧厓</div>
                        </div>
                      </>
                    )
                  })()}
                </div>
              </div>

              {/* 棰勬祴缁撴灉鍥捐〃 */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">纰虫帓鏀鹃娴嬬粨鏋?/h3>
                  <div className="flex gap-2">
                    <Select value={selectedProvince} onValueChange={setSelectedProvince}>
                      <SelectTrigger className="w-32">
