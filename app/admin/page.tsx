"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { AdminView } from "@/components/admin-view"

export default function AdminPage() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <DashboardLayout>
            <AdminView />
          </DashboardLayout>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
