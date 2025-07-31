"use client"

import { useState, useEffect } from "react"
import { useTask } from "@/contexts/task-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { TaskDetailModal } from "@/components/task-detail-modal"
import { Search, Calendar, User, Plus } from "lucide-react"
import { format } from "date-fns"
import type { Task } from "@/contexts/task-context"
import { CreateTaskModal } from "@/components/create-task-modal"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"

export function MyTasksView() {
  const { state, getUserById } = useTask()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [showCreateTask, setShowCreateTask] = useState(false)

  const { getCurrentProject, state: projectState } = useProject()
  const currentProject = getCurrentProject()

  // Filter tasks for current user (assuming user-1 is current user)
  const currentUserId = "user-1"
  const myTasks = state.tasks.filter((task) => task.assigneeId === currentUserId)

  // Apply filters
  const filteredTasks = myTasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || task.status === statusFilter
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter

    return matchesSearch && matchesStatus && matchesPriority
  })

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  const statusColors = {
    todo: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
    "in-progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    review: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    done: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  }

  useEffect(() => {
    // This will trigger a re-render when tasks change
  }, [state.tasks])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground">
            {filteredTasks.length} of {myTasks.length} tasks
          </p>
        </div>
        <Button onClick={() => setShowCreateTask(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="todo">To Do</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="review">Review</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No tasks found matching your criteria.</p>
            </CardContent>
          </Card>
        ) : (
          filteredTasks.map((task) => {
            const assignee = task.assigneeId ? getUserById(task.assigneeId) : null
            const isOverdue = task.dueDate && new Date(task.dueDate) < new Date()
            const taskProject = projectState.projects.find((p) => p.id === task.projectId)

            return (
              <Card
                key={task.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedTask(task)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-medium">{task.title}</h3>
                        <Badge className={priorityColors[task.priority]}>{task.priority}</Badge>
                        <Badge variant="outline" className={statusColors[task.status]}>
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>

                      {task.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
                      )}

                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        {taskProject && (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: taskProject.color }} />
                            <span>{taskProject.name}</span>
                          </div>
                        )}

                        {assignee && (
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>{assignee.name}</span>
                          </div>
                        )}

                        {task.dueDate && (
                          <div
                            className={`flex items-center space-x-1 ${
                              isOverdue ? "text-red-600 dark:text-red-400" : ""
                            }`}
                          >
                            <Calendar className="h-4 w-4" />
                            <span>{format(new Date(task.dueDate), "MMM d, yyyy")}</span>
                          </div>
                        )}
                      </div>

                      {task.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          open={!!selectedTask}
          onOpenChange={(open) => !open && setSelectedTask(null)}
        />
      )}
      {currentProject && (
        <CreateTaskModal
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          defaultStatus="todo"
          projectId={currentProject.id}
        />
      )}
    </div>
  )
}
