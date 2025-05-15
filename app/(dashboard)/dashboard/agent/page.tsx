import type { Metadata } from "next"
import Link from "next/link"
import { Download, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Steps } from "@/components/ui/steps"

export const metadata: Metadata = {
  title: "Agent Download | Tracklify",
  description: "Download and install the Tracklify monitoring agent",
}

export default function AgentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Agent Download</h1>
        <p className="text-muted-foreground">Download and install the Tracklify monitoring agent on your devices</p>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          The Tracklify agent must be installed on each device you want to monitor. Follow the instructions below for
          your operating system.
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="windows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="windows">Windows</TabsTrigger>
          <TabsTrigger value="macos">macOS</TabsTrigger>
          <TabsTrigger value="linux">Linux</TabsTrigger>
        </TabsList>

        <TabsContent value="windows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Windows Installation</CardTitle>
              <CardDescription>Follow these steps to install the Tracklify agent on Windows</CardDescription>
            </CardHeader>
            <CardContent>
              <Steps
                steps={[
                  {
                    title: "Download the agent",
                    description: "Click the download button below to get the agent installer.",
                  },
                  {
                    title: "Run the installer",
                    description: "Right-click the downloaded file and select 'Run as administrator'.",
                  },
                  {
                    title: "Allow permissions",
                    description: "Accept any security prompts that appear during installation.",
                  },
                  {
                    title: "Verify installation",
                    description: "Check the dashboard to confirm the agent is connected and sending logs.",
                  },
                ]}
              />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/agent/tracklify_agent.py" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Windows Agent
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Silent Installation</CardTitle>
              <CardDescription>For deploying to multiple machines or automated installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Use the following command to install the agent silently:</p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>python -m pip install pynput requests && python tracklify_agent.py</code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="macos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>macOS Installation</CardTitle>
              <CardDescription>Follow these steps to install the Tracklify agent on macOS</CardDescription>
            </CardHeader>
            <CardContent>
              <Steps
                steps={[
                  {
                    title: "Download the agent",
                    description: "Click the download button below to get the agent script.",
                  },
                  {
                    title: "Open Terminal",
                    description: "Open Terminal from Applications > Utilities.",
                  },
                  {
                    title: "Navigate to downloads",
                    description: "Type 'cd Downloads' and press Enter.",
                  },
                  {
                    title: "Make executable",
                    description: "Run 'chmod +x tracklify_agent.py'.",
                  },
                  {
                    title: "Run the agent",
                    description: "Execute './tracklify_agent.py' to start monitoring.",
                  },
                ]}
              />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/agent/tracklify_agent.py" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download macOS Agent
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminal Installation</CardTitle>
              <CardDescription>For advanced users or automated installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Use the following commands to install and run the agent:</p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>
                    {`curl -O https://your-domain.com/agent/tracklify_agent.py
chmod +x tracklify_agent.py
./tracklify_agent.py`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="linux" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Linux Installation</CardTitle>
              <CardDescription>Follow these steps to install the Tracklify agent on Linux</CardDescription>
            </CardHeader>
            <CardContent>
              <Steps
                steps={[
                  {
                    title: "Download the agent",
                    description: "Click the download button below to get the agent script.",
                  },
                  {
                    title: "Open Terminal",
                    description: "Open your terminal application.",
                  },
                  {
                    title: "Navigate to downloads",
                    description: "Type 'cd Downloads' and press Enter.",
                  },
                  {
                    title: "Make executable",
                    description: "Run 'chmod +x tracklify_agent.py'.",
                  },
                  {
                    title: "Install dependencies",
                    description: "Run 'pip install pynput requests'.",
                  },
                  {
                    title: "Run the agent",
                    description: "Execute './tracklify_agent.py' to start monitoring.",
                  },
                ]}
              />
            </CardContent>
            <CardFooter>
              <Button asChild>
                <Link href="/agent/tracklify_agent.py" download>
                  <Download className="mr-2 h-4 w-4" />
                  Download Linux Agent
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Headless Installation</CardTitle>
              <CardDescription>For servers or automated installation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>Use the following commands to install and run the agent:</p>
                <pre className="bg-muted p-4 rounded-md overflow-x-auto">
                  <code>
                    {`wget https://your-domain.com/agent/tracklify_agent.py
chmod +x tracklify_agent.py
pip install pynput requests
nohup ./tracklify_agent.py > tracklify.log 2>&1 &`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
