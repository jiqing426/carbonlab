"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"
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
      {/* 横线形式的步骤导航 */}
      <div className="bg-white rounded-lg border p-6 mb-8">
        <div className="grid grid-cols-5 gap-3 mb-4">
        {steps.map((step, index) => (
            <Button
              key={step.title}
              variant={currentStep === index ? "default" : "outline"}
              size="lg"
              onClick={() => onStepChange(index)}
              className="flex items-center justify-center gap-2 h-16 text-lg font-medium"
            >
              <div className="w-5 h-5 rounded-full border-2 flex items-center justify-center">
                {index < currentStep ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {step.title}
            </Button>
          ))}
        </div>
        <Progress value={(currentStep / steps.length) * 100} className="mt-4" />
      </div>
      
      {/* 导航按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={() => onStepChange(currentStep - 1)} disabled={currentStep === 0}>
          上一步
        </Button>
        <Button onClick={() => onStepChange(currentStep + 1)} disabled={currentStep === steps.length - 1}>
          {currentStep === steps.length - 1 ? "完成实验" : "下一步"}
        </Button>
      </div>
    </div>
  )
}

