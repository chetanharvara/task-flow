"use client"

import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { AuthProvider } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { TeamView } from "@/components/team-view"

export default function TeamPage() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <DashboardLayout>
            <TeamView />
          </DashboardLayout>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
