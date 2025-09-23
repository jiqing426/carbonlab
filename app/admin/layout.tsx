import { AdminSidebar } from "@/components/admin/admin-sidebar"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { TaleProvider } from "@/lib/contexts/TaleContext"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TaleProvider>
      <SidebarProvider>
        <AdminSidebar />
        <SidebarInset>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TaleProvider>
  )
} 