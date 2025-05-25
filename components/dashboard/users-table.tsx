"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Eye, Trash2 } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { UserProfile } from "@/components/dashboard/user-profile"
import { useToast } from "@/components/ui/use-toast"

interface User {
  id: string
  email: string
  full_name: string | null
  role: string
  risk_score: number
  created_at: string
  updated_at: string
  last_active?: string
}

export function UsersTable() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true)

      try {
        // First check if the profiles table exists
        const { error: tableCheckError } = await supabase.from("profiles").select("id").limit(1).single()

        // If the table doesn't exist, use mock data
        if (tableCheckError && tableCheckError.message.includes("does not exist")) {
          console.log("Profiles table does not exist, using mock data")

          // Mock data for demonstration
          const mockUsers = [
            {
              id: "1",
              email: "admin@tracklify.com",
              full_name: "Admin User",
              role: "admin",
              risk_score: 10,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_active: new Date().toISOString(),
            },
            {
              id: "2",
              email: "manager@tracklify.com",
              full_name: "Manager User",
              role: "manager",
              risk_score: 35,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_active: new Date().toISOString(),
            },
            {
              id: "3",
              email: "user@tracklify.com",
              full_name: "Regular User",
              role: "user",
              risk_score: 75,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              last_active: null,
            },
          ]

          setUsers(mockUsers)
          setLoading(false)
          return
        }

        // If the table exists, fetch real data
        const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching users:", error)
          toast({
            title: "Error",
            description: "Failed to fetch users. Please try again later.",
            variant: "destructive",
          })
          return
        }

        if (data) {
          // Fetch last activity for each user
          const usersWithActivity = await Promise.all(
            data.map(async (user) => {
              try {
                const { data: logs } = await supabase
                  .from("keystroke_logs")
                  .select("timestamp")
                  .eq("user_id", user.id)
                  .order("timestamp", { ascending: false })
                  .limit(1)

                return {
                  ...user,
                  last_active: logs && logs.length > 0 ? logs[0].timestamp : null,
                }
              } catch (err) {
                console.error("Error fetching user activity:", err)
                return {
                  ...user,
                  last_active: null,
                }
              }
            }),
          )

          setUsers(usersWithActivity)
        }
      } catch (error) {
        console.error("Error in users fetch:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while fetching users.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [supabase, toast])

  // Handle role change
  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      // Check if we're using mock data
      if (users.some((user) => user.id === "1" && user.email === "admin@tracklify.com")) {
        // For mock data, just update the local state
        setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

        toast({
          title: "Role Updated",
          description: "User role has been updated successfully (mock data).",
        })
        return
      }

      const { error } = await supabase.from("profiles").update({ role: newRole }).eq("id", userId)

      if (error) {
        console.error("Error updating user role:", error)
        toast({
          title: "Error",
          description: "Failed to update user role.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))

      toast({
        title: "Role Updated",
        description: "User role has been updated successfully.",
      })
    } catch (error) {
      console.error("Error in role change:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Handle user deletion
  const handleDeleteUser = async (userId: string) => {
    try {
      // Check if we're using mock data
      if (users.some((user) => user.id === "1" && user.email === "admin@tracklify.com")) {
        // For mock data, just update the local state
        setUsers((prev) => prev.filter((user) => user.id !== userId))

        toast({
          title: "User Deleted",
          description: "User has been deleted successfully (mock data).",
        })
        return
      }

      // In a real app, you would need admin privileges to delete users
      const { error } = await supabase.auth.admin.deleteUser(userId)

      if (error) {
        console.error("Error deleting user:", error)
        toast({
          title: "Error",
          description: "Failed to delete user. Admin privileges required.",
          variant: "destructive",
        })
        return
      }

      // Update local state
      setUsers((prev) => prev.filter((user) => user.id !== userId))

      toast({
        title: "User Deleted",
        description: "User has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error in user deletion:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred.",
        variant: "destructive",
      })
    }
  }

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase())

    const matchesRole = roleFilter === "all" || user.role === roleFilter

    return matchesSearch && matchesRole
  })

  // Get risk level badge
  const getRiskBadge = (score: number) => {
    if (score >= 70) {
      return <Badge variant="destructive">High</Badge>
    } else if (score >= 30) {
      return <Badge variant="outline">Medium</Badge>
    } else {
      return <Badge variant="secondary">Low</Badge>
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="sm:max-w-xs">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="manager">Manager</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Risk Score</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px]" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-[120px]" />
                  </TableCell>
                </TableRow>
              ))
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={`https://avatar.vercel.sh/${user.id}`} />
                        <AvatarFallback>
                          {(user.full_name || user.email || "").substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.full_name || "Unnamed User"}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select defaultValue={user.role} onValueChange={(value) => handleRoleChange(user.id, value)}>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="user">User</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>{getRiskBadge(user.risk_score)}</TableCell>
                  <TableCell>
                    {user.last_active ? (
                      new Date(user.last_active).toLocaleString()
                    ) : (
                      <span className="text-muted-foreground">Never</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedUser(user)
                          setIsProfileOpen(true)
                        }}
                      >
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">View Profile</span>
                      </Button>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                            <span className="sr-only">Delete User</span>
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete User</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this user? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDeleteUser(user.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* User Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Detailed information and activity for this user.</DialogDescription>
          </DialogHeader>
          {selectedUser && <UserProfile user={selectedUser} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}
