"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface Project {
  id: string
  name: string
  description?: string
  color: string
  status: "active" | "archived" | "completed"
  createdAt: string
  updatedAt: string
  memberIds: string[]
  columns: ProjectColumn[]
}

export interface ProjectColumn {
  id: string
  title: string
  status: string
  order: number
  color?: string
}

interface ProjectState {
  projects: Project[]
  currentProjectId: string | null
  loading: boolean
  error: string | null
}

type ProjectAction =
  | { type: "SET_PROJECTS"; payload: Project[] }
  | { type: "ADD_PROJECT"; payload: Project }
  | { type: "UPDATE_PROJECT"; payload: { id: string; updates: Partial<Project> } }
  | { type: "DELETE_PROJECT"; payload: string }
  | { type: "SET_CURRENT_PROJECT"; payload: string | null }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: ProjectState = {
  projects: [],
  currentProjectId: null,
  loading: false,
  error: null,
}

function projectReducer(state: ProjectState, action: ProjectAction): ProjectState {
  switch (action.type) {
    case "SET_PROJECTS":
      return { ...state, projects: action.payload }
    case "ADD_PROJECT":
      return { ...state, projects: [...state.projects, action.payload] }
    case "UPDATE_PROJECT":
      return {
        ...state,
        projects: state.projects.map((project) =>
          project.id === action.payload.id
            ? { ...project, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : project,
        ),
      }
    case "DELETE_PROJECT":
      return {
        ...state,
        projects: state.projects.filter((project) => project.id !== action.payload),
      }
    case "SET_CURRENT_PROJECT":
      return { ...state, currentProjectId: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const ProjectContext = createContext<{
  state: ProjectState
  dispatch: React.Dispatch<ProjectAction>
  addProject: (project: Omit<Project, "id" | "createdAt" | "updatedAt">) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  deleteProject: (id: string) => void
  setCurrentProject: (id: string | null) => void
  getCurrentProject: () => Project | null
} | null>(null)

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(projectReducer, initialState)

  // Initialize with sample data
  useEffect(() => {
    const sampleProjects: Project[] = [
      {
        id: "project-1",
        name: "Website Redesign",
        description: "Complete redesign of the company website with modern UI/UX",
        color: "#3b82f6",
        status: "active",
        createdAt: "2024-01-01T00:00:00Z",
        updatedAt: "2024-01-01T00:00:00Z",
        memberIds: ["user-1", "user-2", "user-3"],
        columns: [
          { id: "col-1", title: "To Do", status: "todo", order: 0, color: "#ef4444" },
          { id: "col-2", title: "In Progress", status: "in-progress", order: 1, color: "#f59e0b" },
          { id: "col-3", title: "Review", status: "review", order: 2, color: "#8b5cf6" },
          { id: "col-4", title: "Done", status: "done", order: 3, color: "#10b981" },
        ],
      },
    ]

    dispatch({ type: "SET_PROJECTS", payload: sampleProjects })
    dispatch({ type: "SET_CURRENT_PROJECT", payload: "project-1" })

    // Load from localStorage if available
    const savedProjects = localStorage.getItem("taskflow-projects")
    const savedCurrentProject = localStorage.getItem("taskflow-current-project")

    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects)
        dispatch({ type: "SET_PROJECTS", payload: parsedProjects })
      } catch (error) {
        console.error("Failed to load projects from localStorage:", error)
      }
    }

    if (savedCurrentProject) {
      dispatch({ type: "SET_CURRENT_PROJECT", payload: savedCurrentProject })
    }
  }, [])

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (state.projects.length > 0) {
      localStorage.setItem("taskflow-projects", JSON.stringify(state.projects))
    }
  }, [state.projects])

  useEffect(() => {
    if (state.currentProjectId) {
      localStorage.setItem("taskflow-current-project", state.currentProjectId)
    }
  }, [state.currentProjectId])

  const addProject = (projectData: Omit<Project, "id" | "createdAt" | "updatedAt">) => {
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_PROJECT", payload: newProject })
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    dispatch({ type: "UPDATE_PROJECT", payload: { id, updates } })
  }

  const deleteProject = (id: string) => {
    dispatch({ type: "DELETE_PROJECT", payload: id })
  }

  const setCurrentProject = (id: string | null) => {
    dispatch({ type: "SET_CURRENT_PROJECT", payload: id })
  }

  const getCurrentProject = () => {
    return state.projects.find((project) => project.id === state.currentProjectId) || null
  }

  return (
    <ProjectContext.Provider
      value={{
        state,
        dispatch,
        addProject,
        updateProject,
        deleteProject,
        setCurrentProject,
        getCurrentProject,
      }}
    >
      {children}
    </ProjectContext.Provider>
  )
}

export function useProject() {
  const context = useContext(ProjectContext)
  if (!context) {
    throw new Error("useProject must be used within a ProjectProvider")
  }
  return context
}
