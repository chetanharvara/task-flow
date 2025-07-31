"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Menu, Search, Plus, Bell, User, Settings, LogOut } from "lucide-react"
import { CreateTaskModal } from "@/components/create-task-modal"

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter()
  const { state: authState, logout } = useAuth()
  const { getCurrentProject } = useProject()
  const [showCreateTask, setShowCreateTask] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const currentProject = getCurrentProject()
  const canCreateTasks = authState.user?.role !== "viewer"

  const handleProfileClick = () => {
    router.push("/profile")
  }

  const handleSettingsClick = () => {
    router.push("/settings")
  }

  const handleCreateTask = () => {
    if (!currentProject) {
      alert("Please select a project first")
      return
    }
    setShowCreateTask(true)
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="lg:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="relative hidden sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks, projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-64 lg:w-80 pl-9"
          />
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Current Project Indicator */}
        {currentProject && (
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 bg-muted rounded-md">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: currentProject.color }} />
            <span className="text-sm font-medium truncate max-w-32 lg:max-w-none">{currentProject.name}</span>
          </div>
        )}

        {/* New Task Button */}
        {canCreateTasks && (
          <Button size="sm" onClick={handleCreateTask} className="hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            New Task
          </Button>
        )}

        {/* Mobile New Task Button */}
        {canCreateTasks && (
          <Button size="icon" onClick={handleCreateTask} className="sm:hidden">
            <Plus className="h-4 w-4" />
          </Button>
        )}

        {/* Notifications */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={authState.user?.avatar || "/placeholder.svg"} />
                <AvatarFallback>
                  {authState.user?.name
                    ?.split(" ")
                    .map((n) => n[0])
                    .join("") || "U"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{authState.user?.name || "User"}</p>
                <p className="text-xs leading-none text-muted-foreground">{authState.user?.email}</p>
                <Badge variant="outline" className="w-fit text-xs mt-1">
                  {authState.user?.role || "member"}
                </Badge>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Create Task Modal */}
      {currentProject && (
        <CreateTaskModal
          open={showCreateTask}
          onOpenChange={setShowCreateTask}
          defaultStatus="todo"
          projectId={currentProject.id}
        />
      )}
    </header>
  )
}
