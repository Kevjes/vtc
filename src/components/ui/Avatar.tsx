import React from 'react'
import { cn } from '@/lib/utils'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Avatar({ 
  className, 
  src, 
  alt, 
  fallback,
  size = 'md',
  ...props 
}: AvatarProps) {
  const initials = fallback || alt?.split(' ').map(n => n[0]).join('').toUpperCase() || '?'

  return (
    <div
      className={cn(
        'relative flex shrink-0 overflow-hidden rounded-full bg-gradient-to-br from-primary-400 to-primary-600',
        {
          'h-8 w-8': size === 'sm',
          'h-10 w-10': size === 'md',
          'h-12 w-12': size === 'lg',
          'h-16 w-16': size === 'xl',
        },
        className
      )}
      {...props}
    >
      {src ? (
        <img
          className="aspect-square h-full w-full object-cover"
          src={src}
          alt={alt}
        />
      ) : (
        <div className={cn(
          'flex h-full w-full items-center justify-center text-white font-medium',
          {
            'text-xs': size === 'sm',
            'text-sm': size === 'md',
            'text-base': size === 'lg',
            'text-lg': size === 'xl',
          }
        )}>
          {initials}
        </div>
      )}
    </div>
  )
}