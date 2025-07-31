"use client"

import { useParams } from "next/navigation"
import { useProject } from "@/contexts/project-context"
import { useTask } from "@/contexts/task-context"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"
import { ProjectBoard } from "@/components/project-board"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { CalendarDays, Users, CheckCircle, Clock, AlertCircle, Settings, MoreHorizontal } from "lucide-react"
import { format } from "date-fns"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useEffect } from "react"

export default function ProjectPage() {
  const params = useParams()
  const projectId = params.id as string
  const { state: projectState, setCurrentProject } = useProject()
  const { state: taskState } = useTask()
  const { state: authState } = useAuth()

  // Set current project when component mounts
  useEffect(() => {
    if (projectState.currentProjectId !== projectId) {
      setCurrentProject(projectId)
    }
  }, [projectId, projectState.currentProjectId, setCurrentProject])

  const project = projectState.projects.find((p) => p.id === projectId)
  const projectTasks = taskState.tasks.filter((task) => task.projectId === projectId)

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

  const completedTasks = projectTasks.filter((task) => task.status === "done").length
  const totalTasks = projectTasks.length
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const overdueTasks = projectTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
  ).length

  const todayTasks = projectTasks.filter(
    (task) => task.dueDate && format(new Date(task.dueDate), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd"),
  ).length

  const teamMembers = taskState.users.filter((user) => projectTasks.some((task) => task.assigneeId === user.id))

  const canManageProject = authState.user?.role === "admin" || authState.user?.role === "member"

  return (
    <DashboardLayout>
      <div className="space-y-4 lg:space-y-6">
        {/* Project Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">{project.name}</h1>
              <Badge variant="outline" className="flex-shrink-0 text-xs">
                {project.status}
              </Badge>
              {canManageProject && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Project Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      Manage Members
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
            {project.description && (
              <p className="text-sm lg:text-base text-muted-foreground max-w-2xl">{project.description}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 lg:gap-3">
            {canManageProject && (
              <Button variant="outline" size="sm" className="w-full sm:w-auto bg-transparent">
                <Users className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Invite Members</span>
                <span className="sm:hidden">Invite</span>
              </Button>
            )}
            <Button size="sm" className="w-full sm:w-auto">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">View Timeline</span>
              <span className="sm:hidden">Timeline</span>
            </Button>
          </div>
        </div>

        {/* Project Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Total Tasks</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{totalTasks}</div>
              <p className="text-xs text-muted-foreground">{completedTasks} completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Progress</CardTitle>
              <div className="h-4 w-4 rounded-full bg-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{Math.round(progress)}%</div>
              <Progress value={progress} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Due Today</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold">{todayTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks due today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs lg:text-sm font-medium">Overdue</CardTitle>
              <AlertCircle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-xl lg:text-2xl font-bold text-destructive">{overdueTasks}</div>
              <p className="text-xs text-muted-foreground">Tasks overdue</p>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        {teamMembers.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-base lg:text-lg">
                <Users className="h-4 w-4 lg:h-5 lg:w-5" />
                <span>Team Members ({teamMembers.length})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 lg:gap-3">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center space-x-2 bg-muted/50 rounded-lg p-2">
                    <Avatar className="h-6 w-6 lg:h-8 lg:w-8">
                      <AvatarImage src={member.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {member.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="text-xs lg:text-sm font-medium">{member.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{member.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Board */}
        <Card className="min-h-[500px] lg:min-h-[600px]">
          <CardHeader className="pb-3 lg:pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base lg:text-lg">Project Board</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {project.columns.length} columns
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {totalTasks} tasks
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-3 lg:p-6">
              <ProjectBoard />
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
