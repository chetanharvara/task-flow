"use client"

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectAssetsView } from "@/components/project-assets-view"

interface ProjectAssetsPageProps {
  params: {
    id: string
  }
}

export default function ProjectAssetsPage({ params }: ProjectAssetsPageProps) {
  return (
    <AuthProvider>
      <ProjectProvider>
        <TaskProvider>
          <DashboardLayout>
            <ProjectAssetsView projectId={params.id} />
          </DashboardLayout>
        </TaskProvider>
      </ProjectProvider>
    </AuthProvider>
  )
}
