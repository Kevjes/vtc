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

interface DashboardStats {
  totalDrivers: number
  activeDrivers: number
  totalPartners: number
  averageRating: number
  totalEvaluations: number
  pendingDocuments: number
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalDrivers: 0,
    activeDrivers: 0,
    totalPartners: 0,
    averageRating: 0,
    totalEvaluations: 0,
    pendingDocuments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadDashboardStats = async () => {
      try {
        setIsLoading(true)

        // Charger les chauffeurs
        const driversResponse = await driversService.getDrivers({ page: 1, size: 1000 })
        const totalDrivers = driversResponse.totalElements
        const activeDrivers = driversResponse.content.filter(driver => driver.user.active).length

        // Charger les partenaires
        const partnersResponse = await partnersService.getPartners({ page: 1, size: 1000 })
        const totalPartners = partnersResponse.totalElements

        // Calculer la note moyenne
        const driversWithRating = driversResponse.content.filter(driver => driver.rating && driver.rating > 0)
        const averageRating = driversWithRating.length > 0
          ? driversWithRating.reduce((sum, driver) => sum + (driver.rating || 0), 0) / driversWithRating.length
          : 0

        // Compter les évaluations (simulé pour l'instant)
        const totalEvaluations = driversResponse.content.reduce((sum, driver) => sum + (driver.evaluations?.length || 0), 0)

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
  }, [])

  const statsCards = [
    {
      title: 'Total Chauffeurs',
      value: isLoading ? '...' : stats.totalDrivers,
      change: { value: 0, type: 'increase' as const },
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Chauffeurs Actifs',
      value: isLoading ? '...' : stats.activeDrivers,
      change: { value: 0, type: 'increase' as const },
      icon: <UsersIcon className="h-6 w-6" />,
      color: 'green' as const,
    },
    {
      title: 'Partenaires',
      value: isLoading ? '...' : stats.totalPartners,
      change: { value: 0, type: 'increase' as const },
      icon: <UserGroupIcon className="h-6 w-6" />,
      color: 'purple' as const,
    },
    {
      title: 'Note Moyenne',
      value: isLoading ? '...' : stats.averageRating.toFixed(1),
      change: { value: 0, type: 'increase' as const },
      icon: <StarIcon className="h-6 w-6" />,
      color: 'yellow' as const,
    },
    {
      title: 'Évaluations',
      value: isLoading ? '...' : stats.totalEvaluations,
      change: { value: 0, type: 'increase' as const },
      icon: <DocumentCheckIcon className="h-6 w-6" />,
      color: 'blue' as const,
    },
    {
      title: 'Documents En Attente',
      value: isLoading ? '...' : stats.pendingDocuments,
      change: { value: 0, type: 'decrease' as const },
      icon: <ExclamationTriangleIcon className="h-6 w-6" />,
      color: 'red' as const,
    },
  ]

  return (
    <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Dashboard
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Vue d'ensemble de votre plateforme VTC
            </p>
          </div>

          {/* Stats Grid */}
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