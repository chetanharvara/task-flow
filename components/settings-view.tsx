"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "next-themes"
import { User, Bell, Palette, Shield, Download, Upload, Trash2, Save, Moon, Sun, Monitor } from "lucide-react"

export function SettingsView() {
  const { theme, setTheme } = useTheme()
  const [profile, setProfile] = useState({
    name: "John Doe",
    email: "john@example.com",
    avatar: "/placeholder.svg?height=80&width=80",
    role: "admin",
    timezone: "UTC-8",
    language: "en",
  })

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    weeklyDigest: false,
    projectUpdates: true,
  })

  const [preferences, setPreferences] = useState({
    defaultView: "board",
    autoSave: true,
    compactMode: false,
    showCompletedTasks: true,
  })

  const handleExportData = () => {
    // Export functionality
    const data = {
      tasks: JSON.parse(localStorage.getItem("taskflow-tasks") || "[]"),
      projects: JSON.parse(localStorage.getItem("taskflow-projects") || "[]"),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `taskflow-backup-${new Date().toISOString().split("T")[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearData = () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      localStorage.removeItem("taskflow-tasks")
      localStorage.removeItem("taskflow-projects")
      localStorage.removeItem("taskflow-current-project")
      window.location.reload()
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profile.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-lg">
                    {profile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Change Avatar
                  </Button>
                  <p className="text-sm text-muted-foreground">JPG, PNG or GIF. Max size 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={profile.timezone}
                    onValueChange={(value) => setProfile({ ...profile, timezone: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC-8">Pacific Time (UTC-8)</SelectItem>
                      <SelectItem value="UTC-5">Eastern Time (UTC-5)</SelectItem>
                      <SelectItem value="UTC+0">Greenwich Mean Time (UTC+0)</SelectItem>
                      <SelectItem value="UTC+1">Central European Time (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={profile.language}
                    onValueChange={(value) => setProfile({ ...profile, language: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant="secondary">{profile.role}</Badge>
                <span className="text-sm text-muted-foreground">Account Role</span>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notification Preferences</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications via email</p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="push-notifications">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive push notifications in browser</p>
                  </div>
                  <Switch
                    id="push-notifications"
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, pushNotifications: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="task-reminders">Task Reminders</Label>
                    <p className="text-sm text-muted-foreground">Get reminded about upcoming due dates</p>
                  </div>
                  <Switch
                    id="task-reminders"
                    checked={notifications.taskReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, taskReminders: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weekly-digest">Weekly Digest</Label>
                    <p className="text-sm text-muted-foreground">Receive weekly summary of your tasks</p>
                  </div>
                  <Switch
                    id="weekly-digest"
                    checked={notifications.weeklyDigest}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyDigest: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="project-updates">Project Updates</Label>
                    <p className="text-sm text-muted-foreground">Get notified about project changes</p>
                  </div>
                  <Switch
                    id="project-updates"
                    checked={notifications.projectUpdates}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, projectUpdates: checked })}
                  />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground mb-3">Choose your preferred theme</p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant={theme === "light" ? "default" : "outline"}
                      className="flex flex-col items-center space-y-2 h-auto p-4"
                      onClick={() => setTheme("light")}
                    >
                      <Sun className="h-6 w-6" />
                      <span>Light</span>
                    </Button>
                    <Button
                      variant={theme === "dark" ? "default" : "outline"}
                      className="flex flex-col items-center space-y-2 h-auto p-4"
                      onClick={() => setTheme("dark")}
                    >
                      <Moon className="h-6 w-6" />
                      <span>Dark</span>
                    </Button>
                    <Button
                      variant={theme === "system" ? "default" : "outline"}
                      className="flex flex-col items-center space-y-2 h-auto p-4"
                      onClick={() => setTheme("system")}
                    >
                      <Monitor className="h-6 w-6" />
                      <span>System</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Application Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="default-view">Default View</Label>
                  <Select
                    value={preferences.defaultView}
                    onValueChange={(value) => setPreferences({ ...preferences, defaultView: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="board">Board View</SelectItem>
                      <SelectItem value="list">List View</SelectItem>
                      <SelectItem value="calendar">Calendar View</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">Automatically save changes</p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={preferences.autoSave}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, autoSave: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="compact-mode">Compact Mode</Label>
                    <p className="text-sm text-muted-foreground">Use compact layout to show more content</p>
                  </div>
                  <Switch
                    id="compact-mode"
                    checked={preferences.compactMode}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, compactMode: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="show-completed">Show Completed Tasks</Label>
                    <p className="text-sm text-muted-foreground">Display completed tasks in lists</p>
                  </div>
                  <Switch
                    id="show-completed"
                    checked={preferences.showCompletedTasks}
                    onCheckedChange={(checked) => setPreferences({ ...preferences, showCompletedTasks: checked })}
                  />
                </div>
              </div>

              <Button>
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Data Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Export Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Download all your tasks and projects as a JSON file
                  </p>
                  <Button variant="outline" onClick={handleExportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2">Import Data</h3>
                  <p className="text-sm text-muted-foreground mb-3">Import tasks and projects from a JSON file</p>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-2 text-red-600 dark:text-red-400">Danger Zone</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Clear all data from local storage. This action cannot be undone.
                  </p>
                  <Button variant="destructive" onClick={handleClearData}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All Data
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
