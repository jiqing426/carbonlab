'use client'

import { useState, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Upload, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface AvatarUploadProps {
  currentAvatar?: string | null
  onAvatarChange: (avatarUrl: string) => void
  onCancel?: () => void
}

export function AvatarUpload({ currentAvatar, onAvatarChange, onCancel }: AvatarUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [showCropper, setShowCropper] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast.error('请选择图片文件')
      return
    }

    // 验证文件大小 (最大 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('图片大小不能超过 5MB')
      return
    }

    setSelectedFile(file)
    
    // 创建预览URL
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return

    setIsUploading(true)
    try {
      // 创建FormData并上传文件
      const formData = new FormData()
      formData.append('avatar', selectedFile)

      const response = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData
      })

      if (response.ok) {
        const data = await response.json()
        if (data.code === 200) {
          onAvatarChange(data.data.avatarUrl)
          toast.success('头像更新成功！')
          
          // 重置状态
          setSelectedFile(null)
          setPreviewUrl(null)
          setShowCropper(false)
        } else {
          toast.error(data.message || '头像上传失败')
        }
      } else {
        toast.error('头像上传失败，请重试')
      }
    } catch (error) {
      console.error('头像上传错误:', error)
      toast.error('头像上传失败，请重试')
    } finally {
      setIsUploading(false)
    }
  }, [selectedFile, onAvatarChange])

  const handleCancel = useCallback(() => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setShowCropper(false)
    onCancel?.()
  }, [onCancel])

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      const input = fileInputRef.current
      if (input) {
        input.files = event.dataTransfer.files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }, [])

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          更新头像
        </CardTitle>
        <CardDescription>
          支持 JPG、PNG 格式，文件大小不超过 5MB
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 当前头像显示 */}
        {currentAvatar && (
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">当前头像</p>
            <div className="w-24 h-24 mx-auto rounded-full overflow-hidden border-2 border-gray-200">
              <img 
                src={currentAvatar} 
                alt="当前头像" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        {/* 文件上传区域 */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            previewUrl 
              ? 'border-green-300 bg-green-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {!previewUrl ? (
            <div className="space-y-3">
              <Upload className="h-8 w-8 mx-auto text-gray-400" />
              <div>
                <p className="text-sm text-gray-600">
                  拖拽图片到此处，或
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium ml-1"
                  >
                    点击选择
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  支持 JPG、PNG 格式，最大 5MB
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-white shadow-lg">
                <img 
                  src={previewUrl} 
                  alt="预览" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-green-600 font-medium">
                图片预览
              </p>
            </div>
          )}
        </div>

        {/* 隐藏的文件输入 */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        {/* 操作按钮 */}
        {previewUrl && (
          <div className="flex gap-3">
            <Button
              onClick={handleUpload}
              disabled={isUploading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  上传中...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  确认上传
                </>
              )}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              取消
            </Button>
          </div>
        )}

        {/* 提示信息 */}
        <div className="text-xs text-gray-500 text-center">
          <p>• 建议使用正方形图片，尺寸不小于 200x200 像素</p>
          <p>• 支持 JPG、PNG 格式，文件大小不超过 5MB</p>
          <p>• 上传后头像将立即更新</p>
        </div>
      </CardContent>
    </Card>
  )
}
