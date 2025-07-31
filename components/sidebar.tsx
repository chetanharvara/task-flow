"use client"

import { useState } from "react"
import Link from "next/link"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Home,
  FolderOpen,
  Calendar,
  Users,
  Settings,
  Plus,
  ChevronLeft,
  ChevronRight,
  User,
  Shield,
  FileText,
  ChevronDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { CreateProjectModal } from "@/components/create-project-modal"
import { useAuth } from "@/contexts/auth-context"

interface SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function Sidebar({ open, onOpenChange }: SidebarProps) {
  const { state, setCurrentProject } = useProject()
  const { hasAdminAccess } = useAuth()
  const [expandedProjects, setExpandedProjects] = useState<string[]>([])
  const [showCreateProject, setShowCreateProject] = useState(false)

  const toggleProjectExpansion = (projectId: string) => {
    setExpandedProjects((prev) =>
      prev.includes(projectId) ? prev.filter((id) => id !== projectId) : [...prev, projectId],
    )
  }

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "My Tasks", href: "/tasks", icon: FolderOpen },
    { name: "Calendar", href: "/calendar", icon: Calendar },
    ...(hasAdminAccess() ? [{ name: "Team", href: "/team", icon: Users }] : []),
    { name: "Profile", href: "/profile", icon: User },
    ...(hasAdminAccess() ? [{ name: "Admin", href: "/admin", icon: Shield }] : []),
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-full bg-card border-r transition-all duration-300",
        open ? "w-64" : "w-16",
      )}
    >
      <div className="flex h-full flex-col">
        {/* Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b">
          {open && (
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </div>
              <span className="font-semibold text-lg">TaskFlow</span>
            </div>
          )}
          <Button variant="ghost" size="icon" onClick={() => onOpenChange(!open)} className="h-8 w-8">
            {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        <ScrollArea className="flex-1 px-3 py-4">
          {/* Navigation */}
          <div className="space-y-1">
            {navigation.map((item) => (
              <Link key={item.name} href={item.href}>
                <Button variant="ghost" className={cn("w-full justify-start", !open && "px-2")}>
                  <item.icon className="h-4 w-4" />
                  {open && <span className="ml-3">{item.name}</span>}
                </Button>
              </Link>
            ))}
          </div>

          {/* Projects */}
          {open && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-muted-foreground">Projects</h3>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowCreateProject(true)}>
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {state.projects.map((project) => {
                  const isExpanded = expandedProjects.includes(project.id)
                  const isCurrentProject = state.currentProjectId === project.id

                  return (
                    <div key={project.id} className="space-y-1">
                      <div className="flex items-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 mr-1"
                          onClick={() => toggleProjectExpansion(project.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        </Button>
                        <Button
                          variant={isCurrentProject ? "secondary" : "ghost"}
                          className="flex-1 justify-start"
                          onClick={() => setCurrentProject(project.id)}
                        >
                          <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: project.color }} />
                          <span className="truncate">{project.name}</span>
                        </Button>
                      </div>

                      {isExpanded && (
                        <div className="ml-8 space-y-1">
                          <Link href={`/project/${project.id}`}>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                              <FolderOpen className="h-3 w-3 mr-2" />
                              Board
                            </Button>
                          </Link>
                          <Link href={`/project/${project.id}/credentials`}>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                              <Shield className="h-3 w-3 mr-2" />
                              Credentials
                            </Button>
                          </Link>
                          <Link href={`/project/${project.id}/assets`}>
                            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
                              <FileText className="h-3 w-3 mr-2" />
                              Assets
                            </Button>
                          </Link>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </ScrollArea>

        {/* User Profile */}
        <div className="border-t p-4">
          <div className={cn("flex items-center", open ? "space-x-3" : "justify-center")}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder.svg?height=32&width=32" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            {open && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Doe</p>
                <p className="text-xs text-muted-foreground truncate">john@example.com</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateProjectModal open={showCreateProject} onOpenChange={setShowCreateProject} />
    </div>
  )
}
