"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
  role: "admin" | "member" | "viewer"
  isAdmin: boolean
  createdAt: string
  lastLogin: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
}

type AuthAction =
  | { type: "SET_USER"; payload: AuthUser }
  | { type: "LOGOUT" }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }
  | { type: "UPDATE_USER"; payload: Partial<AuthUser> }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null,
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false }
    case "UPDATE_USER":
      return {
        ...state,
        user: state.user ? { ...state.user, ...action.payload } : null,
      }
    default:
      return state
  }
}

const AuthContext = createContext<{
  state: AuthState
  dispatch: React.Dispatch<AuthAction>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  updateProfile: (updates: Partial<AuthUser>) => void
  hasAdminAccess: () => boolean
} | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Mock users database
  const mockUsers: AuthUser[] = [
    {
      id: "user-1",
      name: "John Doe",
      email: "admin@taskflow.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "admin",
      isAdmin: true,
      createdAt: "2024-01-01T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
    {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@taskflow.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "member",
      isAdmin: false,
      createdAt: "2024-01-02T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
    {
      id: "user-3",
      name: "Mike Johnson",
      email: "mike@taskflow.com",
      avatar: "/placeholder.svg?height=32&width=32",
      role: "viewer",
      isAdmin: false,
      createdAt: "2024-01-03T00:00:00Z",
      lastLogin: new Date().toISOString(),
    },
  ]

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem("taskflow-user")
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        dispatch({ type: "SET_USER", payload: user })
      } catch (error) {
        console.error("Failed to parse saved user:", error)
        dispatch({ type: "SET_LOADING", payload: false })
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false })
    }
  }, [])

  const login = async (email: string, password: string) => {
    dispatch({ type: "SET_LOADING", payload: true })
    dispatch({ type: "SET_ERROR", payload: null })

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user = mockUsers.find((u) => u.email === email)

    if (!user || password !== "password123") {
      dispatch({ type: "SET_ERROR", payload: "Invalid email or password" })
      return
    }

    const updatedUser = { ...user, lastLogin: new Date().toISOString() }
    localStorage.setItem("taskflow-user", JSON.stringify(updatedUser))
    dispatch({ type: "SET_USER", payload: updatedUser })
  }

  const logout = () => {
    localStorage.removeItem("taskflow-user")
    dispatch({ type: "LOGOUT" })
  }

  const updateProfile = (updates: Partial<AuthUser>) => {
    if (state.user) {
      const updatedUser = { ...state.user, ...updates }
      localStorage.setItem("taskflow-user", JSON.stringify(updatedUser))
      dispatch({ type: "UPDATE_USER", payload: updates })
    }
  }

  const hasAdminAccess = () => {
    return state.user?.isAdmin || state.user?.role === "admin" || false
  }

  return (
    <AuthContext.Provider
      value={{
        state,
        dispatch,
        login,
        logout,
        updateProfile,
        hasAdminAccess,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
