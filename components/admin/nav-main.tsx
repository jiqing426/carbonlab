"use client"

import { type LucideIcon } from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function NavMain({
  items,
}: {
  items: {
    title: string
    url: string
    icon?: LucideIcon
    isActive?: boolean
    items?: {
      title: string
      url: string
      icon?: LucideIcon
    }[]
  }[]
}) {
  const pathname = usePathname()
  const [isMounted, setIsMounted] = useState(false)
  const [isCollapsed] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.title} className="mb-4">
          {!isCollapsed && (
            <h3 className="px-3 text-sm font-medium text-muted-foreground mb-2">
              {item.title}
            </h3>
          )}
          <SidebarMenu>
            {item.items?.map((subItem) => (
              <SidebarMenuItem key={subItem.title}>
                {isCollapsed ? (
                  <TooltipProvider delayDuration={0}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <SidebarMenuButton
                          tooltip={subItem.title}
                          asChild
                          isActive={isMounted && pathname === subItem.url}
                        >
                          <Link
                            href={subItem.url}
                            className={cn(
                              'flex items-center py-2 my-1 transition-all duration-200 rounded-md',
                              'text-foreground hover:text-primary relative',
                              !isCollapsed &&
                                'hover:bg-primary/5 dark:hover:bg-primary/10',
                              'group border border-transparent',
                              'hover:border-primary/50 dark:hover:border-primary/50',
                              'hover:shadow-sm dark:hover:shadow-primary/10',
                              pathname === subItem.url && [
                                'text-primary bg-primary/5 dark:bg-primary/10',
                                'border-primary/50 dark:border-primary/50',
                                'shadow-sm dark:shadow-primary/10',
                              ]
                            )}
                            title={isCollapsed ? subItem.title : undefined}
                          >
                            <div className='flex items-center w-full'>
                              {subItem.icon && (
                                <subItem.icon
                                  className={cn(
                                    'h-5 w-5 transition-colors',
                                    !isCollapsed && 'mr-3',
                                    pathname === subItem.url
                                      ? 'text-primary'
                                      : 'text-muted-foreground group-hover:text-primary'
                                  )}
                                />
                              )}
                              {!isCollapsed && (
                                <span
                                  className={cn(
                                    'transition-colors',
                                    pathname === subItem.url && 'font-medium'
                                  )}
                                >
                                  {subItem.title}
                                </span>
                              )}
                            </div>
                          </Link>
                        </SidebarMenuButton>
                      </TooltipTrigger>
                      <TooltipContent
                        side='right'
                        className='flex items-center'
                      >
                        {subItem.title}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <SidebarMenuButton
                    tooltip={subItem.title}
                    isActive={isMounted && pathname === subItem.url}
                  >
                    <Link
                      href={subItem.url}
                      className={cn(
                        'flex items-center py-2 my-1 transition-all duration-200 rounded-md w-full',
                        'text-foreground hover:text-primary relative',
                        !isCollapsed &&
                          'hover:bg-primary/5 dark:hover:bg-primary/10',
                        'group',
                        pathname === subItem.url && [
                          'text-primary bg-primary/5 dark:bg-primary/10',
                        ]
                      )}
                      title={isCollapsed ? subItem.title : undefined}
                    >
                      <div className='flex items-center w-full'>
                        {subItem.icon && (
                          <subItem.icon
                            className={cn(
                              'h-5 w-5 transition-colors',
                              !isCollapsed && 'mr-3',
                              pathname === subItem.url
                                ? 'text-primary'
                                : 'text-muted-foreground group-hover:text-primary'
                            )}
                          />
                        )}
                        {!isCollapsed && (
                          <span
                            className={cn(
                              'transition-colors',
                              pathname === subItem.url && 'font-medium'
                            )}
                          >
                            {subItem.title}
                          </span>
                        )}
                      </div>
                    </Link>
                  </SidebarMenuButton>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      ))}
    </div>
  )
}