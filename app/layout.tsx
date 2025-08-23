import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { ErrorProvider } from "@/contexts/error-context"
import Script from "next/script"

export const metadata = {
  title: "碳经济与管理AI实训平台",
  description: "面向双碳战略的仿真模拟教学系统",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <script
          defer
          src="https://umami.loongtales.com/script.js"
          data-website-id="33aca4b2-850f-40d6-85f6-72df997f7c7d"
        />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
      <body className="font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <ErrorProvider>
            {children}
          </ErrorProvider>
        </ThemeProvider>
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/mathjs/11.12.0/math.min.js" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js" />
        <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/0.162.0/three.min.js" />
        <Toaster />
      </body>
    </html>
  )
}
