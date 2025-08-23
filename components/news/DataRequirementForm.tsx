"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, FileText, Database, ChartBar, Globe } from "lucide-react";
import { toast } from "sonner";

interface DataRequirementFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  title: string;
  description: string;
  dataType: string;
  industry: string;
  contactEmail: string;
  contactPhone: string;
  additionalRequirements: string;
}

export function DataRequirementForm({ isOpen, onClose }: DataRequirementFormProps) {
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    dataType: "",
    industry: "",
    contactEmail: "",
    contactPhone: "",
    additionalRequirements: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 模拟API调用
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("数据需求提交成功！我们的团队将在24小时内与您联系。");
      onClose();
      
      // 重置表单
      setFormData({
        title: "",
        description: "",
        dataType: "",
        industry: "",
        contactEmail: "",
        contactPhone: "",
        additionalRequirements: ""
      });
    } catch (error) {
      toast.error("提交失败，请重试");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto relative z-[10000]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-xl">数据需求收集</CardTitle>
                <p className="text-sm text-gray-600">请详细描述您的数据需求，我们将为您提供专业的解决方案</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 基本信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  需求标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="请简要描述您的数据需求"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataType" className="text-sm font-medium">
                  数据类型 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={formData.dataType}
                  onValueChange={(value) => handleInputChange("dataType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择数据类型" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]">
                    <SelectItem value="market-data">市场数据</SelectItem>
                    <SelectItem value="policy-analysis">政策分析</SelectItem>
                    <SelectItem value="industry-report">行业报告</SelectItem>
                    <SelectItem value="carbon-emissions">碳排放数据</SelectItem>
                    <SelectItem value="trading-data">交易数据</SelectItem>
                    <SelectItem value="custom-analysis">定制分析</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* 详细描述 */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">
                详细描述 <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="请详细描述您的数据需求，包括具体指标、时间范围、地理范围等"
                rows={4}
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* 行业选择 */}
            <div className="space-y-2">
              <Label htmlFor="industry" className="text-sm font-medium">
                所属行业
              </Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="选择行业" />
                </SelectTrigger>
                <SelectContent className="z-[10001]">
                  <SelectItem value="power">电力行业</SelectItem>
                  <SelectItem value="steel">钢铁行业</SelectItem>
                  <SelectItem value="cement">水泥行业</SelectItem>
                  <SelectItem value="chemical">化工行业</SelectItem>
                  <SelectItem value="aviation">航空行业</SelectItem>
                  <SelectItem value="finance">金融行业</SelectItem>
                  <SelectItem value="other">其他行业</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 联系信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  联系邮箱 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@company.com"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone" className="text-sm font-medium">
                  联系电话
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="13800138000"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                />
              </div>
            </div>



            {/* 额外要求 */}
            <div className="space-y-2">
              <Label htmlFor="additionalRequirements" className="text-sm font-medium">
                额外要求
              </Label>
              <Textarea
                id="additionalRequirements"
                placeholder="如有其他特殊要求或说明，请在此处补充"
                rows={3}
                value={formData.additionalRequirements}
                onChange={(e) => handleInputChange("additionalRequirements", e.target.value)}
              />
            </div>

            {/* 提交按钮 */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isSubmitting}
              >
                取消
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    提交需求
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
