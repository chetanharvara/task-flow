"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { useTask } from "@/contexts/task-context"
import { useProject } from "@/contexts/project-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Calendar, MessageSquare, Paperclip, Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { format, isToday, isPast } from "date-fns"
import type { Task } from "@/contexts/task-context"

interface TaskCardProps {
  task: Task
  onClick: () => void
  isDragging?: boolean
}

export function TaskCard({ task, onClick, isDragging = false }: TaskCardProps) {
  const { getUserById } = useTask()
  const { state: projectState } = useProject()
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const assignee = task.assigneeId ? getUserById(task.assigneeId) : null
  const project = projectState.projects.find((p) => p.id === task.projectId)

  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "done"
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate))

  const completedSubtasks = task.subtasks.filter((subtask) => subtask.completed).length
  const subtaskProgress = task.subtasks.length > 0 ? (completedSubtasks / task.subtasks.length) * 100 : 0

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const statusColors = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "cursor-pointer transition-all hover:shadow-md group",
        (isDragging || isSortableDragging) && "opacity-50 rotate-2 shadow-lg scale-105",
        isOverdue && "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20",
        isDueToday && "border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20",
      )}
      onClick={onClick}
    >
      <CardContent className="p-3 lg:p-4">
        <div className="space-y-2 lg:space-y-3">
          {/* Task Header */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-medium text-sm leading-tight line-clamp-2 flex-1 group-hover:text-primary transition-colors">
              {task.title}
            </h4>
            <div className="flex items-center space-x-1 flex-shrink-0">
              <Badge variant="secondary" className={cn("text-xs", priorityColors[task.priority])}>
                {task.priority}
              </Badge>
              {isOverdue && <AlertTriangle className="h-3 w-3 text-red-500" />}
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{task.description}</p>
          )}

          {/* Subtask Progress */}
          {task.subtasks.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Subtasks: {completedSubtasks}/{task.subtasks.length}
                </span>
                <span className="text-muted-foreground">{Math.round(subtaskProgress)}%</span>
              </div>
              <Progress value={subtaskProgress} className="h-1" />
            </div>
          )}

          {/* Tags */}
          {task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {task.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{task.tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Task Footer */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center space-x-2">
              {assignee && (
                <div className="flex items-center space-x-1">
                  <Avatar className="h-5 w-5 lg:h-6 lg:w-6">
                    <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">
                      {assignee.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                </div>
              )}

              {task.dueDate && (
                <div
                  className={cn(
                    "flex items-center space-x-1 text-xs px-2 py-1 rounded-md",
                    isOverdue
                      ? "text-red-600 bg-red-100 dark:text-red-400 dark:bg-red-900/30"
                      : isDueToday
                        ? "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30"
                        : "text-muted-foreground bg-muted/50",
                  )}
                >
                  <Calendar className="h-3 w-3" />
                  <span className="hidden sm:inline">{format(new Date(task.dueDate), "MMM d")}</span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-1">
              {task.subtasks.length > 0 && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <MessageSquare className="h-3 w-3" />
                  <span>{task.subtasks.length}</span>
                </div>
              )}

              {Object.keys(task.customFields).length > 0 && <Paperclip className="h-3 w-3 text-muted-foreground" />}

              {task.estimatedHours && (
                <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>{task.estimatedHours}h</span>
                </div>
              )}
            </div>
          </div>

          {/* Project Context (if needed) */}
          {project && (
            <div className="flex items-center space-x-2 pt-1 border-t border-muted/50">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: project.color }} />
              <span className="text-xs text-muted-foreground truncate">{project.name}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
