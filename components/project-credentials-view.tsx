"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { useTask } from "@/contexts/task-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Shield,
  Users,
  FileText,
  LinkIcon,
  Key,
  Database,
  Globe,
  Lock,
  Plus,
  Edit,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
} from "lucide-react"

interface ProjectCredential {
  id: string
  name: string
  type: "api_key" | "database" | "service" | "url" | "password" | "token"
  value: string
  description?: string
  createdAt: string
  createdBy: string
}

interface ProjectDocument {
  id: string
  title: string
  content: string
  type: "documentation" | "guide" | "api" | "readme"
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface ProjectLink {
  id: string
  title: string
  url: string
  description?: string
  category: "documentation" | "repository" | "deployment" | "monitoring" | "other"
  createdAt: string
  createdBy: string
}

interface ProjectCredentialsViewProps {
  projectId: string
}

export function ProjectCredentialsView({ projectId }: ProjectCredentialsViewProps) {
  const { state: authState, hasAdminAccess } = useAuth()
  const { getCurrentProject } = useProject()
  const { state: taskState } = useTask()

  const [credentials, setCredentials] = useState<ProjectCredential[]>([])
  const [documents, setDocuments] = useState<ProjectDocument[]>([])
  const [links, setLinks] = useState<ProjectLink[]>([])
  const [visibleCredentials, setVisibleCredentials] = useState<Set<string>>(new Set())

  // Modal states
  const [showCredentialForm, setShowCredentialForm] = useState(false)
  const [showDocumentForm, setShowDocumentForm] = useState(false)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [editingCredential, setEditingCredential] = useState<ProjectCredential | null>(null)
  const [editingDocument, setEditingDocument] = useState<ProjectDocument | null>(null)
  const [editingLink, setEditingLink] = useState<ProjectLink | null>(null)

  // Form states
  const [credentialForm, setCredentialForm] = useState({
    name: "",
    type: "api_key" as ProjectCredential["type"],
    value: "",
    description: "",
  })

  const [documentForm, setDocumentForm] = useState({
    title: "",
    content: "",
    type: "documentation" as ProjectDocument["type"],
  })

  const [linkForm, setLinkForm] = useState({
    title: "",
    url: "",
    description: "",
    category: "documentation" as ProjectLink["category"],
  })

  // Settings state
  const [settings, setSettings] = useState({
    accessLevel: "members",
    encryptionEnabled: true,
    auditLogging: true,
  })

  const [saveMessage, setSaveMessage] = useState("")

  const project = getCurrentProject()
  const isAdmin = hasAdminAccess()
  const currentUser = authState.user

  // Get project members (users assigned to tasks in this project)
  const projectMembers = taskState.users.filter((user) =>
    taskState.tasks.some((task) => task.projectId === projectId && task.assigneeId === user.id),
  )

  // Check if current user has access to this project
  const hasProjectAccess = isAdmin || projectMembers.some((member) => member.id === currentUser?.id)

  useEffect(() => {
    // Load data from localStorage or use mock data
    const savedCredentials = localStorage.getItem(`project-${projectId}-credentials`)
    const savedDocuments = localStorage.getItem(`project-${projectId}-documents`)
    const savedLinks = localStorage.getItem(`project-${projectId}-links`)
    const savedSettings = localStorage.getItem(`project-${projectId}-settings`)

    if (savedCredentials) {
      setCredentials(JSON.parse(savedCredentials))
    } else {
      // Mock data
      const mockCredentials: ProjectCredential[] = [
        {
          id: "cred-1",
          name: "Database Connection",
          type: "database",
          value: "postgresql://user:pass@localhost:5432/taskflow",
          description: "Main database connection string",
          createdAt: "2024-01-15T10:00:00Z",
          createdBy: "user-1",
        },
        {
          id: "cred-2",
          name: "API Key - Stripe",
          type: "api_key",
          value: "sk_test_51234567890abcdef",
          description: "Stripe payment processing API key",
          createdAt: "2024-01-16T14:30:00Z",
          createdBy: "user-1",
        },
      ]
      setCredentials(mockCredentials)
    }

    if (savedDocuments) {
      setDocuments(JSON.parse(savedDocuments))
    } else {
      // Mock data
      const mockDocuments: ProjectDocument[] = [
        {
          id: "doc-1",
          title: "Project Setup Guide",
          content:
            "# Project Setup\n\n## Prerequisites\n- Node.js 18+\n- PostgreSQL 14+\n\n## Installation\n1. Clone the repository\n2. Install dependencies: `npm install`\n3. Set up environment variables\n4. Run migrations: `npm run migrate`\n5. Start the server: `npm run dev`",
          type: "guide",
          createdAt: "2024-01-10T09:00:00Z",
          updatedAt: "2024-01-20T16:45:00Z",
          createdBy: "user-1",
        },
      ]
      setDocuments(mockDocuments)
    }

    if (savedLinks) {
      setLinks(JSON.parse(savedLinks))
    } else {
      // Mock data
      const mockLinks: ProjectLink[] = [
        {
          id: "link-1",
          title: "GitHub Repository",
          url: "https://github.com/company/taskflow",
          description: "Main project repository",
          category: "repository",
          createdAt: "2024-01-05T08:00:00Z",
          createdBy: "user-1",
        },
      ]
      setLinks(mockLinks)
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }
  }, [projectId])

  // Save data to localStorage
  const saveCredentials = (newCredentials: ProjectCredential[]) => {
    setCredentials(newCredentials)
    localStorage.setItem(`project-${projectId}-credentials`, JSON.stringify(newCredentials))
  }

  const saveDocuments = (newDocuments: ProjectDocument[]) => {
    setDocuments(newDocuments)
    localStorage.setItem(`project-${projectId}-documents`, JSON.stringify(newDocuments))
  }

  const saveLinks = (newLinks: ProjectLink[]) => {
    setLinks(newLinks)
    localStorage.setItem(`project-${projectId}-links`, JSON.stringify(newLinks))
  }

  const saveSettings = (newSettings: typeof settings) => {
    setSettings(newSettings)
    localStorage.setItem(`project-${projectId}-settings`, JSON.stringify(newSettings))
  }

  // Credential functions
  const handleAddCredential = () => {
    if (!credentialForm.name || !credentialForm.value) return

    const newCredential: ProjectCredential = {
      id: `cred-${Date.now()}`,
      name: credentialForm.name,
      type: credentialForm.type,
      value: credentialForm.value,
      description: credentialForm.description,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "unknown",
    }

    saveCredentials([...credentials, newCredential])
    setCredentialForm({ name: "", type: "api_key", value: "", description: "" })
    setShowCredentialForm(false)
  }

  const handleEditCredential = (credential: ProjectCredential) => {
    setEditingCredential(credential)
    setCredentialForm({
      name: credential.name,
      type: credential.type,
      value: credential.value,
      description: credential.description || "",
    })
    setShowCredentialForm(true)
  }

  const handleUpdateCredential = () => {
    if (!editingCredential || !credentialForm.name || !credentialForm.value) return

    const updatedCredentials = credentials.map((cred) =>
      cred.id === editingCredential.id
        ? {
            ...cred,
            name: credentialForm.name,
            type: credentialForm.type,
            value: credentialForm.value,
            description: credentialForm.description,
          }
        : cred,
    )

    saveCredentials(updatedCredentials)
    setCredentialForm({ name: "", type: "api_key", value: "", description: "" })
    setEditingCredential(null)
    setShowCredentialForm(false)
  }

  const handleDeleteCredential = (id: string) => {
    if (confirm("Are you sure you want to delete this credential?")) {
      saveCredentials(credentials.filter((cred) => cred.id !== id))
    }
  }

  // Document functions
  const handleAddDocument = () => {
    if (!documentForm.title || !documentForm.content) return

    const newDocument: ProjectDocument = {
      id: `doc-${Date.now()}`,
      title: documentForm.title,
      content: documentForm.content,
      type: documentForm.type,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: currentUser?.id || "unknown",
    }

    saveDocuments([...documents, newDocument])
    setDocumentForm({ title: "", content: "", type: "documentation" })
    setShowDocumentForm(false)
  }

  const handleEditDocument = (document: ProjectDocument) => {
    setEditingDocument(document)
    setDocumentForm({
      title: document.title,
      content: document.content,
      type: document.type,
    })
    setShowDocumentForm(true)
  }

  const handleUpdateDocument = () => {
    if (!editingDocument || !documentForm.title || !documentForm.content) return

    const updatedDocuments = documents.map((doc) =>
      doc.id === editingDocument.id
        ? {
            ...doc,
            title: documentForm.title,
            content: documentForm.content,
            type: documentForm.type,
            updatedAt: new Date().toISOString(),
          }
        : doc,
    )

    saveDocuments(updatedDocuments)
    setDocumentForm({ title: "", content: "", type: "documentation" })
    setEditingDocument(null)
    setShowDocumentForm(false)
  }

  const handleDeleteDocument = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      saveDocuments(documents.filter((doc) => doc.id !== id))
    }
  }

  // Link functions
  const handleAddLink = () => {
    if (!linkForm.title || !linkForm.url) return

    const newLink: ProjectLink = {
      id: `link-${Date.now()}`,
      title: linkForm.title,
      url: linkForm.url,
      description: linkForm.description,
      category: linkForm.category,
      createdAt: new Date().toISOString(),
      createdBy: currentUser?.id || "unknown",
    }

    saveLinks([...links, newLink])
    setLinkForm({ title: "", url: "", description: "", category: "documentation" })
    setShowLinkForm(false)
  }

  const handleEditLink = (link: ProjectLink) => {
    setEditingLink(link)
    setLinkForm({
      title: link.title,
      url: link.url,
      description: link.description || "",
      category: link.category,
    })
    setShowLinkForm(true)
  }

  const handleUpdateLink = () => {
    if (!editingLink || !linkForm.title || !linkForm.url) return

    const updatedLinks = links.map((link) =>
      link.id === editingLink.id
        ? {
            ...link,
            title: linkForm.title,
            url: linkForm.url,
            description: linkForm.description,
            category: linkForm.category,
          }
        : link,
    )

    saveLinks(updatedLinks)
    setLinkForm({ title: "", url: "", description: "", category: "documentation" })
    setEditingLink(null)
    setShowLinkForm(false)
  }

  const handleDeleteLink = (id: string) => {
    if (confirm("Are you sure you want to delete this link?")) {
      saveLinks(links.filter((link) => link.id !== id))
    }
  }

  const handleSaveSettings = () => {
    saveSettings(settings)
    setSaveMessage("Settings saved successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  if (!project) {
    return <div>Project not found</div>
  }

  if (!hasProjectAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
          <p className="text-muted-foreground">You don't have access to this project's credentials.</p>
        </div>
      </div>
    )
  }

  const toggleCredentialVisibility = (credentialId: string) => {
    const newVisible = new Set(visibleCredentials)
    if (newVisible.has(credentialId)) {
      newVisible.delete(credentialId)
    } else {
      newVisible.add(credentialId)
    }
    setVisibleCredentials(newVisible)
  }

  const getCredentialIcon = (type: string) => {
    switch (type) {
      case "database":
        return <Database className="h-4 w-4" />
      case "api_key":
        return <Key className="h-4 w-4" />
      case "service":
        return <Globe className="h-4 w-4" />
      case "url":
        return <LinkIcon className="h-4 w-4" />
      case "password":
        return <Lock className="h-4 w-4" />
      case "token":
        return <Shield className="h-4 w-4" />
      default:
        return <Key className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Credentials</h1>
          <p className="text-muted-foreground">Manage credentials, documentation, and links for {project.name}</p>
        </div>
        {isAdmin && (
          <div className="flex space-x-2">
            <Button onClick={() => setShowCredentialForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Credential
            </Button>
          </div>
        )}
      </div>

      {/* Project Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Project Members</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {projectMembers.map((member) => (
              <div key={member.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={member.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {member.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <Badge variant="secondary" className="text-xs">
                    {member.role}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="credentials" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="credentials">Credentials</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="credentials" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((credential) => (
              <Card key={credential.id}>
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getCredentialIcon(credential.type)}
                        <h3 className="font-medium">{credential.name}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {credential.type.replace("_", " ")}
                      </Badge>
                    </div>

                    {credential.description && (
                      <p className="text-sm text-muted-foreground">{credential.description}</p>
                    )}

                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Input
                          type={visibleCredentials.has(credential.id) ? "text" : "password"}
                          value={credential.value}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button variant="outline" size="icon" onClick={() => toggleCredentialVisibility(credential.id)}>
                          {visibleCredentials.has(credential.id) ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Created {new Date(credential.createdAt).toLocaleDateString()}</span>
                      {isAdmin && (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditCredential(credential)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteCredential(credential.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Documentation</h2>
            {isAdmin && (
              <Button onClick={() => setShowDocumentForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Document
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {documents.map((document) => (
              <Card key={document.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-5 w-5" />
                      <CardTitle className="text-lg">{document.title}</CardTitle>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{document.type}</Badge>
                      {isAdmin && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditDocument(document)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteDocument(document.id)}>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-muted p-4 rounded-lg overflow-auto max-h-64">
                        {document.content}
                      </pre>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Updated {new Date(document.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="links" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Project Links</h2>
            {isAdmin && (
              <Button onClick={() => setShowLinkForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Link
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {links.map((link) => (
              <Card key={link.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <LinkIcon className="h-4 w-4" />
                        <h3 className="font-medium truncate">{link.title}</h3>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {link.category}
                      </Badge>
                    </div>

                    {link.description && <p className="text-sm text-muted-foreground">{link.description}</p>}

                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start bg-transparent"
                        onClick={() => window.open(link.url, "_blank")}
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Open Link
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Added {new Date(link.createdAt).toLocaleDateString()}</span>
                      {isAdmin && (
                        <div className="flex space-x-1">
                          <Button variant="ghost" size="sm" onClick={() => handleEditLink(link)}>
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteLink(link.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {saveMessage && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>{saveMessage}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div>
                  <Label>Access Level</Label>
                  <p className="text-sm text-muted-foreground mb-2">Control who can view project credentials</p>
                  <Select
                    value={settings.accessLevel}
                    onValueChange={(value) => setSettings({ ...settings, accessLevel: value })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin Only</SelectItem>
                      <SelectItem value="members">Project Members</SelectItem>
                      <SelectItem value="all">All Users</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Credential Encryption</Label>
                  <p className="text-sm text-muted-foreground mb-2">All credentials are encrypted at rest</p>
                  <Badge variant={settings.encryptionEnabled ? "default" : "secondary"}>
                    {settings.encryptionEnabled ? "Enabled" : "Disabled"}
                  </Badge>
                </div>

                <div>
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground mb-2">Track access to sensitive information</p>
                  <Badge variant={settings.auditLogging ? "default" : "secondary"}>
                    {settings.auditLogging ? "Enabled" : "Disabled"}
                  </Badge>
                </div>
              </div>

              {isAdmin && (
                <Button onClick={handleSaveSettings}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </Button>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Credential Form Modal */}
      <Dialog open={showCredentialForm} onOpenChange={setShowCredentialForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingCredential ? "Edit Credential" : "Add New Credential"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cred-name">Name *</Label>
              <Input
                id="cred-name"
                value={credentialForm.name}
                onChange={(e) => setCredentialForm({ ...credentialForm, name: e.target.value })}
                placeholder="Credential name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-type">Type</Label>
              <Select
                value={credentialForm.type}
                onValueChange={(value) => setCredentialForm({ ...credentialForm, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="api_key">API Key</SelectItem>
                  <SelectItem value="database">Database</SelectItem>
                  <SelectItem value="service">Service</SelectItem>
                  <SelectItem value="url">URL</SelectItem>
                  <SelectItem value="password">Password</SelectItem>
                  <SelectItem value="token">Token</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-value">Value *</Label>
              <Input
                id="cred-value"
                type="password"
                value={credentialForm.value}
                onChange={(e) => setCredentialForm({ ...credentialForm, value: e.target.value })}
                placeholder="Credential value"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cred-description">Description</Label>
              <Textarea
                id="cred-description"
                value={credentialForm.description}
                onChange={(e) => setCredentialForm({ ...credentialForm, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCredentialForm(false)
                  setEditingCredential(null)
                  setCredentialForm({ name: "", type: "api_key", value: "", description: "" })
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingCredential ? handleUpdateCredential : handleAddCredential}>
                {editingCredential ? "Update" : "Add"} Credential
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Form Modal */}
      <Dialog open={showDocumentForm} onOpenChange={setShowDocumentForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingDocument ? "Edit Document" : "Add New Document"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="doc-title">Title *</Label>
              <Input
                id="doc-title"
                value={documentForm.title}
                onChange={(e) => setDocumentForm({ ...documentForm, title: e.target.value })}
                placeholder="Document title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-type">Type</Label>
              <Select
                value={documentForm.type}
                onValueChange={(value) => setDocumentForm({ ...documentForm, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="guide">Guide</SelectItem>
                  <SelectItem value="api">API</SelectItem>
                  <SelectItem value="readme">README</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="doc-content">Content *</Label>
              <Textarea
                id="doc-content"
                value={documentForm.content}
                onChange={(e) => setDocumentForm({ ...documentForm, content: e.target.value })}
                placeholder="Document content (Markdown supported)"
                rows={10}
                className="font-mono"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDocumentForm(false)
                  setEditingDocument(null)
                  setDocumentForm({ title: "", content: "", type: "documentation" })
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingDocument ? handleUpdateDocument : handleAddDocument}>
                {editingDocument ? "Update" : "Add"} Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Link Form Modal */}
      <Dialog open={showLinkForm} onOpenChange={setShowLinkForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingLink ? "Edit Link" : "Add New Link"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="link-title">Title *</Label>
              <Input
                id="link-title"
                value={linkForm.title}
                onChange={(e) => setLinkForm({ ...linkForm, title: e.target.value })}
                placeholder="Link title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-url">URL *</Label>
              <Input
                id="link-url"
                type="url"
                value={linkForm.url}
                onChange={(e) => setLinkForm({ ...linkForm, url: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-category">Category</Label>
              <Select
                value={linkForm.category}
                onValueChange={(value) => setLinkForm({ ...linkForm, category: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="documentation">Documentation</SelectItem>
                  <SelectItem value="repository">Repository</SelectItem>
                  <SelectItem value="deployment">Deployment</SelectItem>
                  <SelectItem value="monitoring">Monitoring</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-description">Description</Label>
              <Textarea
                id="link-description"
                value={linkForm.description}
                onChange={(e) => setLinkForm({ ...linkForm, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLinkForm(false)
                  setEditingLink(null)
                  setLinkForm({ title: "", url: "", description: "", category: "documentation" })
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingLink ? handleUpdateLink : handleAddLink}>
                {editingLink ? "Update" : "Add"} Link
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
