"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTimeline } from "@/contexts/timeline-context"
import { useTask } from "@/contexts/task-context"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import type { TimelineEvent } from "@/contexts/timeline-context"

interface EditTimelineEventModalProps {
  isOpen: boolean
  onClose: () => void
  event: TimelineEvent
}

export function EditTimelineEventModal({ isOpen, onClose, event }: EditTimelineEventModalProps) {
  const { updateEvent } = useTimeline()
  const { state: taskState } = useTask()
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "milestone" as TimelineEvent["type"],
    assigneeId: "",
    status: "upcoming" as TimelineEvent["status"],
    color: "#3b82f6",
  })
  const [startDate, setStartDate] = useState<Date>()
  const [endDate, setEndDate] = useState<Date>()
  const [startTime, setStartTime] = useState("09:00")
  const [endTime, setEndTime] = useState("10:00")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Initialize form with event data
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description || "",
        type: event.type,
        assigneeId: event.assigneeId || "",
        status: event.status,
        color: event.color || "#3b82f6",
      })

      const eventStartDate = new Date(event.startDate)
      setStartDate(eventStartDate)
      setStartTime(format(eventStartDate, "HH:mm"))

      if (event.endDate) {
        const eventEndDate = new Date(event.endDate)
        setEndDate(eventEndDate)
        setEndTime(format(eventEndDate, "HH:mm"))
      } else {
        setEndDate(undefined)
        setEndTime("10:00")
      }
    }
  }, [event])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!startDate || !formData.title.trim()) return

    setIsSubmitting(true)

    try {
      const startDateTime = new Date(startDate)
      const [startHour, startMinute] = startTime.split(":").map(Number)
      startDateTime.setHours(startHour, startMinute, 0, 0)

      let endDateTime: Date | undefined
      if (endDate) {
        endDateTime = new Date(endDate)
        const [endHour, endMinute] = endTime.split(":").map(Number)
        endDateTime.setHours(endHour, endMinute, 0, 0)
      }

      updateEvent(event.id, {
        title: formData.title.trim(),
        description: formData.description.trim() || undefined,
        startDate: startDateTime.toISOString(),
        endDate: endDateTime?.toISOString(),
        type: formData.type,
        assigneeId: formData.assigneeId || undefined,
        status: formData.status,
        color: formData.color,
      })

      onClose()
    } catch (error) {
      console.error("Failed to update timeline event:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Timeline Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter event title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value: TimelineEvent["type"]) => setFormData({ ...formData, type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: TimelineEvent["status"]) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Assignee</Label>
            <Select
              value={formData.assigneeId}
              onValueChange={(value) => setFormData({ ...formData, assigneeId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select assignee (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No assignee</SelectItem>
                {taskState.users.map((user) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>Start Time</Label>
              <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>End Time</Label>
              <Input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} disabled={!endDate} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10"
              />
              <Input
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                placeholder="#3b82f6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !startDate || !formData.title.trim()}>
              {isSubmitting ? "Updating..." : "Update Event"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
