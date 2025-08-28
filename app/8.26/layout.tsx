'use client'

import { TaleProvider } from '@/lib/contexts/TaleContext'
import { SidebarProvider } from '@/components/ui/sidebar'

export default function Layout8_26({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <TaleProvider>
      <SidebarProvider defaultOpen={true}>
        {children}
      </SidebarProvider>
    </TaleProvider>
  )
}
