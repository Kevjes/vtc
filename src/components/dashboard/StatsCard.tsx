import React from 'react'
import { Card, CardContent } from '@/components/ui'
import { cn } from '@/lib/utils'
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  title: string
  value: string | number
  change?: {
    value: number
    type: 'increase' | 'decrease'
  }
  icon: React.ReactNode
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
}

export function StatsCard({
  title,
  value,
  change,
  icon,
  color = 'blue'
}: StatsCardProps) {
  const colorClasses = {
    blue: {
      gradient: 'from-blue-500 to-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950/30',
      text: 'text-blue-600 dark:text-blue-400',
      icon: 'text-white'
    },
    green: {
      gradient: 'from-green-500 to-green-600',
      bg: 'bg-green-50 dark:bg-green-950/30',
      text: 'text-green-600 dark:text-green-400',
      icon: 'text-white'
    },
    yellow: {
      gradient: 'from-yellow-500 to-yellow-600',
      bg: 'bg-yellow-50 dark:bg-yellow-950/30',
      text: 'text-yellow-600 dark:text-yellow-400',
      icon: 'text-white'
    },
    red: {
      gradient: 'from-red-500 to-red-600',
      bg: 'bg-red-50 dark:bg-red-950/30',
      text: 'text-red-600 dark:text-red-400',
      icon: 'text-white'
    },
    purple: {
      gradient: 'from-purple-500 to-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-950/30',
      text: 'text-purple-600 dark:text-purple-400',
      icon: 'text-white'
    }
  }

  const colorConfig = colorClasses[color]

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-lg border-0", colorConfig.bg)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400 uppercase tracking-wide">
                {title}
              </p>
              <div
                className={cn(
                  'h-12 w-12 rounded-full bg-gradient-to-br flex items-center justify-center shadow-lg',
                  colorConfig.gradient
                )}
              >
                <div className={cn("h-6 w-6", colorConfig.icon)}>
                  {icon}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {value}
              </p>

              {change && change.value !== 0 && (
                <div className="flex items-center space-x-1">
                  <div
                    className={cn(
                      'flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium',
                      change.type === 'increase'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                    )}
                  >
                    {change.type === 'increase' ? (
                      <ArrowTrendingUpIcon className="h-3 w-3" />
                    ) : (
                      <ArrowTrendingDownIcon className="h-3 w-3" />
                    )}
                    <span>
                      {change.type === 'increase' ? '+' : '-'}{Math.abs(change.value)}%
                    </span>
                  </div>
                  <span className="text-xs text-neutral-500 dark:text-neutral-400">
                    vs mois dernier
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}