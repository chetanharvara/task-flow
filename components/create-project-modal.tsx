"use client"

import type React from "react"

import { useState } from "react"
import { useProject } from "@/contexts/project-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"
import type { Project } from "@/contexts/project-context"

interface CreateProjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const projectColors = [
  { name: "Blue", value: "#3b82f6" },
  { name: "Green", value: "#10b981" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Pink", value: "#ec4899" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Teal", value: "#14b8a6" },
]

export function CreateProjectModal({ open, onOpenChange }: CreateProjectModalProps) {
  const { addProject, setCurrentProject } = useProject()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    color: "#3b82f6",
    status: "active" as Project["status"],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) return

    const newProject = {
      name: formData.name,
      description: formData.description || undefined,
      color: formData.color,
      status: formData.status,
      memberIds: ["user-1"], // Default to current user
      columns: [
        { id: `col-${Date.now()}-1`, title: "To Do", status: "todo", order: 0, color: "#ef4444" },
        { id: `col-${Date.now()}-2`, title: "In Progress", status: "in-progress", order: 1, color: "#f59e0b" },
        { id: `col-${Date.now()}-3`, title: "Review", status: "review", order: 2, color: "#8b5cf6" },
        { id: `col-${Date.now()}-4`, title: "Done", status: "done", order: 3, color: "#10b981" },
      ],
    }

    addProject(newProject)

    // Reset form
    setFormData({
      name: "",
      description: "",
      color: "#3b82f6",
      status: "active",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Project</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Project Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter project name..."
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter project description..."
              rows={3}
            />
          </div>

          {/* Color */}
          <div className="space-y-2">
            <Label>Project Color</Label>
            <div className="flex flex-wrap gap-2">
              {projectColors.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  className={`w-8 h-8 rounded-full border-2 ${
                    formData.color === color.value ? "border-foreground" : "border-transparent"
                  }`}
                  style={{ backgroundColor: color.value }}
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value as any })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
