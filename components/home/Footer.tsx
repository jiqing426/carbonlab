"use client"

import Link from "next/link"
import Image from "next/image"
import { Phone, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 relative z-10">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* 主要介绍部分 */}
          <div className="lg:col-span-5">
            <h3 className="text-xl font-bold text-white mb-4">碳经济与管理AI实训平台</h3>
            <p className="text-sm leading-relaxed text-gray-400">
              实验教学系统面向碳管理、碳经济、碳交易及资源与环境经济学等双碳目标相关专业的高年级本科生及研究生。聚焦碳监测、碳核算、碳管理、碳市场、碳金融、碳规则前沿技术，无缝对接GRACED碳排放地图、全球环境卫星监测系统等权威数据库，通过集成人工智能算法、环境科学原理和自动化技术，系统提供碳监测实验、碳核算平台、碳交易仿真、碳中和沙盘等实操训练，旨在培养学生精准计算碳足迹、制定碳交易策略和规划碳中和方案等关键技能，为学生在碳管理领域的专业发展和创新实践提供坚实基础和广阔视野。
            </p>
          </div>

          {/* 资源链接 */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-white mb-4">资源链接</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  碳管理指南
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  常见问题
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  版本更新
                </Link>
              </li>
            </ul>
          </div>

          {/* 相关资源 */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-semibold text-white mb-4">相关资源</h4>
            <ul className="space-y-3">
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  碳排放标准
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  碳核算指南
                </Link>
              </li>
              <li>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                  行业案例
                </Link>
              </li>
            </ul>
          </div>

          {/* 联系我们和微信二维码 */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-semibold text-white mb-4">联系我们</h4>
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">热线电话</p>
                  <p className="text-white font-medium">400-000-0000</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">邮箱</p>
                  <p className="text-white font-medium">CarbonAI@computer.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-gray-400">地址</p>
                  <p className="text-white font-medium">
                    武汉市洪山区雄楚大道 武汉理工大学南湖校区 大学生创新创业园
                  </p>
                </div>
              </div>
            </div>

            {/* 微信二维码 */}
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-3">微信扫码关注</p>
              <div className="inline-block p-2 bg-white rounded-lg">
                <Image
                  src="/wechat.webp"
                  alt="微信二维码"
                  width={120}
                  height={120}
                  className="rounded"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 底部分割线和版权信息 */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">© {new Date().getFullYear()} 碳经济与管理AI实训平台. 保留所有权利.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                隐私政策
              </Link>
              <Link href="#" className="text-sm text-gray-500 hover:text-white transition-colors duration-200">
                服务条款
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
