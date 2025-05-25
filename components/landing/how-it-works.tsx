"use client"

import { Card, CardContent } from "@/components/ui/card"
import { User, Terminal, Eye, Clock } from "lucide-react"
import { motion } from "framer-motion"

const steps = [
  {
    step: "01",
    title: "Sign Up & Log In",
    description: "Create your account and access your secure dashboard",
    icon: User,
  },
  {
    step: "02",
    title: "Install the Agent",
    description: "Download and install the lightweight monitoring agent on target devices",
    icon: Terminal,
  },
  {
    step: "03",
    title: "Let It Run",
    description: "The agent runs silently in the background, capturing all system activity",
    icon: Eye,
  },
  {
    step: "04",
    title: "Monitor in Real-Time",
    description: "View live logs and activity data from your centralized dashboard",
    icon: Clock,
  },
]

export function HowItWorksSection() {
  return (
    <section className="py-16 px-4 md:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started with Tracklify in just four simple steps
          </p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              <Card className="text-center h-full hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="mx-auto mb-4 p-4 bg-primary/10 rounded-full w-fit">
                      <step.icon className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-sm font-mono text-primary font-bold mb-2">{step.step}</div>
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-border" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
