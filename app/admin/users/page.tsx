"use client"

import { UsersTable } from "@/components/admin/UsersTable"

export default function UsersPage() {
  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">用户管理</h2>
          <p className="text-muted-foreground">
            管理平台用户账户和权限
          </p>
        </div>
      </div>
      <UsersTable onCreateUser={() => {}} />
    </div>
  )
}
