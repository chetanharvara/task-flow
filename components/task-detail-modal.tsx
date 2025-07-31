"use client"

import { useState } from "react"
import { useTask } from "@/contexts/task-context"
import { useProject } from "@/contexts/project-context"
import { useAuth } from "@/contexts/auth-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CalendarIcon,
  User,
  Flag,
  Tag,
  Clock,
  Trash2,
  Save,
  Plus,
  MessageSquare,
  Paperclip,
  AlertTriangle,
} from "lucide-react"
import { format, isToday, isPast } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/contexts/task-context"

interface TaskDetailModalProps {
  task: Task
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function TaskDetailModal({ task, open, onOpenChange }: TaskDetailModalProps) {
  const { updateTask, deleteTask, getUserById, state } = useTask()
  const { state: projectState } = useProject()
  const { state: authState } = useAuth()
  const [editedTask, setEditedTask] = useState<Task>(task)
  const [isEditing, setIsEditing] = useState(false)
  const [newSubtask, setNewSubtask] = useState("")

  const assignee = editedTask.assigneeId ? getUserById(editedTask.assigneeId) : null
  const project = projectState.projects.find((p) => p.id === editedTask.projectId)
  const canEdit = authState.user?.role !== "viewer"

  const isOverdue = editedTask.dueDate && isPast(new Date(editedTask.dueDate)) && editedTask.status !== "done"
  const isDueToday = editedTask.dueDate && isToday(new Date(editedTask.dueDate))

  const completedSubtasks = editedTask.subtasks.filter((subtask) => subtask.completed).length
  const subtaskProgress = editedTask.subtasks.length > 0 ? (completedSubtasks / editedTask.subtasks.length) * 100 : 0

  const handleSave = () => {
    updateTask(task.id, editedTask)
    setIsEditing(false)
  }

  const handleDelete = () => {
    deleteTask(task.id)
    onOpenChange(false)
  }

  const handleDateSelect = (date: Date | undefined) => {
    setEditedTask({
      ...editedTask,
      dueDate: date ? date.toISOString().split("T")[0] : undefined,
    })
  }

  const handleAddSubtask = () => {
    if (!newSubtask.trim()) return

    const subtask = {
      id: Date.now().toString(),
      title: newSubtask.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    }

    setEditedTask({
      ...editedTask,
      subtasks: [...editedTask.subtasks, subtask],
    })
    setNewSubtask("")
  }

  const handleToggleSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.map((subtask) =>
        subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask,
      ),
    })
  }

  const handleDeleteSubtask = (subtaskId: string) => {
    setEditedTask({
      ...editedTask,
      subtasks: editedTask.subtasks.filter((subtask) => subtask.id !== subtaskId),
    })
  }

  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    urgent: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <DialogTitle className="text-lg lg:text-xl">Task Details</DialogTitle>
              {isOverdue && (
                <Badge variant="destructive" className="text-xs">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Overdue
                </Badge>
              )}
              {isDueToday && (
                <Badge variant="outline" className="text-xs border-blue-200 text-blue-600">
                  <Clock className="h-3 w-3 mr-1" />
                  Due Today
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && !isEditing ? (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
              ) : canEdit && isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave}>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </>
              ) : null}
              {canEdit && (
                <Button variant="destructive" size="sm" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            {/* Project Context */}
            {project && (
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.color }} />
                <span className="text-sm font-medium">{project.name}</span>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
              </div>
            )}

            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              {isEditing ? (
                <Input
                  id="title"
                  value={editedTask.title}
                  onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                  className="text-lg font-medium"
                />
              ) : (
                <h2 className="text-lg font-medium">{editedTask.title}</h2>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              {isEditing ? (
                <Textarea
                  id="description"
                  value={editedTask.description || ""}
                  onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                  rows={4}
                />
              ) : (
                <p className="text-muted-foreground whitespace-pre-wrap">
                  {editedTask.description || "No description provided."}
                </p>
              )}
            </div>

            <Separator />

            {/* Task Properties Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Flag className="h-4 w-4" />
                  <span>Status</span>
                </Label>
                {isEditing ? (
                  <Select
                    value={editedTask.status}
                    onValueChange={(value) => setEditedTask({ ...editedTask, status: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge variant="secondary" className="w-fit">
                    {editedTask.status.replace("-", " ")}
                  </Badge>
                )}
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <Flag className="h-4 w-4" />
                  <span>Priority</span>
                </Label>
                {isEditing ? (
                  <Select
                    value={editedTask.priority}
                    onValueChange={(value) => setEditedTask({ ...editedTask, priority: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Badge className={cn("w-fit", priorityColors[editedTask.priority])}>{editedTask.priority}</Badge>
                )}
              </div>

              {/* Assignee */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Assignee</span>
                </Label>
                {isEditing ? (
                  <Select
                    value={editedTask.assigneeId || "unassigned"}
                    onValueChange={(value) =>
                      setEditedTask({ ...editedTask, assigneeId: value === "unassigned" ? undefined : value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">Unassigned</SelectItem>
                      {state.users.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center space-x-2">
                            <Avatar className="h-6 w-6">
                              <AvatarImage src={user.avatar || "/placeholder.svg"} />
                              <AvatarFallback className="text-xs">
                                {user.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>{user.name}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : assignee ? (
                  <div className="flex items-center space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="text-xs">
                        {assignee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <span className="font-medium">{assignee.name}</span>
                      <p className="text-xs text-muted-foreground">{assignee.email}</p>
                    </div>
                  </div>
                ) : (
                  <span className="text-muted-foreground">Unassigned</span>
                )}
              </div>

              {/* Due Date */}
              <div className="space-y-2">
                <Label className="flex items-center space-x-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>Due Date</span>
                </Label>
                {isEditing ? (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !editedTask.dueDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editedTask.dueDate ? format(new Date(editedTask.dueDate), "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editedTask.dueDate ? new Date(editedTask.dueDate) : undefined}
                        onSelect={handleDateSelect}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                ) : editedTask.dueDate ? (
                  <div className="flex items-center space-x-2">
                    <span>{format(new Date(editedTask.dueDate), "PPP")}</span>
                    {isOverdue && <AlertTriangle className="h-4 w-4 text-red-500" />}
                    {isDueToday && <Clock className="h-4 w-4 text-blue-500" />}
                  </div>
                ) : (
                  <span className="text-muted-foreground">No due date</span>
                )}
              </div>
            </div>

            <Separator />

            {/* Subtasks */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>
                    Subtasks ({completedSubtasks}/{editedTask.subtasks.length})
                  </span>
                </Label>
                {editedTask.subtasks.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Progress value={subtaskProgress} className="w-20 h-2" />
                    <span className="text-xs text-muted-foreground">{Math.round(subtaskProgress)}%</span>
                  </div>
                )}
              </div>

              {/* Add Subtask */}
              {(isEditing || canEdit) && (
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add a subtask..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddSubtask()}
                  />
                  <Button size="sm" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {/* Subtask List */}
              <div className="space-y-2">
                {editedTask.subtasks.map((subtask) => (
                  <div key={subtask.id} className="flex items-center space-x-3 p-2 rounded-lg bg-muted/30">
                    <Checkbox
                      checked={subtask.completed}
                      onCheckedChange={() => handleToggleSubtask(subtask.id)}
                      disabled={!canEdit && !isEditing}
                    />
                    <span className={cn("flex-1 text-sm", subtask.completed && "line-through text-muted-foreground")}>
                      {subtask.title}
                    </span>
                    {(isEditing || canEdit) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSubtask(subtask.id)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
                {editedTask.subtasks.length === 0 && <p className="text-sm text-muted-foreground">No subtasks yet</p>}
              </div>
            </div>

            <Separator />

            {/* Tags */}
            <div className="space-y-2">
              <Label className="flex items-center space-x-2">
                <Tag className="h-4 w-4" />
                <span>Tags</span>
              </Label>
              <div className="flex flex-wrap gap-2">
                {editedTask.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
                {editedTask.tags.length === 0 && <span className="text-muted-foreground">No tags</span>}
              </div>
            </div>

            {/* Custom Fields */}
            {Object.keys(editedTask.customFields).length > 0 && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <Paperclip className="h-4 w-4" />
                    <span>Custom Fields</span>
                  </Label>
                  <div className="space-y-2">
                    {Object.entries(editedTask.customFields).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted/30 rounded-lg">
                        <span className="font-medium capitalize">{key.replace(/([A-Z])/g, " $1")}</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            <Separator />

            {/* Timestamps */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Created: {format(new Date(editedTask.createdAt), "PPp")}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4" />
                <span>Updated: {format(new Date(editedTask.updatedAt), "PPp")}</span>
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
