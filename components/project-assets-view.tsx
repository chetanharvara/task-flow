"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useProject } from "@/contexts/project-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import {
  ImageIcon,
  Video,
  Music,
  FileText,
  Archive,
  Download,
  Upload,
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  CheckCircle,
} from "lucide-react"

interface ProjectAsset {
  id: string
  name: string
  type: "image" | "video" | "audio" | "document" | "archive" | "other"
  size: number
  url: string
  description?: string
  tags: string[]
  uploadedAt: string
  uploadedBy: string
  lastModified: string
}

interface ProjectAssetsViewProps {
  projectId: string
}

export function ProjectAssetsView({ projectId }: ProjectAssetsViewProps) {
  const { state: authState, hasAdminAccess } = useAuth()
  const { getCurrentProject } = useProject()

  const [assets, setAssets] = useState<ProjectAsset[]>([])
  const [filteredAssets, setFilteredAssets] = useState<ProjectAsset[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<ProjectAsset | null>(null)
  const [saveMessage, setSaveMessage] = useState("")

  const [uploadMethod, setUploadMethod] = useState<"file" | "url">("url")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [assetForm, setAssetForm] = useState({
    name: "",
    type: "document" as ProjectAsset["type"],
    url: "",
    description: "",
    tags: [] as string[],
    tagInput: "",
  })

  const project = getCurrentProject()
  const isAdmin = hasAdminAccess()
  const currentUser = authState.user

  useEffect(() => {
    // Load assets from localStorage or use mock data
    const savedAssets = localStorage.getItem(`project-${projectId}-assets`)

    if (savedAssets) {
      const parsedAssets = JSON.parse(savedAssets)
      setAssets(parsedAssets)
      setFilteredAssets(parsedAssets)
    } else {
      // Mock data
      const mockAssets: ProjectAsset[] = [
        {
          id: "asset-1",
          name: "Project Logo.png",
          type: "image",
          size: 245760,
          url: "/placeholder.svg?height=200&width=200",
          description: "Main project logo in PNG format",
          tags: ["logo", "branding", "design"],
          uploadedAt: "2024-01-15T10:00:00Z",
          uploadedBy: "user-1",
          lastModified: "2024-01-15T10:00:00Z",
        },
        {
          id: "asset-2",
          name: "Requirements Document.pdf",
          type: "document",
          size: 1048576,
          url: "#",
          description: "Project requirements and specifications",
          tags: ["requirements", "documentation", "specs"],
          uploadedAt: "2024-01-10T14:30:00Z",
          uploadedBy: "user-2",
          lastModified: "2024-01-20T09:15:00Z",
        },
        {
          id: "asset-3",
          name: "Demo Video.mp4",
          type: "video",
          size: 52428800,
          url: "#",
          description: "Product demonstration video",
          tags: ["demo", "video", "presentation"],
          uploadedAt: "2024-01-18T16:45:00Z",
          uploadedBy: "user-1",
          lastModified: "2024-01-18T16:45:00Z",
        },
      ]
      setAssets(mockAssets)
      setFilteredAssets(mockAssets)
    }
  }, [projectId])

  // Filter assets based on search and type
  useEffect(() => {
    let filtered = assets

    if (searchQuery) {
      filtered = filtered.filter(
        (asset) =>
          asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((asset) => asset.type === typeFilter)
    }

    setFilteredAssets(filtered)
  }, [assets, searchQuery, typeFilter])

  const saveAssets = (newAssets: ProjectAsset[]) => {
    setAssets(newAssets)
    localStorage.setItem(`project-${projectId}-assets`, JSON.stringify(newAssets))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-5 w-5" />
      case "video":
        return <Video className="h-5 w-5" />
      case "audio":
        return <Music className="h-5 w-5" />
      case "document":
        return <FileText className="h-5 w-5" />
      case "archive":
        return <Archive className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)

    // Simulate file upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          // Create a blob URL for the uploaded file
          const blobUrl = URL.createObjectURL(file)
          setAssetForm({
            ...assetForm,
            name: assetForm.name || file.name,
            url: blobUrl,
            type: getFileType(file.type),
          })
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const getFileType = (mimeType: string): ProjectAsset["type"] => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    if (mimeType.startsWith("audio/")) return "audio"
    if (mimeType.includes("pdf") || mimeType.includes("document") || mimeType.includes("text")) return "document"
    if (mimeType.includes("zip") || mimeType.includes("rar")) return "archive"
    return "other"
  }

  const handleAddAsset = () => {
    if (!assetForm.name || !assetForm.url) return

    const newAsset: ProjectAsset = {
      id: `asset-${Date.now()}`,
      name: assetForm.name,
      type: assetForm.type,
      size: Math.floor(Math.random() * 10000000), // Mock size
      url: assetForm.url,
      description: assetForm.description,
      tags: assetForm.tags,
      uploadedAt: new Date().toISOString(),
      uploadedBy: currentUser?.id || "unknown",
      lastModified: new Date().toISOString(),
    }

    saveAssets([...assets, newAsset])
    resetForm()
    setShowAssetForm(false)
    setSaveMessage("Asset added successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleEditAsset = (asset: ProjectAsset) => {
    setEditingAsset(asset)
    setAssetForm({
      name: asset.name,
      type: asset.type,
      url: asset.url,
      description: asset.description || "",
      tags: asset.tags,
      tagInput: "",
    })
    setShowAssetForm(true)
  }

  const handleUpdateAsset = () => {
    if (!editingAsset || !assetForm.name || !assetForm.url) return

    const updatedAssets = assets.map((asset) =>
      asset.id === editingAsset.id
        ? {
            ...asset,
            name: assetForm.name,
            type: assetForm.type,
            url: assetForm.url,
            description: assetForm.description,
            tags: assetForm.tags,
            lastModified: new Date().toISOString(),
          }
        : asset,
    )

    saveAssets(updatedAssets)
    resetForm()
    setEditingAsset(null)
    setShowAssetForm(false)
    setSaveMessage("Asset updated successfully!")
    setTimeout(() => setSaveMessage(""), 3000)
  }

  const handleDeleteAsset = (id: string) => {
    if (confirm("Are you sure you want to delete this asset?")) {
      saveAssets(assets.filter((asset) => asset.id !== id))
      setSaveMessage("Asset deleted successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
    }
  }

  const resetForm = () => {
    setAssetForm({
      name: "",
      type: "document",
      url: "",
      description: "",
      tags: [],
      tagInput: "",
    })
    setUploadMethod("url")
    setUploadProgress(0)
    setSelectedFile(null)
  }

  const addTag = () => {
    if (assetForm.tagInput && !assetForm.tags.includes(assetForm.tagInput)) {
      setAssetForm({
        ...assetForm,
        tags: [...assetForm.tags, assetForm.tagInput],
        tagInput: "",
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setAssetForm({
      ...assetForm,
      tags: assetForm.tags.filter((tag) => tag !== tagToRemove),
    })
  }

  if (!project) {
    return <div>Project not found</div>
  }

  const totalSize = assets.reduce((sum, asset) => sum + asset.size, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Assets</h1>
          <p className="text-muted-foreground">
            Manage files and resources for {project.name} • {assets.length} files • {formatFileSize(totalSize)}
          </p>
        </div>
        <Button onClick={() => setShowAssetForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset
        </Button>
      </div>

      {saveMessage && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{saveMessage}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="image">Images</SelectItem>
                <SelectItem value="video">Videos</SelectItem>
                <SelectItem value="audio">Audio</SelectItem>
                <SelectItem value="document">Documents</SelectItem>
                <SelectItem value="archive">Archives</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAssets.map((asset) => (
          <Card key={asset.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    {getAssetIcon(asset.type)}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium truncate">{asset.name}</h3>
                      <p className="text-sm text-muted-foreground">{formatFileSize(asset.size)}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {asset.type}
                  </Badge>
                </div>

                {asset.description && <p className="text-sm text-muted-foreground line-clamp-2">{asset.description}</p>}

                {asset.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {asset.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {asset.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{asset.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <div className="flex space-x-1">
                    <Button variant="outline" size="sm" onClick={() => window.open(asset.url, "_blank")}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => window.open(asset.url, "_blank")}>
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEditAsset(asset)}>
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDeleteAsset(asset.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground">
                  Uploaded {new Date(asset.uploadedAt).toLocaleDateString()}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No assets found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || typeFilter !== "all"
                ? "No assets match your current filters."
                : "Start by uploading your first asset to this project."}
            </p>
            {!searchQuery && typeFilter === "all" && (
              <Button onClick={() => setShowAssetForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Asset
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Form Modal */}
      <Dialog open={showAssetForm} onOpenChange={setShowAssetForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingAsset ? "Edit Asset" : "Add New Asset"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="asset-name">Name *</Label>
              <Input
                id="asset-name"
                value={assetForm.name}
                onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                placeholder="Asset name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-type">Type</Label>
              <Select
                value={assetForm.type}
                onValueChange={(value) => setAssetForm({ ...assetForm, type: value as any })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="archive">Archive</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>File Source</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="upload-file"
                    name="fileSource"
                    checked={uploadMethod === "file"}
                    onChange={() => setUploadMethod("file")}
                  />
                  <Label htmlFor="upload-file">Upload File</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="upload-url"
                    name="fileSource"
                    checked={uploadMethod === "url"}
                    onChange={() => setUploadMethod("url")}
                  />
                  <Label htmlFor="upload-url">Use URL</Label>
                </div>
              </div>

              {uploadMethod === "file" ? (
                <div className="space-y-2">
                  <Input
                    type="file"
                    onChange={handleFileUpload}
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt,.zip,.rar"
                  />
                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-2" />
                    </div>
                  )}
                </div>
              ) : (
                <Input
                  type="url"
                  value={assetForm.url}
                  onChange={(e) => setAssetForm({ ...assetForm, url: e.target.value })}
                  placeholder="https://example.com/file.pdf"
                />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="asset-description">Description</Label>
              <Textarea
                id="asset-description"
                value={assetForm.description}
                onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex space-x-2">
                <Input
                  value={assetForm.tagInput}
                  onChange={(e) => setAssetForm({ ...assetForm, tagInput: e.target.value })}
                  placeholder="Add tag"
                  onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                />
                <Button type="button" variant="outline" onClick={addTag}>
                  Add
                </Button>
              </div>
              {assetForm.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {assetForm.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowAssetForm(false)
                  setEditingAsset(null)
                  resetForm()
                }}
              >
                Cancel
              </Button>
              <Button onClick={editingAsset ? handleUpdateAsset : handleAddAsset}>
                {editingAsset ? "Update" : "Add"} Asset
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
