"use client";
import { use } from "react";

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectAssetsView } from "@/components/project-assets-view"

interface ProjectAssetsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectAssetsPage(props: ProjectAssetsPageProps) {
  const params = use(props.params);
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
