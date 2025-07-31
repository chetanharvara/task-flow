"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function HomePage() {
  const router = useRouter()
  const { state } = useAuth()

  useEffect(() => {
    if (state.loading) return

    if (state.isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/login")
    }
  }, [state.isAuthenticated, state.loading, router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Loading TaskFlow...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      </div>
    </div>
  )
}
