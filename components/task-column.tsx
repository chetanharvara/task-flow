"use client"

import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { Task } from "@/contexts/task-context"
import type { ProjectColumn } from "@/contexts/project-context"

interface TaskColumnProps {
  column: ProjectColumn
  tasks: Task[]
  onTaskClick: (task: Task) => void
  onCreateTask: () => void
  canCreateTasks: boolean
}

export function TaskColumn({ column, tasks, onTaskClick, onCreateTask, canCreateTasks }: TaskColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  })

  const sortedTasks = tasks.sort((a, b) => a.order - b.order)

  // Calculate task statistics
  const urgentTasks = tasks.filter((task) => task.priority === "urgent").length
  const overdueTasks = tasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
  ).length

  return (
    <div className="flex flex-col w-72 lg:w-80 bg-muted/30 rounded-lg p-3 lg:p-4 flex-shrink-0">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-3 lg:mb-4">
        <div className="flex items-center space-x-2 flex-1 min-w-0">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
          <h3 className="font-medium text-sm lg:text-base truncate">{column.title}</h3>
          <Badge variant="secondary" className="text-xs flex-shrink-0">
            {tasks.length}
          </Badge>
        </div>

        <div className="flex items-center space-x-1">
          {canCreateTasks && (
            <Button variant="ghost" size="icon" onClick={onCreateTask} className="h-6 w-6 flex-shrink-0">
              <Plus className="h-3 w-3" />
            </Button>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0">
                <MoreHorizontal className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Sort by Priority</DropdownMenuItem>
              <DropdownMenuItem>Sort by Due Date</DropdownMenuItem>
              <DropdownMenuItem>Clear Column</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Column Stats */}
      {(urgentTasks > 0 || overdueTasks > 0) && (
        <div className="flex space-x-2 mb-3">
          {urgentTasks > 0 && (
            <Badge variant="destructive" className="text-xs">
              {urgentTasks} urgent
            </Badge>
          )}
          {overdueTasks > 0 && (
            <Badge variant="outline" className="text-xs border-red-200 text-red-600">
              {overdueTasks} overdue
            </Badge>
          )}
        </div>
      )}

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className={cn(
          "flex-1 space-y-2 lg:space-y-3 min-h-[200px] transition-colors rounded-md",
          isOver && "bg-muted/50 ring-2 ring-primary/20",
        )}
      >
        <SortableContext items={sortedTasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {sortedTasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
            </div>
            <p className="text-xs text-muted-foreground">No tasks in {column.title.toLowerCase()}</p>
            {canCreateTasks && (
              <Button variant="ghost" size="sm" onClick={onCreateTask} className="mt-2 text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add task
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Column Footer */}
      {tasks.length > 0 && canCreateTasks && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateTask}
          className="mt-3 w-full justify-start text-xs text-muted-foreground hover:text-foreground"
        >
          <Plus className="h-3 w-3 mr-2" />
          Add task
        </Button>
      )}
    </div>
  )
}
