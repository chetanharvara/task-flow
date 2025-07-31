"use client"

import { TaskProvider } from "@/contexts/task-context"
import { ProjectProvider } from "@/contexts/project-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { CalendarView } from "@/components/calendar-view"

export default function CalendarPage() {
  return (
    <ProjectProvider>
      <TaskProvider>
        <DashboardLayout>
          <CalendarView />
        </DashboardLayout>
      </TaskProvider>
    </ProjectProvider>
  )
}
