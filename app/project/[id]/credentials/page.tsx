"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectCredentialsView } from "@/components/project-credentials-view"

interface ProjectCredentialsPageProps {
  params: {
    id: string
  }
}

export default function ProjectCredentialsPage({ params }: ProjectCredentialsPageProps) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <DashboardLayout>
            <ProjectCredentialsView projectId={params.id} />
          </DashboardLayout>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
