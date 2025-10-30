'use client'

import React, { useState, useEffect } from 'react'
import {
  UsersIcon,
  UserGroupIcon,
  StarIcon,
  DocumentCheckIcon,
  ChartBarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { StatsCard, RecentActivity, TopDrivers } from '@/components/dashboard'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { driversService } from '@/services/drivers'
import { partnersService } from '@/services/partners'
import { useAuth } from '@/contexts/AuthContext'
import { usePermissions } from '@/hooks/usePermissions'

interface DashboardStats {
  totalDrivers: number
  activeDrivers: number
  totalPartners: number
  averageRating: number
  totalEvaluations: number
  pendingDocuments: number
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllAccess } = usePermissions()
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    activeDrivers: 0,
    totalPartners: 0,
    averageRating: 0,
    totalEvaluations: 0,
    pendingDocuments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  // Check permissions for viewing different stats
  const canViewDriverStats = hasAllAccess() || hasAnyPermission([
    'CAN_READ_ANY_DRIVER',
    'CAN_READ_DRIVER'
  ])
  const canViewPartnerStats = hasAllAccess() || hasAnyPermission([
    'CAN_READ_ANY_PARTNER',
    'CAN_READ_PARTNER'
  ])

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true)

        let totalDrivers = 0
        let activeDrivers = 0
        let totalPartners = 0
        let averageRating = 0
        let totalEvaluations = 0

        // Charger les chauffeurs (seulement si l'utilisateur a la permission)
        if (canViewDriverStats) {
          const driversResponse = await driversService.getDrivers({ page: 1, size: 1000 })
          totalDrivers = driversResponse.totalElements
          activeDrivers = driversResponse.content.filter(driver => driver.user.active).length

          // Calculer la note moyenne
          const driversWithRating = driversResponse.content.filter(driver => driver.rating && driver.rating > 0)
          averageRating = driversWithRating.length > 0
            ? driversWithRating.reduce((sum, driver) => sum + (driver.rating || 0), 0) / driversWithRating.length
            : 0

          // Compter les évaluations
          totalEvaluations = driversResponse.content.reduce((sum, driver) => sum + (driver.evaluations?.length || 0), 0)
        }

        // Charger les partenaires (seulement si l'utilisateur a la permission)
        if (canViewPartnerStats) {
          const partnersResponse = await partnersService.getPartners({ page: 1, size: 1000 })
          totalPartners = partnersResponse.totalElements
        }

        // Compter les documents en attente (simulé pour l'instant)
        const pendingDocuments = 0 // TODO: Implémenter quand l'API documents sera disponible

        setStats({
          totalDrivers,
          activeDrivers,
          totalPartners,
          averageRating,
          totalEvaluations,
          pendingDocuments
        })
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardStats()
  }, [canViewDriverStats, canViewPartnerStats])

  // Build stats cards based on permissions
  const allStatsCards = [
    canViewDriverStats && {
      title: 'Total Chauffeurs',
      value: isLoading ? '...' : stats.totalDrivers,
      change: { value: 0, type: 'increase' as const },
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'blue' as const,
    },
    canViewDriverStats && {
      title: 'Chauffeurs Actifs',
      value: isLoading ? '...' : stats.activeDrivers,
      change: { value: 0, type: 'increase' as const },
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'green' as const,
    },
    canViewPartnerStats && {
      title: 'Partenaires',
      value: isLoading ? '...' : stats.totalPartners,
      change: { value: 0, type: 'increase' as const },
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: 'purple' as const,
    },
    canViewDriverStats && {
      title: 'Note Moyenne',
      value: isLoading ? '...' : stats.averageRating.toFixed(1),
      change: { value: 0, type: 'increase' as const },
      icon: <StarIcon className="h-6 w-6" />,
      color: 'yellow' as const,
    },
    canViewDriverStats && {
      title: 'Évaluations',
      value: isLoading ? '...' : stats.totalEvaluations,
      change: { value: 0, type: 'increase' as const },
      icon: <DocumentCheckIcon className="h-6 w-6" />,
      color: 'blue' as const,
    },
    canViewDriverStats && {
      title: 'Documents En Attente',
      value: isLoading ? '...' : stats.pendingDocuments,
      change: { value: 0, type: 'decrease' as const },
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      color: 'red' as const,
    },
  ].filter(Boolean) // Remove null/false entries

  const statsCards = allStatsCards as Array<{
    title: string
    value: string | number
    change: { value: number; type: 'increase' | 'decrease' }
    icon: JSX.Element
    color: 'blue' | 'green' | 'purple' | 'yellow' | 'red'
  }>

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              {user ? `Bienvenue, ${user.firstname} ${user.lastname}` : 'Vue d\'ensemble de votre plateforme VTC'}
            </p>
          </div>

          {/* Stats Grid */}
          {statsCards.length > 0 ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {statsCards.map((stat, index) => (
                <StatsCard
                  key={index}
                  title={stat.title}
                  value={stat.value}
                  change={stat.change}
                  icon={stat.icon}
                  color={stat.color}
                />
              ))}
            </div>
          ) : (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 dark:text-blue-100 mb-2">
                Bienvenue sur votre tableau de bord!
              </h3>
              <p className="text-blue-700 dark:text-blue-300">
                Utilisez la navigation pour accéder aux différentes sections de l'application.
              </p>
            </div>
          )}

          {/* Charts and Activity */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivity />
            </div>
            <div>
              <TopDrivers />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}