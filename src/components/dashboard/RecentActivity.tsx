import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge } from '@/components/ui'
import { driversService } from '@/services/drivers'
import { partnersService } from '@/services/partners'

interface ActivityItem {
  id: string
  type: 'driver_added' | 'evaluation' | 'document_submitted' | 'warning_issued'
  user: {
    name: string
    avatar?: string
  }
  description: string
  time: string
  status?: 'success' | 'warning' | 'danger'
}

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'driver_added':
      return '👤'
    case 'evaluation':
      return '⭐'
    case 'document_submitted':
      return '📄'
    case 'warning_issued':
      return '⚠️'
    default:
      return '📝'
  }
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadRecentActivity = async () => {
      try {
        setIsLoading(true)

        // Récupérer les derniers chauffeurs ajoutés
        const driversResponse = await driversService.getDrivers({ page: 1, size: 10 })
        const recentDrivers = driversResponse.content
          .sort((a, b) => new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime())
          .slice(0, 3)

        const driverActivities: ActivityItem[] = recentDrivers.map(driver => ({
          id: driver.uuid,
          type: 'driver_added' as const,
          user: {
            name: `${driver.user.firstname} ${driver.user.lastname}`,
            avatar: driver.user.profileImage
          },
          description: `Nouveau chauffeur ajouté${driver.partnerName ? ` par ${driver.partnerName}` : ''}`,
          time: `Créé le ${new Date(driver.createdDate).toLocaleDateString('fr-FR')}`,
          status: 'success' as const
        }))

        setActivities(driverActivities)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'activité récente:', error)
        setActivities([])
      } finally {
        setIsLoading(false)
      }
    }

    loadRecentActivity()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activité récente</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-start space-x-3 animate-pulse">
                <div className="h-8 w-8 bg-neutral-200 dark:bg-neutral-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-neutral-200 dark:bg-neutral-700 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-neutral-200 dark:bg-neutral-700 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
            Aucune activité récente
          </div>
        ) : (
          activities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center text-sm">
                  {getActivityIcon(activity.type)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {activity.user.name}
                  </p>
                  {activity.status && (
                    <Badge
                      variant={activity.status}
                      size="sm"
                    >
                      {activity.status === 'success' && 'Succès'}
                      {activity.status === 'warning' && 'Attention'}
                      {activity.status === 'danger' && 'Urgent'}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  {activity.description}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                  {activity.time}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}