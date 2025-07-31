"use client"

import { useParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectTimelineView } from "@/components/project-timeline-view"
import { useEffect } from "react"

export default function ProjectTimelinePage() {
  const params = useParams()
  const projectId = params.id as string
  const { state: projectState, setCurrentProject } = useProject()
  const { state: authState } = useAuth()

  // Set current project when component mounts
  useEffect(() => {
    if (projectState.currentProjectId !== projectId) {
      setCurrentProject(projectId)
    }
  }, [projectId, projectState.currentProjectId, setCurrentProject])

  const project = projectState.projects.find((p) => p.id === projectId)

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full min-h-[400px]">
          <div className="text-center space-y-4">
            <h2 className="text-xl lg:text-2xl font-bold">Project Not Found</h2>
            <p className="text-muted-foreground">The project you're looking for doesn't exist.</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <ProjectTimelineView project={project} />
    </DashboardLayout>
  )
}
