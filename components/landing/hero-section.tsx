"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Shield, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function HeroSection() {
  const [text, setText] = useState("")
  const fullText = "System Surveillance. Reimagined."

  useEffect(() => {
    let i = 0
    const timer = setInterval(() => {
      setText(fullText.slice(0, i))
      i++
      if (i > fullText.length) {
        clearInterval(timer)
      }
    }, 50)

    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative w-full py-24 md:py-32 lg:py-40 overflow-hidden">
      {/* Background shimmer effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-y-12 animate-pulse" />

      <div className="container px-4 md:px-6 relative z-10">
        <motion.div
          className="flex flex-col items-center space-y-8 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="flex items-center gap-3 mb-4"
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Shield className="h-12 w-12 text-primary" />
            <span className="text-4xl md:text-5xl font-bold">Tracklify</span>
          </motion.div>

          <div className="space-y-4">
            <motion.h1
              className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Real-time System
              <br />
              <span className="text-primary">Monitoring</span>
            </motion.h1>

            <motion.div
              className="h-8 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <p className="mx-auto max-w-[700px] text-xl md:text-2xl text-muted-foreground">
                {text}
                <span className="animate-pulse">|</span>
              </p>
            </motion.div>
          </div>

          <motion.div
            className="space-x-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Link href="/signup" passHref>
              <Button size="lg" className="group">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button variant="outline" size="lg">
                Sign In
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
