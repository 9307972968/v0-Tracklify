"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Quote } from "lucide-react"
import { motion } from "framer-motion"

const testimonials = [
  {
    name: "Prof. A. Mehta",
    feedback: "Tracklify makes system monitoring effortless. The real-time dashboard is a game changer.",
    role: "HOD, ENTC Department",
    initials: "AM",
  },
  {
    name: "Shruti K.",
    feedback: "We used it during lab exams to monitor key activities. It worked flawlessly.",
    role: "Final Year ENTC Student",
    initials: "SK",
  },
  {
    name: "Rahul P.",
    feedback: "The setup took 2 minutes. Real-time sync was super smooth.",
    role: "Lab Technician",
    initials: "RP",
  },
]

export function TestimonialsSection() {
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
          <h2 className="text-3xl md:text-4xl font-bold mb-4">What People Say</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">Trusted by educators and IT professionals</p>
        </motion.div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
            >
              <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-primary mb-4" />
                  <blockquote className="text-lg mb-6 leading-relaxed">"{testimonial.feedback}"</blockquote>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
