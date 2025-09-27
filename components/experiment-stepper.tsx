"use client"

import * as React from "react"
import { Check, ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface StepProps {
  title: string
  description?: string
  isCompleted?: boolean
  isActive?: boolean
}

const Step: React.FC<StepProps> = ({ title, description, isCompleted, isActive }) => {
  return (
    <div className="flex items-center">
      <div className="relative flex items-center justify-center">
        <div
          className={cn(
            "w-8 h-8 rounded-full border-2 flex items-center justify-center",
            isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : isActive
                ? "border-primary"
                : "border-muted",
          )}
        >
          {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-sm font-medium">{title[0]}</span>}
        </div>
      </div>
      <div className="ml-4">
        <p className={cn("text-sm font-medium", isActive || isCompleted ? "text-foreground" : "text-muted-foreground")}>
          {title}
        </p>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>
    </div>
  )
}

interface StepperProps {
  steps: Array<{ title: string; description?: string }>
  currentStep: number
  onStepChange: (step: number) => void
}

export function Stepper({ steps, currentStep, onStepChange }: StepperProps) {
  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* 横线形式的步骤导航 - 紧凑样式，禁用点击 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-lg border-0 shadow-md p-4 mb-6">
        <div className="flex justify-center items-center gap-3 mb-4">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={cn(
                "flex flex-col items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-300 relative overflow-hidden rounded-lg min-w-0 flex-1 max-w-[140px]",
                currentStep === index 
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" 
                  : "bg-gray-50 text-gray-600"
              )}
            >
              <div className={cn(
                "w-7 h-7 rounded-full border flex items-center justify-center relative z-10 flex-shrink-0",
                currentStep === index 
                  ? "border-white bg-white/20" 
                  : "border-gray-300 bg-white"
              )}>
                {index < currentStep ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <span className={cn(
                    "text-sm font-bold",
                    currentStep === index ? "text-blue-600" : "text-gray-500"
                  )}>
                    {index + 1}
                  </span>
                )}
              </div>
              
              <div className="text-center min-w-0">
                <div className="font-medium text-sm truncate">{step.title}</div>
              </div>
            </div>
          ))}
        </div>
        
        {/* 进度条 */}
        <div className="relative">
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500 ease-out"
                 style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>步骤 {currentStep + 1} / {steps.length}</span>
            <span>{Math.round((currentStep / (steps.length - 1)) * 100)}% 完成</span>
          </div>
        </div>
      </div>
      
      {/* 导航按钮 - 优化后的样式 */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => onStepChange(currentStep - 1)} 
          disabled={currentStep === 0}
          className="px-6 py-3 border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          上一步
        </Button>
        
        <Button 
          onClick={() => onStepChange(currentStep + 1)} 
          disabled={currentStep === steps.length - 1}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50"
        >
          {currentStep === steps.length - 1 ? "完成实验" : "下一步"}
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

