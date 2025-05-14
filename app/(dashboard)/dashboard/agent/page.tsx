import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Terminal, CheckCircle, AlertCircle } from "lucide-react"
import { Steps, Step } from "@/components/ui/steps"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AgentPage() {
  const supabase = createClient()

  // Check if user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If no user, redirect to login
  if (!user) {
    redirect("/login")
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tracklify Agent</h1>
        <p className="text-muted-foreground">Download and install the Tracklify agent to monitor system activity</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Agent Download</CardTitle>
            <CardDescription>Download the Tracklify agent for your operating system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Latest version: 1.0.0</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Lightweight and secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Real-time monitoring</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <span>Requires admin privileges to install</span>
              </div>
            </div>
            <Button asChild className="w-full mt-4">
              <Link href="/agent/tracklify-agent.zip">
                <Download className="mr-2 h-4 w-4" />
                Download Agent
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Installation Status</CardTitle>
            <CardDescription>Check if the agent is installed and running</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <span>Agent not installed</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Download and install the agent to start monitoring your system
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Installation Instructions</CardTitle>
          <CardDescription>Follow these steps to install the Tracklify agent</CardDescription>
        </CardHeader>
        <CardContent>
          <Steps>
            <Step>
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                <span className="font-medium">Download the agent</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Click the download button above to get the latest version of the Tracklify agent
              </p>
            </Step>
            <Step>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <span className="font-medium">Unzip the file</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Extract the contents of the zip file to a location of your choice
              </p>
            </Step>
            <Step>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <span className="font-medium">Run the installer with admin privileges</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Right-click on the installer and select "Run as administrator"
              </p>
            </Step>
            <Step>
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5" />
                <span className="font-medium">Log in using your Tracklify credentials</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Enter the same email and password you use to log in to Tracklify
              </p>
            </Step>
            <Step>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">The agent will run in the background and sync data</span>
              </div>
              <p className="text-sm text-muted-foreground">You can check the status of the agent on this page</p>
            </Step>
          </Steps>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Troubleshooting</CardTitle>
          <CardDescription>Common issues and solutions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-medium">Agent not connecting</h3>
            <p className="text-sm text-muted-foreground">
              Make sure you're using the correct credentials and that your internet connection is stable
            </p>
          </div>
          <div>
            <h3 className="font-medium">Installation fails</h3>
            <p className="text-sm text-muted-foreground">
              Ensure you're running the installer with administrator privileges
            </p>
          </div>
          <div>
            <h3 className="font-medium">Agent not showing as installed</h3>
            <p className="text-sm text-muted-foreground">Try refreshing this page or restarting the agent service</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
