import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { AdminRouteGuard } from "@/components/admin/admin-route-guard"
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
      <AdminRouteGuard>
        <SidebarProvider>
          <AdminSidebar />
          <SidebarInset>
            {children}
          </SidebarInset>
        </SidebarProvider>
      </AdminRouteGuard>
    </TaleProvider>
  )
} 