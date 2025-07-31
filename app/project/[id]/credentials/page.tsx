"use client";
import { use } from "react";

import { AuthProvider } from "@/contexts/auth-context"
import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectCredentialsView } from "@/components/project-credentials-view"

interface ProjectCredentialsPageProps {
  params: Promise<{
    id: string
  }>
}

export default function ProjectCredentialsPage(props: ProjectCredentialsPageProps) {
  const params = use(props.params);
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
