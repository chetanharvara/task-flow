"use client"

import { useState } from "react"
import { useTimeline } from "@/contexts/timeline-context"
import { useTask } from "@/contexts/task-context"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CreateTimelineEventModal } from "./create-timeline-event-modal"
import { EditTimelineEventModal } from "./edit-timeline-event-modal"
import {
  Plus,
  Calendar,
  Clock,
  Users,
  Flag,
  Rocket,
  CheckCircle,
  AlertCircle,
  Search,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
} from "lucide-react"
import { format, isAfter, isBefore, isToday } from "date-fns"
import type { Project } from "@/contexts/project-context"
import type { TimelineEvent } from "@/contexts/timeline-context"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface ProjectTimelineViewProps {
  project: Project
}

const eventTypeIcons = {
  milestone: Flag,
  task: CheckCircle,
  meeting: Users,
  deadline: AlertCircle,
  release: Rocket,
}

const eventTypeColors = {
  milestone: "bg-green-500",
  task: "bg-blue-500",
  meeting: "bg-purple-500",
  deadline: "bg-red-500",
  release: "bg-orange-500",
}

const statusColors = {
  upcoming: "bg-gray-500",
  "in-progress": "bg-yellow-500",
  completed: "bg-green-500",
  overdue: "bg-red-500",
}

export function ProjectTimelineView({ project }: ProjectTimelineViewProps) {
  const { getEventsByProject, deleteEvent } = useTimeline()
  const { getUserById } = useTask()
  const { state: authState } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<TimelineEvent | null>(null)

  const events = getEventsByProject(project.id)
  const canManageProject = authState.user?.role === "admin" || authState.user?.role === "member"

  // Filter events based on search and filters
  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "all" || event.type === filterType
    const matchesStatus = filterStatus === "all" || event.status === filterStatus

    return matchesSearch && matchesType && matchesStatus
  })

  // Group events by date
  const groupedEvents = filteredEvents.reduce(
    (groups, event) => {
      const date = format(new Date(event.startDate), "yyyy-MM-dd")
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
      return groups
    },
    {} as Record<string, TimelineEvent[]>,
  )

  const handleDeleteEvent = (eventId: string) => {
    if (confirm("Are you sure you want to delete this event?")) {
      deleteEvent(eventId)
    }
  }

  const getEventStatus = (event: TimelineEvent) => {
    const now = new Date()
    const startDate = new Date(event.startDate)
    const endDate = event.endDate ? new Date(event.endDate) : null

    if (event.status === "completed") return "completed"

    if (endDate && isAfter(now, endDate)) return "overdue"
    if (isBefore(now, startDate)) return "upcoming"
    if (endDate && isAfter(now, startDate) && isBefore(now, endDate)) return "in-progress"
    if (isToday(startDate)) return "in-progress"

    return event.status
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ backgroundColor: project.color }} />
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Project Timeline</h1>
            <Badge variant="outline" className="flex-shrink-0 text-xs">
              {project.name}
            </Badge>
          </div>
          <p className="text-sm lg:text-base text-muted-foreground">
            Track project milestones, deadlines, and important events
          </p>
        </div>

        {canManageProject && (
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="milestone">Milestone</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="deadline">Deadline</SelectItem>
                  <SelectItem value="release">Release</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <div className="space-y-6">
        {Object.keys(groupedEvents).length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== "all" || filterStatus !== "all"
                  ? "Try adjusting your search or filters"
                  : "Get started by adding your first timeline event"}
              </p>
              {canManageProject && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          Object.entries(groupedEvents)
            .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
            .map(([date, dayEvents]) => (
              <div key={date} className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-3 h-3 bg-primary rounded-full" />
                  </div>
                  <h3 className="text-lg font-semibold">{format(new Date(date), "EEEE, MMMM d, yyyy")}</h3>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="ml-6 space-y-3">
                  {dayEvents.map((event) => {
                    const IconComponent = eventTypeIcons[event.type]
                    const assignee = event.assigneeId ? getUserById(event.assigneeId) : null
                    const currentStatus = getEventStatus(event)

                    return (
                      <Card key={event.id} className="relative">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3 flex-1">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${eventTypeColors[event.type]}`}
                              >
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2 mb-1">
                                  <h4 className="font-semibold truncate">{event.title}</h4>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs text-white ${statusColors[currentStatus]}`}
                                  >
                                    {currentStatus.replace("-", " ")}
                                  </Badge>
                                  <Badge variant="outline" className="text-xs capitalize">
                                    {event.type}
                                  </Badge>
                                </div>

                                {event.description && (
                                  <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                                )}

                                <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                                  <div className="flex items-center space-x-1">
                                    <Clock className="h-3 w-3" />
                                    <span>
                                      {format(new Date(event.startDate), "h:mm a")}
                                      {event.endDate && ` - ${format(new Date(event.endDate), "h:mm a")}`}
                                    </span>
                                  </div>

                                  {assignee && (
                                    <div className="flex items-center space-x-1">
                                      <Avatar className="h-4 w-4">
                                        <AvatarImage src={assignee.avatar || "/placeholder.svg"} />
                                        <AvatarFallback className="text-xs">
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
                            </div>

                            {canManageProject && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => setEditingEvent(event)}>
                                    <Edit className="mr-2 h-4 w-4" />
                                    Edit Event
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteEvent(event.id)}
                                    className="text-destructive"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Event
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            ))
        )}
      </div>

      {/* Modals */}
      <CreateTimelineEventModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        projectId={project.id}
      />

      {editingEvent && (
        <EditTimelineEventModal isOpen={!!editingEvent} onClose={() => setEditingEvent(null)} event={editingEvent} />
      )}
    </div>
  )
}
