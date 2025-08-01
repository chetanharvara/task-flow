"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface Task {
  id: string
  title: string
  description?: string
  status: "todo" | "in-progress" | "review" | "done"
  priority: "low" | "medium" | "high" | "urgent"
  assigneeId?: string
  dueDate?: string
  createdAt: string
  updatedAt: string
  projectId: string
  parentTaskId?: string
  subtasks: Task[]
  customFields: Record<string, any>
  tags: string[]
  order: number
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "member" | "viewer"
}

interface TaskState {
  tasks: Task[]
  users: User[]
  loading: boolean
  error: string | null
}

type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "REORDER_TASKS"; payload: { tasks: Task[] } }
  | { type: "SET_USERS"; payload: User[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: TaskState = {
  tasks: [],
  users: [],
  loading: false,
  error: null,
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id
            ? { ...task, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : task,
        ),
      }
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      }
    case "REORDER_TASKS":
      return { ...state, tasks: action.payload.tasks }
    case "SET_USERS":
      return { ...state, users: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const TaskContext = createContext<{
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  addTask: (task: Omit<Task, "id" | "createdAt" | "updatedAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  reorderTasks: (tasks: Task[]) => void
  getTasksByStatus: (status: string) => Task[]
  getTasksByProject: (projectId: string) => Task[]
  getUserById: (id: string) => User | undefined
} | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Initialize with sample data
  useEffect(() => {
    const sampleUsers: User[] = [
      {
        id: "user-1",
        name: "John Doe",
        email: "john@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "admin",
      },
      {
        id: "user-2",
        name: "Jane Smith",
        email: "jane@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "member",
      },
      {
        id: "user-3",
        name: "Mike Johnson",
        email: "mike@example.com",
        avatar: "/placeholder.svg?height=32&width=32",
        role: "member",
      },
    ]

    const sampleTasks: Task[] = [
      {
        id: "task-1",
        title: "Design new landing page",
        description: "Create a modern, responsive landing page for the product launch",
        status: "in-progress",
        priority: "high",
        assigneeId: "user-1",
        dueDate: "2024-02-15",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z",
        projectId: "project-1",
        subtasks: [],
        customFields: { estimatedHours: 8, complexity: "medium" },
        tags: ["design", "frontend"],
        order: 0,
      },
      {
        id: "task-2",
        title: "Implement user authentication",
        description: "Set up secure user login and registration system",
        status: "todo",
        priority: "urgent",
        assigneeId: "user-2",
        dueDate: "2024-02-10",
        createdAt: "2024-01-16T09:00:00Z",
        updatedAt: "2024-01-16T09:00:00Z",
        projectId: "project-1",
        subtasks: [],
        customFields: { estimatedHours: 12, complexity: "high" },
        tags: ["backend", "security"],
        order: 1,
      },
      {
        id: "task-3",
        title: "Write API documentation",
        description: "Document all API endpoints with examples",
        status: "review",
        priority: "medium",
        assigneeId: "user-3",
        dueDate: "2024-02-20",
        createdAt: "2024-01-17T14:00:00Z",
        updatedAt: "2024-01-17T14:00:00Z",
        projectId: "project-1",
        subtasks: [],
        customFields: { estimatedHours: 4, complexity: "low" },
        tags: ["documentation"],
        order: 2,
      },
      {
        id: "task-4",
        title: "Set up CI/CD pipeline",
        description: "Configure automated testing and deployment",
        status: "done",
        priority: "medium",
        assigneeId: "user-1",
        dueDate: "2024-01-30",
        createdAt: "2024-01-10T11:00:00Z",
        updatedAt: "2024-01-25T16:00:00Z",
        projectId: "project-1",
        subtasks: [],
        customFields: { estimatedHours: 6, complexity: "medium" },
        tags: ["devops", "automation"],
        order: 3,
      },
    ]

    dispatch({ type: "SET_USERS", payload: sampleUsers })
    dispatch({ type: "SET_TASKS", payload: sampleTasks })

    // Load from localStorage if available
    const savedTasks = localStorage.getItem("taskflow-tasks")
    if (savedTasks) {
      try {
        const parsedTasks = JSON.parse(savedTasks)
        dispatch({ type: "SET_TASKS", payload: parsedTasks })
      } catch (error) {
        console.error("Failed to load tasks from localStorage:", error)
      }
    }
  }, [])

  // Save to localStorage whenever tasks change
  useEffect(() => {
    if (state.tasks.length > 0) {
      localStorage.setItem("taskflow-tasks", JSON.stringify(state.tasks))
    }
  }, [state.tasks])

  const addTask = (taskData: Omit<Task, "id" | "createdAt" | "updatedAt">) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_TASK", payload: newTask })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id })
  }

  const reorderTasks = (tasks: Task[]) => {
    dispatch({ type: "REORDER_TASKS", payload: { tasks } })
  }

  const getTasksByStatus = (status: string) => {
    return state.tasks.filter((task) => task.status === status).sort((a, b) => a.order - b.order)
  }

  const getTasksByProject = (projectId: string) => {
    return state.tasks.filter((task) => task.projectId === projectId)
  }

  const getUserById = (id: string) => {
    return state.users.find((user) => user.id === id)
  }

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        updateTask,
        deleteTask,
        reorderTasks,
        getTasksByStatus,
        getTasksByProject,
        getUserById,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

// export function useTask() {
//   const context = useContext(TaskContext)
//   if (!context) {
//     throw new Error("useTask must be used within a TaskProvider")
//   }
//   return context
// }

export function useTask() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }

  // Add addUser and deleteUser implementations
  const addUser = (user: User) => {
    context.dispatch({ type: "ADD_USER", payload: user })
  }

  const deleteUser = (userId: string) => {
    context.dispatch({ type: "DELETE_USER", payload: userId })
  }

  return {
    ...context,
    addUser,
    deleteUser,
  }
}