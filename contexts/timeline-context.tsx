"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface TimelineEvent {
  id: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  type: "milestone" | "task" | "meeting" | "deadline" | "release"
  projectId: string
  assigneeId?: string
  status: "upcoming" | "in-progress" | "completed" | "overdue"
  color?: string
  createdAt: string
  updatedAt: string
}

interface TimelineState {
  events: TimelineEvent[]
  loading: boolean
  error: string | null
}

type TimelineAction =
  | { type: "SET_EVENTS"; payload: TimelineEvent[] }
  | { type: "ADD_EVENT"; payload: TimelineEvent }
  | { type: "UPDATE_EVENT"; payload: { id: string; updates: Partial<TimelineEvent> } }
  | { type: "DELETE_EVENT"; payload: string }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_ERROR"; payload: string | null }

const initialState: TimelineState = {
  events: [],
  loading: false,
  error: null,
}

function timelineReducer(state: TimelineState, action: TimelineAction): TimelineState {
  switch (action.type) {
    case "SET_EVENTS":
      return { ...state, events: action.payload }
    case "ADD_EVENT":
      return { ...state, events: [...state.events, action.payload] }
    case "UPDATE_EVENT":
      return {
        ...state,
        events: state.events.map((event) =>
          event.id === action.payload.id
            ? { ...event, ...action.payload.updates, updatedAt: new Date().toISOString() }
            : event,
        ),
      }
    case "DELETE_EVENT":
      return {
        ...state,
        events: state.events.filter((event) => event.id !== action.payload),
      }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_ERROR":
      return { ...state, error: action.payload }
    default:
      return state
  }
}

const TimelineContext = createContext<{
  state: TimelineState
  dispatch: React.Dispatch<TimelineAction>
  addEvent: (event: Omit<TimelineEvent, "id" | "createdAt" | "updatedAt">) => void
  updateEvent: (id: string, updates: Partial<TimelineEvent>) => void
  deleteEvent: (id: string) => void
  getEventsByProject: (projectId: string) => TimelineEvent[]
} | null>(null)

export function TimelineProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(timelineReducer, initialState)

  // Initialize with sample data
  useEffect(() => {
    const sampleEvents: TimelineEvent[] = [
      {
        id: "event-1",
        title: "Project Kickoff",
        description: "Initial project meeting with stakeholders",
        startDate: "2024-01-15T09:00:00Z",
        endDate: "2024-01-15T10:00:00Z",
        type: "meeting",
        projectId: "project-1",
        assigneeId: "user-1",
        status: "completed",
        color: "#3b82f6",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
      },
      {
        id: "event-2",
        title: "Design Phase Complete",
        description: "All design mockups and wireframes completed",
        startDate: "2024-02-01T00:00:00Z",
        type: "milestone",
        projectId: "project-1",
        assigneeId: "user-1",
        status: "upcoming",
        color: "#10b981",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
      },
      {
        id: "event-3",
        title: "Development Sprint 1",
        description: "First development sprint focusing on core features",
        startDate: "2024-02-05T00:00:00Z",
        endDate: "2024-02-19T00:00:00Z",
        type: "task",
        projectId: "project-1",
        assigneeId: "user-2",
        status: "upcoming",
        color: "#f59e0b",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
      },
      {
        id: "event-4",
        title: "Beta Release",
        description: "Release beta version for testing",
        startDate: "2024-03-01T00:00:00Z",
        type: "release",
        projectId: "project-1",
        assigneeId: "user-3",
        status: "upcoming",
        color: "#8b5cf6",
        createdAt: "2024-01-10T00:00:00Z",
        updatedAt: "2024-01-10T00:00:00Z",
      },
    ]

    dispatch({ type: "SET_EVENTS", payload: sampleEvents })

    // Load from localStorage if available
    const savedEvents = localStorage.getItem("taskflow-timeline-events")
    if (savedEvents) {
      try {
        const parsedEvents = JSON.parse(savedEvents)
        dispatch({ type: "SET_EVENTS", payload: parsedEvents })
      } catch (error) {
        console.error("Failed to load timeline events from localStorage:", error)
      }
    }
  }, [])

  // Save to localStorage whenever events change
  useEffect(() => {
    if (state.events.length > 0) {
      localStorage.setItem("taskflow-timeline-events", JSON.stringify(state.events))
    }
  }, [state.events])

  const addEvent = (eventData: Omit<TimelineEvent, "id" | "createdAt" | "updatedAt">) => {
    const newEvent: TimelineEvent = {
      ...eventData,
      id: `event-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_EVENT", payload: newEvent })
  }

  const updateEvent = (id: string, updates: Partial<TimelineEvent>) => {
    dispatch({ type: "UPDATE_EVENT", payload: { id, updates } })
  }

  const deleteEvent = (id: string) => {
    dispatch({ type: "DELETE_EVENT", payload: id })
  }

  const getEventsByProject = (projectId: string) => {
    return state.events
      .filter((event) => event.projectId === projectId)
      .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
  }

  return (
    <TimelineContext.Provider
      value={{
        state,
        dispatch,
        addEvent,
        updateEvent,
        deleteEvent,
        getEventsByProject,
      }}
    >
      {children}
    </TimelineContext.Provider>
  )
}

export function useTimeline() {
  const context = useContext(TimelineContext)
  if (!context) {
    throw new Error("useTimeline must be used within a TimelineProvider")
  }
  return context
}
