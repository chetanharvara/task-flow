"use client"

import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SettingsView } from "@/components/settings-view"

export default function SettingsPage() {
  return (
    <ProjectProvider>
      <TaskProvider>
        <DashboardLayout>
          <SettingsView />
        </DashboardLayout>
      </TaskProvider>
    </ProjectProvider>
  )
}
