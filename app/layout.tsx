import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/contexts/auth-context"
import { ProjectProvider } from "@/contexts/project-context"
import { TaskProvider } from "@/contexts/task-context"
import { TimelineProvider } from "@/contexts/timeline-context"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TaskFlow - Project Management",
  description: "A complete task management system inspired by Asana",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            <ProjectProvider>
              <TaskProvider>
                <TimelineProvider>{children}</TimelineProvider>
              </TaskProvider>
            </ProjectProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
