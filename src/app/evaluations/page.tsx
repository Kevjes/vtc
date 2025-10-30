'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar, Select } from '@/components/ui'
import { evaluationsService, ApiEvaluation } from '@/services/evaluations'
import { evaluationStatsService, EvaluationStats } from '@/services/evaluationStats'
import { PaginatedResponse, EvaluationPermissions } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/templates.css'

// Types pour l'interface
interface EvaluationFilters {
  search: string
  status: 'all' | 'PENDING' | 'COMPLETED' | 'VALIDATED' | 'REJECTED'
  period: 'all' | 'week' | 'month' | 'quarter' | 'year'
}

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <StarIcon
      key={i}
      className={`h-4 w-4 ${
        i < Math.floor(rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
      }`}
    />
  ))
}

const getStatusBadge = (status: ApiEvaluation['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <Badge variant="success" size="sm">Terminée</Badge>
    case 'PENDING':
      return <Badge variant="warning" size="sm">En attente</Badge>
    case 'VALIDATED':
      return <Badge variant="success" size="sm">Validée</Badge>
    case 'REJECTED':
      return <Badge variant="danger" size="sm">Rejetée</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

const getStatusIcon = (status: ApiEvaluation['status']) => {
  switch (status) {
    case 'COMPLETED':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    case 'PENDING':
      return <ClockIcon className="h-5 w-5 text-yellow-500" />
    case 'VALIDATED':
      return <CheckCircleIcon className="h-5 w-5 text-blue-500" />
    case 'REJECTED':
      return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
    default:
      return <ClockIcon className="h-5 w-5 text-neutral-500" />
  }
}

export default function EvaluationsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllAccess } = usePermissions()

  // Permission checks
  const canViewEvaluations = hasAllAccess() || hasAnyPermission([
    EvaluationPermissions.READ_ANY_EVALUATION,
    EvaluationPermissions.READ_EVALUATION,
    EvaluationPermissions.READ_OWN_EVALUATION
  ])
  const canCreateEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.CREATE_EVALUATION)
  const canUpdateEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.UPDATE_EVALUATION)
  const canUpdateOwnEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.UPDATE_OWN_EVALUATION)
  const canDeleteEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.DELETE_EVALUATION)
  const canDeleteOwnEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.DELETE_OWN_EVALUATION)

  // Helper to check if evaluation belongs to current user
  const isOwnEvaluation = (evaluation: ApiEvaluation) => {
    // Une évaluation appartient à l'utilisateur si c'est lui le chauffeur évalué
    return user?.uuid === evaluation.driver?.user?.uuid
  }

  // Helper to check if user can update a specific evaluation
  const canUpdateThisEvaluation = (evaluation: ApiEvaluation) => {
    if (hasAllAccess() || canUpdateEvaluation) return true
    if (canUpdateOwnEvaluation && isOwnEvaluation(evaluation)) return true
    return false
  }

  // Helper to check if user can delete a specific evaluation
  const canDeleteThisEvaluation = (evaluation: ApiEvaluation) => {
    if (hasAllAccess() || canDeleteEvaluation) return true
    if (canDeleteOwnEvaluation && isOwnEvaluation(evaluation)) return true
    return false
  }

  // États pour les données
  const [evaluations, setEvaluations] = useState<PaginatedResponse<ApiEvaluation> | null>(null)
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // États pour les filtres
  const [filters, setFilters] = useState<EvaluationFilters>({
    search: '',
    status: 'all',
    period: 'all'
  })
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(0)
  const [size] = useState(10)

  // Charger les évaluations
  const loadEvaluations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = { page, size }

      // Construire le filtre
      let filterParts: string[] = []

      // If user only has READ_OWN_EVALUATION permission, filter by their UUID
      const hasReadAny = hasAllAccess() || hasPermission(EvaluationPermissions.READ_ANY_EVALUATION)
      const hasReadGeneral = hasAllAccess() || hasPermission(EvaluationPermissions.READ_EVALUATION)
      const hasReadOwn = hasPermission(EvaluationPermissions.READ_OWN_EVALUATION)

      if (!hasReadAny && !hasReadGeneral && hasReadOwn && user?.uuid) {
        // User can only see their own evaluations (as a driver)
        filterParts.push(`driver.user.uuid : '${user.uuid}'`)
      }

      if (filters.status !== 'all') {
        filterParts.push(`status='${filters.status}'`)
      }

      if (filters.period !== 'all') {
        const now = new Date()
        let startDate: Date

        switch (filters.period) {
          case 'week':
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            break
          case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1)
            break
          case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1)
            break
          case 'year':
            startDate = new Date(now.getFullYear(), 0, 1)
            break
          default:
            startDate = new Date(0)
        }

        filterParts.push(`evaluationDate >= '${startDate.toISOString().split('T')[0]}'`)
      }

      if (filters.search) {
        filterParts.push(`(driver.user.firstname LIKE '%${filters.search}%' OR driver.user.lastname LIKE '%${filters.search}%' OR partner.name LIKE '%${filters.search}%')`)
      }

      if (filterParts.length > 0) {
        params.filter = filterParts.join(' AND ')
      }

      const data = await evaluationsService.getEvaluations(params)
      setEvaluations(data)
      
      // Calculer les statistiques
      if (data.content.length > 0) {
        const calculatedStats = evaluationStatsService.calculateStats(data.content)
        setStats(calculatedStats)
      }
    } catch (err) {
      console.error('Erreur lors du chargement des évaluations:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au montage et lors des changements de filtres
  useEffect(() => {
    // Wait for user to be loaded before fetching evaluations
    if (user) {
      loadEvaluations()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.status, filters.period, user])

  // Recherche avec délai
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (filters.search !== '') {
        setPage(0)
        loadEvaluations()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search])

  const handleViewEvaluation = (evaluationId: string) => {
    router.push(`/evaluations/${evaluationId}`)
  }

  const handleEditEvaluation = (evaluationId: string) => {
    router.push(`/evaluations/${evaluationId}/edit`)
  }

  const handleFilterChange = (key: keyof EvaluationFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0)
  }

  // Check if user has permission to view this page
  if (!canViewEvaluations) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <div className="mb-4">
              <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder aux évaluations.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Permissions requises: CAN_READ_ANY_EVALUATION, CAN_READ_EVALUATION ou CAN_READ_OWN_EVALUATION
            </p>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Évaluations
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Suivez les évaluations des chauffeurs
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push('/evaluations/status')}
            >
              Gestion des statuts
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push('/evaluations/stats')}
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Statistiques
            </Button>
            {canCreateEvaluation && (
              <Button onClick={() => router.push('/evaluations/new')}>
                <PlusIcon className="h-4 w-4 mr-2" />
                Nouvelle évaluation
              </Button>
            )}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stats?.totalEvaluations || evaluations?.totalElements || 0}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Total évaluations
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stats?.completedEvaluations || 0}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Terminées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stats?.pendingEvaluations || 0}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    En attente
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <StarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="flex items-center space-x-1">
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {stats?.averageScore ? stats.averageScore.toFixed(1) : '0.0'}
                    </p>
                    <StarIcon className="h-4 w-4 text-yellow-500" />
                  </div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Note moyenne
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher par chauffeur, partenaire..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                  className="h-9"
                />
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  options={[
                    { value: 'all', label: 'Tous statuts' },
                    { value: 'PENDING', label: 'En attente' },
                    { value: 'COMPLETED', label: 'Terminées' },
                    { value: 'VALIDATED', label: 'Validées' },
                    { value: 'REJECTED', label: 'Rejetées' },
                  ]}
                  className="w-32 h-9 text-sm"
                />
                <Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  options={[
                    { value: 'all', label: 'Toute période' },
                    { value: 'week', label: '7 derniers jours' },
                    { value: 'month', label: 'Ce mois' },
                    { value: 'quarter', label: 'Ce trimestre' },
                    { value: 'year', label: 'Cette année' },
                  ]}
                  className="w-36 h-9 text-sm"
                />
                <Button 
                  variant="outline"
                  onClick={() => setShowFilters(!showFilters)}
                  size="sm"
                  className="h-9"
                >
                  <FunnelIcon className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            {showFilters && stats && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {stats.completedEvaluations}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">Terminées</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {stats.pendingEvaluations}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">En attente</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {stats.validatedEvaluations}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">Validées</p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {stats.rejectedEvaluations}
                    </p>
                    <p className="text-neutral-600 dark:text-neutral-400">Rejetées</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-neutral-600 dark:text-neutral-400">Chargement des évaluations...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Evaluations List */}
        {!isLoading && !error && evaluations && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center justify-between">
                <span>Évaluations ({evaluations.totalElements})</span>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Page {evaluations.number + 1} sur {evaluations.totalPages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evaluations.content.map((evaluation) => (
                  <div 
                    key={evaluation.uuid} 
                    className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer transition-colors"
                    onClick={() => handleViewEvaluation(evaluation.uuid)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Avatar 
                          fallback={`${evaluation.driver.user.firstname[0]}${evaluation.driver.user.lastname[0]}`}
                          size="md"
                        />
                        <div>
                          <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                            {evaluation.driver.user.firstname} {evaluation.driver.user.lastname}
                          </h3>
                          <p className="text-sm text-neutral-600 dark:text-neutral-400">
                            Évalué par {evaluation.partner.name}
                          </p>
                          <p className="text-xs text-neutral-500">
                            Template: {evaluation.template.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        {getStatusIcon(evaluation.status)}
                        {evaluation.status === 'COMPLETED' && evaluation.overallScore ? (
                          <div className="flex items-center space-x-1">
                            {getRatingStars(evaluation.overallScore)}
                            <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                              {evaluation.overallScore.toFixed(1)}
                            </span>
                          </div>
                        ) : null}
                        {getStatusBadge(evaluation.status)}
                      </div>
                    </div>

                    {evaluation.status === 'COMPLETED' && evaluation.scores && evaluation.scores.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-3">
                        {evaluation.scores.slice(0, 4).map((score) => (
                          <div key={score.uuid} className="text-center">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 truncate">
                              {score.criteria.name}
                            </p>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {score.numericValue}/10
                            </p>
                          </div>
                        ))}
                        {evaluation.scores.length > 4 && (
                          <div className="text-center">
                            <p className="text-sm text-neutral-600 dark:text-neutral-400">
                              +{evaluation.scores.length - 4} autres
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {evaluation.comments && (
                      <div className="mb-3">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400 italic line-clamp-2">
                          "{evaluation.comments}"
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                      <div className="flex items-center space-x-4">
                        <span>
                          Évaluation: {new Date(evaluation.evaluationDate).toLocaleDateString('fr-FR')}
                        </span>
                        <span>
                          Période: {new Date(evaluation.periodStart).toLocaleDateString('fr-FR')} - {new Date(evaluation.periodEnd).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewEvaluation(evaluation.uuid)
                          }}
                          className="h-7 px-2"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-3.5 w-3.5" />
                        </Button>
                        {evaluation.status === 'PENDING' && canUpdateThisEvaluation(evaluation) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditEvaluation(evaluation.uuid)
                            }}
                            className="h-7 px-2"
                            title="Modifier"
                          >
                            <PencilIcon className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                {evaluations.content.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {filters.search || filters.status !== 'all' || filters.period !== 'all'
                        ? 'Aucune évaluation trouvée avec ces critères' 
                        : 'Aucune évaluation trouvée'
                      }
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {evaluations.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                  <div className="text-sm text-neutral-600 dark:text-neutral-400">
                    {evaluations.numberOfElements} évaluation{evaluations.numberOfElements > 1 ? 's' : ''} sur {evaluations.totalElements}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page <= 0} 
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                    >
                      Précédent
                    </Button>
                    <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
                      {page + 1} / {evaluations.totalPages}
                    </span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      disabled={page + 1 >= evaluations.totalPages} 
                      onClick={() => setPage(p => p + 1)}
                    >
                      Suivant
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}