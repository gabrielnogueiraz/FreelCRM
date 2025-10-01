'use client'

import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  className?: string
  variant?: 'default' | 'card' | 'text' | 'avatar' | 'button'
  lines?: number
}

export function LoadingSkeleton({ 
  className, 
  variant = 'default',
  lines = 1 
}: LoadingSkeletonProps) {
  const baseClasses = 'animate-pulse bg-muted rounded'
  
  const variants = {
    default: 'h-4 w-full',
    card: 'h-32 w-full',
    text: 'h-4 w-3/4',
    avatar: 'h-12 w-12 rounded-full',
    button: 'h-10 w-24'
  }

  if (variant === 'text' && lines > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              variants[variant],
              i === lines - 1 && 'w-1/2', // Last line is shorter
              className
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div
      className={cn(
        baseClasses,
        variants[variant],
        className
      )}
    />
  )
}

// Pre-built skeleton components for common use cases
export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
      <div className="flex items-center gap-3">
        <LoadingSkeleton variant="avatar" />
        <div className="space-y-2 flex-1">
          <LoadingSkeleton variant="text" />
          <LoadingSkeleton variant="text" lines={1} className="w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <LoadingSkeleton variant="text" />
        <LoadingSkeleton variant="text" className="w-2/3" />
      </div>
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 rounded-lg border border-border">
          <LoadingSkeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <LoadingSkeleton variant="text" />
            <LoadingSkeleton variant="text" className="w-1/2" />
          </div>
          <LoadingSkeleton variant="button" />
        </div>
      ))}
    </div>
  )
}

export function StatsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-border bg-elevated p-6 space-y-4">
          <div className="flex items-center justify-between">
            <LoadingSkeleton variant="text" className="w-24" />
            <LoadingSkeleton variant="avatar" />
          </div>
          <div className="space-y-2">
            <LoadingSkeleton variant="text" className="h-8 w-16" />
            <LoadingSkeleton variant="text" className="w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}
