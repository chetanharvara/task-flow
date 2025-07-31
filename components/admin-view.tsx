"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useTask } from "@/contexts/task-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, UserPlus, Shield, Trash2, Edit, Mail, Calendar } from "lucide-react"
import type { AuthUser } from "@/contexts/auth-context"

export function AdminView() {
  const { state: authState, hasAdminAccess } = useAuth()
  const { state: taskState, addUser, deleteUser } = useTask()
  const [showCreateUser, setShowCreateUser] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AuthUser | null>(null)
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    role: "member" as "admin" | "member" | "viewer",
    password: "",
    confirmPassword: "",
  })
  const [formError, setFormError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  // Check if user has admin access
  if (!hasAdminAccess()) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Shield className="h-16 w-16 text-muted-foreground" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground max-w-md">
            You don't have permission to access the admin panel. Only administrators can manage users and system
            settings.
          </p>
        </div>
        <Button variant="outline" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    )
  }

  const handleCreateUser = () => {
    setFormError("")
    setSuccessMessage("")

    // Validation
    if (!userForm.name.trim() || !userForm.email.trim() || !userForm.password) {
      setFormError("Please fill in all required fields")
      return
    }

    if (userForm.password.length < 6) {
      setFormError("Password must be at least 6 characters long")
      return
    }

    if (userForm.password !== userForm.confirmPassword) {
      setFormError("Passwords do not match")
      return
    }

    // Check if email already exists
    if (taskState.users.some((user) => user.email === userForm.email)) {
      setFormError("A user with this email already exists")
      return
    }

    // Create new user
    const newUser = {
      id: `user-${Date.now()}`,
      name: userForm.name,
      email: userForm.email,
      role: userForm.role,
      avatar: `/placeholder.svg?height=32&width=32`,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    }

    addUser(newUser)

    // Reset form
    setUserForm({
      name: "",
      email: "",
      role: "member",
      password: "",
      confirmPassword: "",
    })

    setSuccessMessage(`User ${newUser.name} created successfully!`)
    setShowCreateUser(false)

    // Clear success message after 3 seconds
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const handleDeleteUser = (userId: string) => {
    // Prevent deleting own account
    if (userId === authState.user?.id) {
      setFormError("You cannot delete your own account")
      return
    }

    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      deleteUser(userId)
      setSuccessMessage("User deleted successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    }
  }

  const getUserStats = () => {
    const totalUsers = taskState.users.length
    const adminUsers = taskState.users.filter((user) => user.role === "admin").length
    const memberUsers = taskState.users.filter((user) => user.role === "member").length
    const viewerUsers = taskState.users.filter((user) => user.role === "viewer").length

    return { totalUsers, adminUsers, memberUsers, viewerUsers }
  }

  const stats = getUserStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Panel</h1>
          <p className="text-muted-foreground">Manage users and system settings</p>
        </div>
        <Button onClick={() => setShowCreateUser(true)}>
          <UserPlus className="h-4 w-4 mr-2" />
          Create User
        </Button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <AlertDescription className="text-green-800">{successMessage}</AlertDescription>
        </Alert>
      )}

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-4 w-4 text-red-600" />
              <div>
                <p className="text-2xl font-bold">{stats.adminUsers}</p>
                <p className="text-xs text-muted-foreground">Admins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.memberUsers}</p>
                <p className="text-xs text-muted-foreground">Members</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.viewerUsers}</p>
                <p className="text-xs text-muted-foreground">Viewers</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Management */}
      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {taskState.users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} />
                    <AvatarFallback>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="font-medium">{user.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      <span>{user.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Badge
                    variant={user.role === "admin" ? "destructive" : user.role === "member" ? "default" : "secondary"}
                  >
                    {user.role}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteUser(user.id)}
                    disabled={user.id === authState.user?.id}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create User Modal */}
      <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create New User</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {formError && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                placeholder="Enter email address"
              />
            </div>

            <div className="space-y-2">
              <Label>Role *</Label>
              <Select value={userForm.role} onValueChange={(value: any) => setUserForm({ ...userForm, role: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="viewer">Viewer</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                placeholder="Enter password (min 6 characters)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={userForm.confirmPassword}
                onChange={(e) => setUserForm({ ...userForm, confirmPassword: e.target.value })}
                placeholder="Confirm password"
              />
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateUser(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateUser}>
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
