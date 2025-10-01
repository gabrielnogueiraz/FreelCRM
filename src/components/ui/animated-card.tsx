'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface AnimatedCardProps {
  children: ReactNode
  className?: string
  delay?: number
  duration?: number
  direction?: 'up' | 'down' | 'left' | 'right'
  scale?: boolean
}

export function AnimatedCard({ 
  children, 
  className, 
  delay = 0, 
  duration = 0.3,
  direction = 'up',
  scale = false
}: AnimatedCardProps) {
  const directionVariants = {
    up: { y: 20, opacity: 0 },
    down: { y: -20, opacity: 0 },
    left: { x: 20, opacity: 0 },
    right: { x: -20, opacity: 0 },
  }

  const initial = directionVariants[direction]
  const animate = { 
    y: 0, 
    x: 0, 
    opacity: 1,
    scale: scale ? [0.95, 1] : 1
  }

  return (
    <motion.div
      initial={initial}
      animate={animate}
      transition={{
        duration,
        delay,
        ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth feel
      }}
      whileHover={scale ? { scale: 1.02 } : {}}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}