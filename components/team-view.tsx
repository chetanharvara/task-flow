"use client"

import { useState } from "react"
import { useTask } from "@/contexts/task-context"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users, Mail, CheckCircle, Clock, AlertCircle, Shield } from "lucide-react"
import type { User } from "@/contexts/task-context"

export function TeamView() {
  const { state } = useTask()
  const { state: projectState } = useProject()
  const { state: authState, hasAdminAccess } = useAuth()
  const [selectedMember, setSelectedMember] = useState<User | null>(null)

  // Check if user has admin access
  if (!hasAdminAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to view the team page. Only administrators can access team management features.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  // Calculate stats for each user
  const getUserStats = (userId: string) => {
    const userTasks = state.tasks.filter((task) => task.assigneeId === userId)
    const completedTasks = userTasks.filter((task) => task.status === "done")
    const inProgressTasks = userTasks.filter((task) => task.status === "in-progress")
    const overdueTasks = userTasks.filter(
      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
    )

    return {
      total: userTasks.length,
      completed: completedTasks.length,
      inProgress: inProgressTasks.length,
      overdue: overdueTasks.length,
      completionRate: userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0,
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage team members and track their progress (Admin Only)</p>
        </div>
        <Button>
          <Users className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{state.users.length}</p>
                <p className="text-xs text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{state.tasks.filter((task) => task.status === "done").length}</p>
                <p className="text-xs text-muted-foreground">Completed Tasks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {state.tasks.filter((task) => task.status === "in-progress").length}
                </p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">
                  {
                    state.tasks.filter(
                      (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
                    ).length
                  }
                </p>
                <p className="text-xs text-muted-foreground">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle>Team Members</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {state.users.map((user) => {
              const stats = getUserStats(user.id)

              return (
                <Card key={user.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="space-y-4">
                      {/* User Info */}
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={user.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {user.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-medium">{user.name}</h3>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            <span>{user.email}</span>
                          </div>
                          <Badge variant="secondary" className="text-xs mt-1">
                            {user.role}
                          </Badge>
                        </div>
                      </div>

                      {/* Task Stats */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Task Completion</span>
                          <span>{Math.round(stats.completionRate)}%</span>
                        </div>
                        <Progress value={stats.completionRate} className="h-2" />
                      </div>

                      {/* Task Breakdown */}
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="text-center p-2 bg-muted/50 rounded">
                          <p className="font-medium">{stats.total}</p>
                          <p className="text-xs text-muted-foreground">Total</p>
                        </div>
                        <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                          <p className="font-medium text-green-700 dark:text-green-400">{stats.completed}</p>
                          <p className="text-xs text-green-600 dark:text-green-500">Done</p>
                        </div>
                        <div className="text-center p-2 bg-blue-100 dark:bg-blue-900/20 rounded">
                          <p className="font-medium text-blue-700 dark:text-blue-400">{stats.inProgress}</p>
                          <p className="text-xs text-blue-600 dark:text-blue-500">Active</p>
                        </div>
                        <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded">
                          <p className="font-medium text-red-700 dark:text-red-400">{stats.overdue}</p>
                          <p className="text-xs text-red-600 dark:text-red-500">Overdue</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {state.tasks
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 10)
              .map((task) => {
                const assignee = task.assigneeId ? state.users.find((u) => u.id === task.assigneeId) : null

                return (
                  <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    {assignee && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {assignee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{assignee?.name || "Someone"}</span> updated{" "}
                        <span className="font-medium">{task.title}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(task.updatedAt).toLocaleDateString()} at{" "}
                        {new Date(task.updatedAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.status.replace("-", " ")}
                    </Badge>
                  </div>
                )
              })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
