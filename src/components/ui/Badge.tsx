import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Badge({ 
  className, 
  variant = 'default', 
  size = 'md',
  children, 
  ...props 
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        {
          // Variants
          'bg-neutral-100 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200': variant === 'default',
          'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400': variant === 'success',
          'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400': variant === 'warning',
          'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400': variant === 'danger',
          'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400': variant === 'info',
          // Sizes
          'px-2 py-1 text-xs': size === 'sm',
          'px-3 py-1 text-sm': size === 'md',
          'px-4 py-2 text-base': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}