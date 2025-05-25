"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, Cpu, ShieldCheck, Download, RefreshCcw, LayoutDashboard } from "lucide-react"
import { motion } from "framer-motion"

const features = [
  {
    title: "Real-Time Monitoring",
    description: "View live logs from connected devices, including keystrokes and activity events.",
    icon: Activity,
  },
  {
    title: "Lightweight Agent",
    description: "A silent background process that runs on startup, capturing full device-level activity.",
    icon: Cpu,
  },
  {
    title: "Secure & Private",
    description: "Each user's data is completely isolated and protected with Supabase-level RLS policies.",
    icon: ShieldCheck,
  },
  {
    title: "Easy Installation",
    description: "Distribute a one-click installer for quick setup across faculty or student devices.",
    icon: Download,
  },
  {
    title: "Realtime Sync",
    description: "Log entries appear instantly on the dashboard using Supabase Realtime.",
    icon: RefreshCcw,
  },
  {
    title: "Responsive Dashboard",
    description: "Clean, modern UI with adaptive views and fast interactions built using Shadcn UI.",
    icon: LayoutDashboard,
  },
]

export function FeaturesSection() {
  return (
    <section className="py-16 px-4 md:px-8 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need for comprehensive system monitoring and surveillance
          </p>
        </motion.div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300 border-2 hover:border-primary/20">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                    <feature.icon className="h-8 w-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
