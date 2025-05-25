"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Shield } from "lucide-react"
import { motion } from "framer-motion"

export function CTASection() {
  return (
    <section className="py-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">Ready to monitor like a pro?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Deploy on unlimited devices. All your logs in one place.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <Link href="/signup" passHref>
              <Button size="lg" className="group text-lg px-8 py-6">
                <Shield className="mr-2 h-5 w-5" />
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Sign In
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="text-sm text-muted-foreground"
          >
            No credit card required • Free to start • Enterprise ready
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
