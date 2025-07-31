"use client"

import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectBoard } from "@/components/project-board"

export default function DashboardPage() {
  return (
    <ProjectProvider>
      <TaskProvider>
        <DashboardLayout>
          <ProjectBoard />
        </DashboardLayout>
      </TaskProvider>
    </ProjectProvider>
  )
}
