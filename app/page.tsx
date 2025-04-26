"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, CheckCircle, Shield, Clock } from "lucide-react"
import { motion } from "framer-motion"

const MotionDiv = motion.div

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Navigation */}
      <header className="border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6" />
            <span className="text-xl font-bold">Tracklify</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:text-highlight transition-colors">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-highlight transition-colors">
              How It Works
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:text-highlight transition-colors">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Secure System Surveillance for Modern Organizations
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Real-time Insight. Total Control. Ethically Engineered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="gap-2">
                  Get Started <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="lg" variant="outline">
                  Learn More
                </Button>
              </Link>
            </div>
          </MotionDiv>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Live Tracking",
                description: "Monitor keystrokes and user activity in real-time with secure, encrypted logging.",
                icon: Clock,
              },
              {
                title: "AI Detection",
                description: "Advanced machine learning algorithms to detect anomalies and potential security threats.",
                icon: Shield,
              },
              {
                title: "Compliance",
                description: "GDPR-compliant monitoring with consent management and data retention controls.",
                icon: CheckCircle,
              },
            ].map((feature, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-6 shadow-md"
              >
                <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Install & Configure",
                description: "Deploy our lightweight agent across your organization's devices.",
              },
              {
                step: "2",
                title: "Monitor & Analyze",
                description: "Track user activity and analyze patterns in real-time.",
              },
              {
                step: "3",
                title: "Detect & Respond",
                description: "Receive alerts for suspicious behavior and take immediate action.",
              },
            ].map((step, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="bg-secondary rounded-2xl p-6 h-full">
                  <div className="absolute -top-4 -left-4 h-10 w-10 rounded-full bg-foreground text-background flex items-center justify-center font-bold">
                    {step.step}
                  </div>
                  <h3 className="text-xl font-bold mb-2 mt-4">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-secondary">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Security Professionals</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote:
                  "Tracklify has transformed how we monitor and secure our internal systems. The real-time alerts have helped us prevent several potential data breaches.",
                author: "Sarah Johnson",
                role: "CISO, Enterprise Solutions Inc.",
              },
              {
                quote:
                  "The compliance features in Tracklify make it easy to maintain ethical monitoring practices while still getting the security insights we need.",
                author: "Michael Chen",
                role: "Security Director, TechCorp",
              },
            ].map((testimonial, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-2xl p-6 shadow-md"
              >
                <p className="italic mb-4">"{testimonial.quote}"</p>
                <div>
                  <p className="font-bold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to secure your organization?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join hundreds of companies using Tracklify for ethical system monitoring.
            </p>
            <Link href="/signup">
              <Button size="lg" className="gap-2">
                Get Started Today <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </MotionDiv>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-4 md:mb-0">
              <Shield className="w-5 h-5" />
              <span className="font-bold">Tracklify</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </Link>
            </div>
          </div>
          <div className="mt-8 text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Tracklify. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
