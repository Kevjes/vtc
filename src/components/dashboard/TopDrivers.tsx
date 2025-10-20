import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge } from '@/components/ui'
import { StarIcon } from '@heroicons/react/24/solid'
import { driversService } from '@/services/drivers'
import { ApiDriver } from '@/types'

interface TopDriver {
  id: string
  name: string
  avatar?: string
  rating: number
  totalRides: number
  partner: string
}

export function TopDrivers() {
  const [topDrivers, setTopDrivers] = useState<TopDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTopDrivers = async () => {
      try {
        setIsLoading(true)
        const response = await driversService.getDrivers({ page: 1, size: 50 })

        // Filtrer et trier les chauffeurs par note
        const driversWithRating = response.content
          .filter(driver => driver.rating && driver.rating > 0)
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
          .slice(0, 4) // Top 4

        const topDriversData = driversWithRating.map(driver => ({
          id: driver.uuid,
          name: `${driver.user.firstname} ${driver.user.lastname}`,
          avatar: driver.user.profileImage,
          rating: driver.rating || 0,
          totalRides: driver.totalRides || 0,
          partner: driver.partnerName || 'Indépendant'
        }))

        setTopDrivers(topDriversData)
      } catch (error) {
        console.error('Erreur lors du chargement des top chauffeurs:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTopDrivers()
  }, [])
  return (
    <Card>
      <CardHeader>
        <CardTitle>Meilleurs chauffeurs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center space-x-3 animate-pulse">
                <div className="h-10 w-10 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : topDrivers.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            Aucun chauffeur avec note disponible
          </div>
        ) : (
          topDrivers.map((driver, index) => (
          <div key={driver.id} className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="relative">
                <Avatar 
                  fallback={driver.name.split(' ').map(n => n[0]).join('')}
                  size="md"
                />
                {index < 3 && (
                  <div className={`absolute -top-1 -right-1 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 'bg-orange-600'
                  }`}>
                    {index + 1}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {driver.name}
                </p>
                <div className="flex items-center space-x-1">
                  <StarIcon className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {driver.rating}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {driver.partner}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400">
                  {driver.totalRides} courses
                </p>
              </div>
            </div>
          </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}