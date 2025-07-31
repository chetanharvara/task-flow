"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { User, Mail, Calendar, Award, Activity, Save, Upload, CheckCircle } from "lucide-react"
import { format } from "date-fns"

export function ProfileView() {
  const { state: authState, updateProfile } = useAuth()
  const { state: taskState } = useTask()
  const [isEditing, setIsEditing] = useState(false)
  const [saveMessage, setSaveMessage] = useState("")
  const [formData, setFormData] = useState({
    name: authState.user?.name || "",
    email: authState.user?.email || "",
    bio: "",
    location: "",
    website: "",
    phone: "",
    department: "",
    jobTitle: "",
  })

  // Load additional profile data from localStorage
  useState(() => {
    if (authState.user) {
      const savedProfile = localStorage.getItem(`profile-${authState.user.id}`)
      if (savedProfile) {
        try {
          const profileData = JSON.parse(savedProfile)
          setFormData((prev) => ({
            ...prev,
            ...profileData,
          }))
        } catch (error) {
          console.error("Failed to load profile data:", error)
        }
      }
    }
  })

  if (!authState.user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Please log in</h2>
          <p className="text-muted-foreground">You need to be logged in to view your profile.</p>
        </div>
      </div>
    )
  }

  const user = authState.user
  const userTasks = taskState.tasks.filter((task) => task.assigneeId === user.id)
  const completedTasks = userTasks.filter((task) => task.status === "done")
  const completionRate = userTasks.length > 0 ? (completedTasks.length / userTasks.length) * 100 : 0

  const handleSave = () => {
    // Update the user profile
    updateProfile({
      name: formData.name,
      email: formData.email,
    })

    // Save additional profile data to localStorage
    const profileData = {
      bio: formData.bio,
      location: formData.location,
      website: formData.website,
      phone: formData.phone,
      department: formData.department,
      jobTitle: formData.jobTitle,
    }
    localStorage.setItem(`profile-${user.id}`, JSON.stringify(profileData))

    setIsEditing(false)
    setSaveMessage("Profile updated successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleCancel = () => {
    // Reset form data
    setFormData({
      name: authState.user?.name || "",
      email: authState.user?.email || "",
      bio: "",
      location: "",
      website: "",
      phone: "",
      department: "",
      jobTitle: "",
    })
    setIsEditing(false)
  }

  const tasksByStatus = {
    todo: userTasks.filter((task) => task.status === "todo").length,
    inProgress: userTasks.filter((task) => task.status === "in-progress").length,
    review: userTasks.filter((task) => task.status === "review").length,
    done: completedTasks.length,
  }

  const recentTasks = userTasks
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 5)

  const overdueTasks = userTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done",
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and view your activity</p>
        </div>
      </div>

      {saveMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-2xl">
                    {user.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Photo
                </Button>
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your.email@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={formData.jobTitle}
                      onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                      placeholder="Your job title"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Your department"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                      placeholder="Tell us about yourself..."
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Your location"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <Button onClick={handleSave} size="sm">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                    <Button variant="outline" onClick={handleCancel} size="sm">
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{user.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{user.email}</span>
                    </div>
                    {formData.jobTitle && (
                      <div className="flex items-center space-x-2">
                        <Award className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{formData.jobTitle}</span>
                      </div>
                    )}
                    {formData.department && (
                      <div className="text-sm text-muted-foreground">Department: {formData.department}</div>
                    )}
                    {formData.phone && <div className="text-sm text-muted-foreground">Phone: {formData.phone}</div>}
                    {formData.location && (
                      <div className="text-sm text-muted-foreground">Location: {formData.location}</div>
                    )}
                    {formData.website && (
                      <div className="text-sm">
                        <a
                          href={formData.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          {formData.website}
                        </a>
                      </div>
                    )}
                    {formData.bio && (
                      <div className="text-sm text-muted-foreground mt-3 p-3 bg-muted/50 rounded-lg">
                        {formData.bio}
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        Joined {format(new Date(user.createdAt), "MMMM yyyy")}
                      </span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="w-fit">
                    {user.role}
                  </Badge>
                  <Button variant="outline" onClick={() => setIsEditing(true)} size="sm">
                    Edit Profile
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Award className="h-5 w-5" />
                <span>Quick Stats</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Task Completion</span>
                  <span>{Math.round(completionRate)}%</span>
                </div>
                <Progress value={completionRate} className="h-2" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="text-center p-2 bg-muted/50 rounded">
                  <p className="font-medium">{userTasks.length}</p>
                  <p className="text-xs text-muted-foreground">Total Tasks</p>
                </div>
                <div className="text-center p-2 bg-green-100 dark:bg-green-900/20 rounded">
                  <p className="font-medium text-green-700 dark:text-green-400">{completedTasks.length}</p>
                  <p className="text-xs text-green-600 dark:text-green-500">Completed</p>
                </div>
              </div>
              {overdueTasks.length > 0 && (
                <div className="text-center p-2 bg-red-100 dark:bg-red-900/20 rounded">
                  <p className="font-medium text-red-700 dark:text-red-400">{overdueTasks.length}</p>
                  <p className="text-xs text-red-600 dark:text-red-500">Overdue</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="activity" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTasks.map((task) => (
                      <div key={task.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <div className="flex-1">
                          <p className="text-sm">
                            Updated task <span className="font-medium">{task.title}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {format(new Date(task.updatedAt), "MMM d, yyyy 'at' h:mm a")}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {task.status.replace("-", " ")}
                        </Badge>
                      </div>
                    ))}
                    {recentTasks.length === 0 && (
                      <p className="text-center text-muted-foreground py-8">No recent activity</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Task Overview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">{tasksByStatus.todo}</p>
                      <p className="text-sm text-muted-foreground">To Do</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{tasksByStatus.inProgress}</p>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{tasksByStatus.review}</p>
                      <p className="text-sm text-muted-foreground">Review</p>
                    </div>
                    <div className="text-center p-4 border rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{tasksByStatus.done}</p>
                      <p className="text-sm text-muted-foreground">Done</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Overdue Tasks */}
              {overdueTasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-red-600 dark:text-red-400">Overdue Tasks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {overdueTasks.map((task) => (
                        <div key={task.id} className="p-3 border border-red-200 dark:border-red-800 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{task.title}</h4>
                              <p className="text-sm text-red-600 dark:text-red-400">
                                Due: {format(new Date(task.dueDate!), "MMM d, yyyy")}
                              </p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {task.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Achievements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-3 p-4 border rounded-lg">
                      <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Task Master</h3>
                        <p className="text-sm text-muted-foreground">Completed {completedTasks.length} tasks</p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 border rounded-lg ${
                        completedTasks.length >= 10 ? "" : "opacity-50"
                      }`}
                    >
                      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Productive</h3>
                        <p className="text-sm text-muted-foreground">
                          {completedTasks.length >= 10 ? "Completed 10+ tasks" : "Complete 10 tasks (Locked)"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 border rounded-lg ${
                        overdueTasks.length === 0 ? "" : "opacity-50"
                      }`}
                    >
                      <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-green-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">On Time</h3>
                        <p className="text-sm text-muted-foreground">
                          {overdueTasks.length === 0 ? "No overdue tasks" : "Clear overdue tasks (Locked)"}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`flex items-center space-x-3 p-4 border rounded-lg ${
                        completionRate >= 80 ? "" : "opacity-50"
                      }`}
                    >
                      <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <Award className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">High Achiever</h3>
                        <p className="text-sm text-muted-foreground">
                          {completionRate >= 80 ? "80%+ completion rate" : "Reach 80% completion rate (Locked)"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
