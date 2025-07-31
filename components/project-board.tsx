"use client"

import { useState } from "react"
import { useProject } from "@/contexts/project-context"
import { useTask } from "@/contexts/task-context"
import { useAuth } from "@/contexts/auth-context"
import { TaskColumn } from "./task-column"
import { TaskDetailModal } from "./task-detail-modal"
import { CreateTaskModal } from "./create-task-modal"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Plus, Search, SortAsc } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  DndContext,
  type DragEndEvent,
  type DragOverEvent,
  DragOverlay,
  type DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from "@dnd-kit/core"
import { arrayMove } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"
import type { Task } from "@/contexts/task-context"

export function ProjectBoard() {
  const { getCurrentProject } = useProject()
  const { state, updateTask, reorderTasks } = useTask()
  const { state: authState } = useAuth()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [createTaskStatus, setCreateTaskStatus] = useState<string>("todo")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterPriority, setFilterPriority] = useState<string>("all")
  const [filterAssignee, setFilterAssignee] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("created")

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
  )

  const currentProject = getCurrentProject()
  const canCreateTasks = authState.user?.role !== "viewer"

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-full min-h-[300px] lg:min-h-[400px]">
        <div className="text-center space-y-4">
          <h2 className="text-lg lg:text-xl font-bold">No Project Selected</h2>
          <p className="text-sm lg:text-base text-muted-foreground">
            Select a project from the sidebar to get started.
          </p>
        </div>
      </div>
    )
  }

  // Filter and sort tasks
  let projectTasks = state.tasks.filter((task) => task.projectId === currentProject.id)

  // Apply search filter
  if (searchTerm) {
    projectTasks = projectTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Apply priority filter
  if (filterPriority !== "all") {
    projectTasks = projectTasks.filter((task) => task.priority === filterPriority)
  }

  // Apply assignee filter
  if (filterAssignee !== "all") {
    projectTasks = projectTasks.filter((task) => task.assigneeId === filterAssignee)
  }

  // Apply sorting
  projectTasks.sort((a, b) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      case "dueDate":
        if (!a.dueDate && !b.dueDate) return 0
        if (!a.dueDate) return 1
        if (!b.dueDate) return -1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      case "title":
        return a.title.localeCompare(b.title)
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }
  })

  const handleDragStart = (event: DragStartEvent) => {
    const task = state.tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTask = state.tasks.find((t) => t.id === activeId)
    if (!activeTask) return

    // Check if we're dropping over a column
    const overColumn = currentProject.columns.find((col) => col.id === overId)
    if (overColumn && activeTask.status !== overColumn.status) {
      updateTask(activeId, { status: overColumn.status as any })
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    setActiveTask(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    if (activeId === overId) return

    const activeTask = state.tasks.find((t) => t.id === activeId)
    const overTask = state.tasks.find((t) => t.id === overId)

    if (!activeTask) return

    // If dropping over a task, reorder within the same status
    if (overTask && activeTask.status === overTask.status) {
      const tasksInStatus = state.tasks.filter((t) => t.status === activeTask.status).sort((a, b) => a.order - b.order)

      const oldIndex = tasksInStatus.findIndex((t) => t.id === activeId)
      const newIndex = tasksInStatus.findIndex((t) => t.id === overId)

      const reorderedTasks = arrayMove(tasksInStatus, oldIndex, newIndex)

      // Update order for all tasks in this status
      const updatedTasks = state.tasks.map((task) => {
        if (task.status === activeTask.status) {
          const newOrder = reorderedTasks.findIndex((t) => t.id === task.id)
          return { ...task, order: newOrder }
        }
        return task
      })

      reorderTasks(updatedTasks)
    }
  }

  const handleCreateTask = (status: string) => {
    setCreateTaskStatus(status)
    setShowCreateTask(true)
  }

  const clearFilters = () => {
    setSearchTerm("")
    setFilterPriority("all")
    setFilterAssignee("all")
    setSortBy("created")
  }

  const activeFiltersCount = [searchTerm, filterPriority !== "all", filterAssignee !== "all"].filter(Boolean).length

  return (
    <div className="h-full space-y-4">
      {/* Board Controls */}
      <div className="flex flex-col lg:flex-row gap-3 lg:gap-4">
        <div className="flex-1 space-y-3 lg:space-y-0 lg:flex lg:items-center lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 lg:max-w-xs">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-sm"
            />
          </div>

          {/* Filters */}
          <div className="flex space-x-2 lg:space-x-3">
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[120px] text-sm">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterAssignee} onValueChange={setFilterAssignee}>
              <SelectTrigger className="w-[120px] text-sm">
                <SelectValue placeholder="Assignee" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {state.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[120px] text-sm">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="dueDate">Due Date</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {activeFiltersCount > 0 && (
            <Button variant="outline" size="sm" onClick={clearFilters}>
              Clear Filters
              <Badge variant="secondary" className="ml-2 text-xs">
                {activeFiltersCount}
              </Badge>
            </Button>
          )}

          {canCreateTasks && (
            <Button size="sm" onClick={() => handleCreateTask("todo")}>
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Task</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>
      </div>

      {/* Board */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="flex space-x-3 lg:space-x-6 h-full overflow-x-auto pb-6">
          {currentProject.columns.map((column) => {
            const columnTasks = projectTasks.filter((task) => task.status === column.status)
            return (
              <TaskColumn
                key={column.id}
                column={column}
                tasks={columnTasks}
                onTaskClick={setSelectedTask}
                onCreateTask={() => handleCreateTask(column.status)}
                canCreateTasks={canCreateTasks}
              />
            )
          })}
        </div>

        <DragOverlay>{activeTask ? <TaskCard task={activeTask} onClick={() => {}} isDragging /> : null}</DragOverlay>
      </DndContext>

      {/* Empty State */}
      {projectTasks.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">No tasks found</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                {searchTerm || filterPriority !== "all" || filterAssignee !== "all"
                  ? "Try adjusting your filters to see more tasks."
                  : "Get started by creating your first task for this project."}
              </p>
              {canCreateTasks && (
                <Button onClick={() => handleCreateTask("todo")}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Task
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modals */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}

      <CreateTaskModal
        open={showCreateTask}
        onOpenChange={setShowCreateTask}
        defaultStatus={createTaskStatus}
        projectId={currentProject.id}
      />
    </div>
  )
}
