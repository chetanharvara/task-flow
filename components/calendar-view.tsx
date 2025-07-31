"use client"

import { useState } from "react"
import { useTask } from "@/contexts/task-context"
import { useProject } from "@/contexts/project-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Grid3X3, List, ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, addMonths, subMonths } from "date-fns"
import { TaskDetailModal } from "@/components/task-detail-modal"
import type { Task } from "@/contexts/task-context"

export function CalendarView() {
  const { state } = useTask()
  const { state: projectState } = useProject()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid")
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Get tasks for a specific date
  const getTasksForDate = (date: Date) => {
    return state.tasks.filter((task) => {
      if (!task.dueDate) return false
      return isSameDay(new Date(task.dueDate), date)
    })
  }

  // Get all tasks with due dates for list view
  const getTasksWithDueDates = () => {
    return state.tasks
      .filter((task) => task.dueDate)
      .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
  }

  const getPriorityColor = (priority: Task["priority"]) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusColor = (status: Task["status"]) => {
    switch (status) {
      case "done":
        return "text-green-600"
      case "in-progress":
        return "text-blue-600"
      case "review":
        return "text-purple-600"
      default:
        return "text-gray-600"
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate) return false
    return new Date(task.dueDate) < new Date() && task.status !== "done"
  }

  const GridCalendarView = () => (
    <div className="grid grid-cols-7 gap-1">
      {/* Header */}
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
          {day}
        </div>
      ))}

      {/* Days */}
      {monthDays.map((day) => {
        const dayTasks = getTasksForDate(day)
        const isCurrentDay = isToday(day)

        return (
          <Card key={day.toISOString()} className={`min-h-[120px] ${isCurrentDay ? "ring-2 ring-primary" : ""}`}>
            <CardContent className="p-2">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm ${isCurrentDay ? "font-bold text-primary" : ""}`}>{format(day, "d")}</span>
                {dayTasks.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {dayTasks.length}
                  </Badge>
                )}
              </div>

              <div className="space-y-1">
                {dayTasks.slice(0, 3).map((task) => {
                  const project = projectState.projects.find((p) => p.id === task.projectId)
                  const assignee = task.assigneeId ? state.users.find((u) => u.id === task.assigneeId) : null

                  return (
                    <div
                      key={task.id}
                      className={`p-1 rounded text-xs cursor-pointer hover:opacity-80 ${
                        isOverdue(task) ? "bg-red-100 text-red-800" : "bg-muted"
                      }`}
                      onClick={() => setSelectedTask(task)}
                    >
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                        <span className="truncate flex-1">{task.title}</span>
                      </div>
                      {assignee && (
                        <div className="flex items-center mt-1">
                          <Avatar className="h-3 w-3">
                            <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[8px]">
                              {assignee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  )
                })}

                {dayTasks.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">+{dayTasks.length - 3} more</div>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )

  const ListCalendarView = () => {
    const tasksWithDueDates = getTasksWithDueDates()

    return (
      <div className="space-y-4">
        {tasksWithDueDates.map((task) => {
          const project = projectState.projects.find((p) => p.id === task.projectId)
          const assignee = task.assigneeId ? state.users.find((u) => u.id === task.assigneeId) : null
          const dueDate = new Date(task.dueDate!)
          const isDueToday = isToday(dueDate)
          const overdue = isOverdue(task)

          return (
            <Card
              key={task.id}
              className={`cursor-pointer hover:shadow-md transition-shadow ${
                overdue ? "border-red-200" : isDueToday ? "border-blue-200" : ""
              }`}
              onClick={() => setSelectedTask(task)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`} />
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant="outline" className={getStatusColor(task.status)}>
                        {task.status.replace("-", " ")}
                      </Badge>
                    </div>

                    {task.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span className={overdue ? "text-red-600" : isDueToday ? "text-blue-600" : ""}>
                          {format(dueDate, "MMM d, yyyy")}
                          {overdue && " (Overdue)"}
                          {isDueToday && " (Today)"}
                        </span>
                      </div>

                      {project && (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
                          <span>{project.name}</span>
                        </div>
                      )}

                      {assignee && (
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-4 w-4">
                            <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                            <AvatarFallback className="text-[10px]">
                              {assignee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span>{assignee.name}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Badge variant="secondary" className="text-xs">
                    {task.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          )
        })}

        {tasksWithDueDates.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No scheduled tasks</h3>
              <p className="text-muted-foreground">Tasks with due dates will appear here</p>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="text-muted-foreground">View and manage your scheduled tasks</p>
        </div>

        <div className="flex items-center space-x-2">
          {/* View Toggle */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={displayMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={displayMode === "list" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setDisplayMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Month Navigation - Only show in grid view */}
          {displayMode === "grid" && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(subMonths(currentDate, 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-lg font-medium min-w-[140px] text-center">{format(currentDate, "MMMM yyyy")}</span>
              <Button variant="outline" size="sm" onClick={() => setCurrentDate(addMonths(currentDate, 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {displayMode === "grid" ? <GridCalendarView /> : <ListCalendarView />}

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
    </div>
  )
}
