"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Send, MessageSquare, Star, Bug, Lightbulb, StarIcon } from "lucide-react";
import { toast } from "sonner";

interface FeedbackFormProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FeedbackData {
  title: string;
  type: string;
  description: string;
  rating: number;
  contactEmail: string;
  contactPhone: string;
  additionalInfo: string;
}

export function FeedbackForm({ isOpen, onClose }: FeedbackFormProps) {
  const [feedbackData, setFeedbackData] = useState<FeedbackData>({
    title: "",
    type: "",
    description: "",
    rating: 0,
    contactEmail: "",
    contactPhone: "",
    additionalInfo: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof FeedbackData, value: string) => {
    setFeedbackData(prev => ({
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
      
      toast.success("建议反馈提交成功！感谢您的宝贵意见，我们会认真考虑。");
      onClose();
      
      // 重置表单
      setFeedbackData({
        title: "",
        type: "",
        description: "",
        rating: 0,
        contactEmail: "",
        contactPhone: "",
        additionalInfo: ""
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
              <div className="p-2 bg-green-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <CardTitle className="text-xl">建议反馈收集</CardTitle>
                <p className="text-sm text-gray-600">您的建议是我们进步的动力，请详细描述您的想法</p>
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
                  反馈标题 <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="请简要描述您的建议或反馈"
                  value={feedbackData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type" className="text-sm font-medium">
                  反馈类型 <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={feedbackData.type}
                  onValueChange={(value) => handleInputChange("type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="选择反馈类型" />
                  </SelectTrigger>
                  <SelectContent className="z-[10001]">
                    <SelectItem value="feature-request">
                      <div className="flex items-center space-x-2">
                        <Lightbulb className="h-4 w-4" />
                        <span>功能建议</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="bug-report">
                      <div className="flex items-center space-x-2">
                        <Bug className="h-4 w-4" />
                        <span>问题反馈</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="content-improvement">
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4" />
                        <span>内容改进</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="user-experience">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>用户体验</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="other">
                      <span>其他</span>
                    </SelectItem>
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
                placeholder="请详细描述您的建议、遇到的问题或改进想法"
                rows={4}
                value={feedbackData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                required
              />
            </div>

            {/* 评分 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">
                总体评分
              </Label>
              <div className="flex items-center space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleInputChange("rating", star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <StarIcon
                      className={`h-8 w-8 ${
                        star <= feedbackData.rating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
                <span className="ml-3 text-sm text-gray-600">
                  {feedbackData.rating > 0 ? `${feedbackData.rating}星` : "请选择评分"}
                </span>
              </div>
            </div>



            {/* 联系信息 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="contactEmail" className="text-sm font-medium">
                  联系邮箱
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  placeholder="your.email@example.com"
                  value={feedbackData.contactEmail}
                  onChange={(e) => handleInputChange("contactEmail", e.target.value)}
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
                  value={feedbackData.contactPhone}
                  onChange={(e) => handleInputChange("contactPhone", e.target.value)}
                />
              </div>
            </div>

            {/* 额外信息 */}
            <div className="space-y-2">
              <Label htmlFor="additionalInfo" className="text-sm font-medium">
                额外信息
              </Label>
              <Textarea
                id="additionalInfo"
                placeholder="如有其他补充信息，请在此处说明"
                rows={3}
                value={feedbackData.additionalInfo}
                onChange={(e) => handleInputChange("additionalInfo", e.target.value)}
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
                className="bg-green-600 hover:bg-green-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    提交中...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    提交反馈
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
