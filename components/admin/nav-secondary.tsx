"use client"

import { type LucideIcon } from "lucide-react"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavSecondary({
  items,
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
  }[]
}) {
  const pathname = usePathname()
  const [isCollapsed] = useState(false)

  return (
    <div className="px-3 mb-4">
      {!isCollapsed && (
        <h3 className="text-sm font-medium text-muted-foreground mb-2">
          快速访问
        </h3>
      )}
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            {isCollapsed ? (
              <TooltipProvider delayDuration={0}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <SidebarMenuButton asChild size="sm">
                      <a
                        href={item.url}
                        className={cn(
                          'flex items-center py-2 my-1 transition-all duration-200 rounded-md',
                          'text-foreground hover:text-primary relative',
                          !isCollapsed &&
                            'hover:bg-primary/5 dark:hover:bg-primary/10',
                          'group border border-transparent',
                          'hover:border-primary/50 dark:hover:border-primary/50',
                          'hover:shadow-sm dark:hover:shadow-primary/10',
                          pathname === item.url && [
                            'text-primary bg-primary/5 dark:bg-primary/10',
                            'border-primary/50 dark:border-primary/50',
                            'shadow-sm dark:shadow-primary/10',
                          ]
                        )}
                        title={isCollapsed ? item.title : undefined}
                      >
                        <div className='flex items-center w-full'>
                          <item.icon
                            className={cn(
                              'h-5 w-5 transition-colors',
                              !isCollapsed && 'mr-3',
                              pathname === item.url
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-primary'
                            )}
                          />
                          {!isCollapsed && (
                            <span
                              className={cn(
                                'transition-colors',
                                pathname === item.url && 'font-medium'
                              )}
                            >
                              {item.title}
                            </span>
                          )}
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </TooltipTrigger>
                  <TooltipContent
                    side='right'
                    className='flex items-center'
                  >
                    {item.title}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <SidebarMenuButton asChild size="sm">
                <a
                  href={item.url}
                  className={cn(
                    'flex items-center py-2 my-1 transition-all duration-200 rounded-md',
                    'text-foreground hover:text-primary relative',
                    !isCollapsed &&
                      'hover:bg-primary/5 dark:hover:bg-primary/10',
                    'group border border-transparent',
                    'hover:border-primary/50 dark:hover:border-primary/50',
                    'hover:shadow-sm dark:hover:shadow-primary/10',
                    pathname === item.url && [
                      'text-primary bg-primary/5 dark:bg-primary/10',
                      'border-primary/50 dark:border-primary/50',
                      'shadow-sm dark:shadow-primary/10',
                    ]
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className='flex items-center w-full'>
                    <item.icon
                      className={cn(
                        'h-5 w-5 transition-colors',
                        !isCollapsed && 'mr-3',
                        pathname === item.url
                          ? 'text-primary'
                          : 'text-muted-foreground group-hover:text-primary'
                      )}
                    />
                    {!isCollapsed && (
                      <span
                        className={cn(
                          'transition-colors',
                          pathname === item.url && 'font-medium'
                        )}
                      >
                        {item.title}
                      </span>
                    )}
                  </div>
                </a>
              </SidebarMenuButton>
            )}
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </div>
  )
}