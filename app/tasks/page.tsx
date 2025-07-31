"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { MyTasksView } from "@/components/my-tasks-view"

export default function TasksPage() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <DashboardLayout>
            <MyTasksView />
          </DashboardLayout>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
