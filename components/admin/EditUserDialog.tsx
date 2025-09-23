"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AppUser } from "@/types/tale"
import { Role } from "@/types/tale"

interface EditUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AppUser | null
  roles: Role[]
  onSave: (userId: string, roleIds: string[]) => void
}

export function EditUserDialog({ open, onOpenChange, user, roles, onSave }: EditUserDialogProps) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  useEffect(() => {
    if (user && roles.length > 0) {
      const userRoleIds = roles
        .filter(role => user.roles?.includes(role.role_name))
        .map(role => role.role_id)
      setSelectedRoleIds(userRoleIds)
    }
  }, [user, roles])

  const handleRoleChange = (roleId: string, checked: boolean) => {
    setSelectedRoleIds(prev => {
      if (checked) {
        return [...prev, roleId]
      } else {
        return prev.filter(id => id !== roleId)
      }
    })
  }

  const handleSave = () => {
    if (user) {
      onSave(user.user_id, selectedRoleIds)
    }
  }

  if (!user) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>编辑用户 - {user.username}</DialogTitle>
          <DialogDescription>
            修改用户信息和角色权限
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">用户ID</Label>
            <Input value={user.user_id} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">用户名</Label>
            <Input value={user.username} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">手机号</Label>
            <Input value={user.phone || ""} disabled className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">注册时间</Label>
            <Input
              value={new Date(user.registered_at).toLocaleString()}
              disabled
              className="col-span-3"
            />
          </div>
          <div className="space-y-2">
            <Label>角色管理</Label>
            <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.role_id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.role_id}`}
                    checked={selectedRoleIds.includes(role.role_id)}
                    onCheckedChange={(checked) => handleRoleChange(role.role_id, checked as boolean)}
                  />
                  <Label htmlFor={`role-${role.role_id}`} className="text-sm">
                    {role.role_name} ({role.role_type})
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            保存角色
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}