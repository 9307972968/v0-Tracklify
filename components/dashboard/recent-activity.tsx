"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const activities = [
  {
    id: "1",
    user: {
      name: "John Doe",
      email: "john@example.com",
      image: "/placeholder.svg?height=32&width=32",
    },
    app: "Microsoft Word",
    action: "Document editing",
    time: "2 minutes ago",
  },
  {
    id: "2",
    user: {
      name: "Jane Smith",
      email: "jane@example.com",
      image: "/placeholder.svg?height=32&width=32",
    },
    app: "Google Chrome",
    action: "Web browsing",
    time: "5 minutes ago",
  },
  {
    id: "3",
    user: {
      name: "Robert Johnson",
      email: "robert@example.com",
      image: "/placeholder.svg?height=32&width=32",
    },
    app: "Slack",
    action: "Messaging",
    time: "10 minutes ago",
  },
  {
    id: "4",
    user: {
      name: "Emily Davis",
      email: "emily@example.com",
      image: "/placeholder.svg?height=32&width=32",
    },
    app: "Visual Studio Code",
    action: "Code editing",
    time: "15 minutes ago",
  },
  {
    id: "5",
    user: {
      name: "Michael Wilson",
      email: "michael@example.com",
      image: "/placeholder.svg?height=32&width=32",
    },
    app: "Outlook",
    action: "Email",
    time: "20 minutes ago",
  },
]

export function RecentActivity() {
  return (
    <div className="space-y-8">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src={activity.user.image || "/placeholder.svg"} alt={activity.user.name} />
            <AvatarFallback>
              {activity.user.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{activity.user.name}</p>
            <p className="text-sm text-muted-foreground">
              {activity.app} - {activity.action}
            </p>
          </div>
          <div className="ml-auto text-sm text-muted-foreground">{activity.time}</div>
        </div>
      ))}
    </div>
  )
}
