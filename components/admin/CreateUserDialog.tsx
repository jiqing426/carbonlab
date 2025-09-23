"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { CreateUserRequest } from "@/types/tale"
import { Role } from "@/types/tale"

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (userData: CreateUserRequest & { role_ids: string[] }) => void
  roles: Role[]
}

export function CreateUserDialog({ open, onOpenChange, onSubmit, roles }: CreateUserDialogProps) {
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: "",
    phone: "",
    password_encrypted: "",
  })
  const [selectedRoleId, setSelectedRoleId] = useState<string>("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.username.trim()) {
      alert("用户名不能为空")
      return
    }

    if (!formData.password_encrypted) {
      alert("密码不能为空")
      return
    }

    onSubmit({
      ...formData,
      role_ids: selectedRoleId ? [selectedRoleId] : []
    })
  }

  const handleInputChange = (field: keyof CreateUserRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>创建新用户</DialogTitle>
          <DialogDescription>
            创建新用户账户并分配初始权限
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right text-red-600">
              用户名 *
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) => handleInputChange("username", e.target.value)}
              className="col-span-3"
              placeholder="请输入用户名"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="phone" className="text-right">
              手机号
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              className="col-span-3"
              placeholder="请输入手机号"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="nickname" className="text-right">
              昵称
            </Label>
            <Input
              id="nickname"
              value={formData.nickname || ""}
              onChange={(e) => handleInputChange("nickname", e.target.value)}
              className="col-span-3"
              placeholder="请输入昵称"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="email" className="text-right">
              邮箱
            </Label>
            <Input
              id="email"
              value={formData.email || ""}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className="col-span-3"
              placeholder="请输入邮箱"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password" className="text-right text-red-600">
              密码 *
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password_encrypted}
              onChange={(e) => handleInputChange("password_encrypted", e.target.value)}
              className="col-span-3"
              placeholder="请输入密码"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right">
              角色
            </Label>
            <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="选择角色" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((role) => (
                  <SelectItem key={role.role_id} value={role.role_id}>
                    {role.role_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit">创建用户</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}