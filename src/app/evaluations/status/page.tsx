'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  MagnifyingGlassIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  EyeIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar, Select } from '@/components/ui'
import { evaluationsService, ApiEvaluation } from '@/services/evaluations'
import { PaginatedResponse } from '@/types'
import '@/styles/templates.css'

interface StatusFilters {
  search: string
  currentStatus: 'all' | 'PENDING' | 'COMPLETED' | 'VALIDATED' | 'REJECTED'
  period: 'all' | 'week' | 'month' | 'quarter'
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
      return <Badge variant="destructive" size="sm">Rejetée</Badge>
    default:
      return <Badge variant="secondary" size="sm">{status}</Badge>
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

const getNextStatuses = (currentStatus: ApiEvaluation['status']): ApiEvaluation['status'][] => {
  switch (currentStatus) {
    case 'PENDING':
      return ['COMPLETED', 'REJECTED']
    case 'COMPLETED':
      return ['VALIDATED', 'REJECTED']
    case 'VALIDATED':
      return [] // Statut final
    case 'REJECTED':
      return ['PENDING'] // Possibilité de remettre en attente
    default:
      return []
  }
}

export default function EvaluationStatusPage() {
  const router = useRouter()
  
  // États pour les données
  const [evaluations, setEvaluations] = useState<PaginatedResponse<ApiEvaluation> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  
  // États pour les filtres
  const [filters, setFilters] = useState<StatusFilters>({
    search: '',
    currentStatus: 'all',
    period: 'all'
  })
  const [page, setPage] = useState(0)
  const [size] = useState(10)
  
  // États pour les actions en lot
  const [selectedEvaluations, setSelectedEvaluations] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<ApiEvaluation['status'] | ''>('')

  // Charger les évaluations
  const loadEvaluations = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const params: any = { page, size }
      
      // Construire le filtre
      let filterParts: string[] = []
      
      if (filters.currentStatus !== 'all') {
        filterParts.push(`status='${filters.currentStatus}'`)
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
          default:
            startDate = new Date(0)
        }
        
        filterParts.push(`evaluationDate >= '${startDate.toISOString().split('T')[0]}'`)
      }
      
      if (filters.search) {
        filterParts.push(`(driver.user.firstname LIKE '%${filters.search}%' OR driver.user.lastname LIKE '%${filters.search}%' OR partner.name LIKE '%${filters.search}%')`)
      }
      
      if (filterParts.length > 0) {
        params.filter = `(${filterParts.join(' AND ')})`
      }

      const data = await evaluationsService.getEvaluations(params)
      setEvaluations(data)
    } catch (err) {
      console.error('Erreur lors du chargement des évaluations:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  // Charger les données au montage et lors des changements de filtres
  useEffect(() => {
    loadEvaluations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.currentStatus, filters.period])

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

  const handleFilterChange = (key: keyof StatusFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPage(0)
  }

  const handleStatusChange = async (evaluationId: string, newStatus: ApiEvaluation['status']) => {
    setUpdatingStatus(evaluationId)
    try {
      await evaluationsService.updateEvaluationStatus(evaluationId, newStatus)
      await loadEvaluations() // Recharger les données
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut')
    } finally {
      setUpdatingStatus(null)
    }
  }

  const handleBulkStatusChange = async () => {
    if (!bulkAction || selectedEvaluations.length === 0) return
    
    if (!confirm(`Êtes-vous sûr de vouloir changer le statut de ${selectedEvaluations.length} évaluation(s) ?`)) {
      return
    }
    
    setIsLoading(true)
    try {
      // Traiter les évaluations une par une
      for (const evaluationId of selectedEvaluations) {
        await evaluationsService.updateEvaluationStatus(evaluationId, bulkAction as ApiEvaluation['status'])
      }
      
      setSelectedEvaluations([])
      setBulkAction('')
      await loadEvaluations()
    } catch (err) {
      console.error('Erreur lors de la mise à jour en lot:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour en lot')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectEvaluation = (evaluationId: string, selected: boolean) => {
    if (selected) {
      setSelectedEvaluations(prev => [...prev, evaluationId])
    } else {
      setSelectedEvaluations(prev => prev.filter(id => id !== evaluationId))
    }
  }

  const handleSelectAll = (selected: boolean) => {
    if (selected && evaluations) {
      setSelectedEvaluations(evaluations.content.map(e => e.uuid))
    } else {
      setSelectedEvaluations([])
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Gestion des statuts
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Gérez les statuts des évaluations en cours
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={loadEvaluations}
            disabled={isLoading}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <ClockIcon className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {evaluations?.content.filter(e => e.status === 'PENDING').length || 0}
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
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {evaluations?.content.filter(e => e.status === 'COMPLETED').length || 0}
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
                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <CheckCircleIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {evaluations?.content.filter(e => e.status === 'VALIDATED').length || 0}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Validées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {evaluations?.content.filter(e => e.status === 'REJECTED').length || 0}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Rejetées
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Bulk Actions */}
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
                  value={filters.currentStatus}
                  onChange={(e) => handleFilterChange('currentStatus', e.target.value)}
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
                  ]}
                  className="w-36 h-9 text-sm"
                />
              </div>
            </div>
            
            {/* Bulk Actions */}
            {selectedEvaluations.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    {selectedEvaluations.length} évaluation(s) sélectionnée(s)
                  </p>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={bulkAction}
                      onChange={(e) => setBulkAction(e.target.value)}
                      options={[
                        { value: '', label: 'Changer le statut...' },
                        { value: 'PENDING', label: 'En attente' },
                        { value: 'COMPLETED', label: 'Terminée' },
                        { value: 'VALIDATED', label: 'Validée' },
                        { value: 'REJECTED', label: 'Rejetée' },
                      ]}
                      className="w-40 h-8 text-sm"
                    />
                    <Button 
                      size="sm"
                      onClick={handleBulkStatusChange}
                      disabled={!bulkAction || isLoading}
                    >
                      Appliquer
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedEvaluations([])}
                    >
                      Annuler
                    </Button>
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
                <div className="flex items-center space-x-4">
                  <span>Évaluations ({evaluations.totalElements})</span>
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selectedEvaluations.length === evaluations.content.length && evaluations.content.length > 0}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    <span>Tout sélectionner</span>
                  </label>
                </div>
                <div className="text-sm text-neutral-600 dark:text-neutral-400">
                  Page {evaluations.number + 1} sur {evaluations.totalPages}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {evaluations.content.map((evaluation) => {
                  const nextStatuses = getNextStatuses(evaluation.status)
                  const isSelected = selectedEvaluations.includes(evaluation.uuid)
                  const isUpdating = updatingStatus === evaluation.uuid
                  
                  return (
                    <div 
                      key={evaluation.uuid} 
                      className={`border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 transition-colors ${
                        isSelected ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => handleSelectEvaluation(evaluation.uuid, e.target.checked)}
                            className="rounded border-neutral-300 dark:border-neutral-600"
                          />
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
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(evaluation.status)}
                          {getStatusBadge(evaluation.status)}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-4 text-neutral-500 dark:text-neutral-400">
                          <span>
                            Évaluation: {new Date(evaluation.evaluationDate).toLocaleDateString('fr-FR')}
                          </span>
                          <span>
                            Template: {evaluation.template.name}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => router.push(`/evaluations/${evaluation.uuid}`)}
                            className="h-7 px-2"
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-3.5 w-3.5" />
                          </Button>
                          
                          {nextStatuses.length > 0 && (
                            <Select
                              value=""
                              onChange={(e) => {
                                if (e.target.value) {
                                  handleStatusChange(evaluation.uuid, e.target.value as ApiEvaluation['status'])
                                }
                              }}
                              disabled={isUpdating}
                              options={[
                                { value: '', label: isUpdating ? 'Mise à jour...' : 'Changer statut' },
                                ...nextStatuses.map(status => ({
                                  value: status,
                                  label: status === 'PENDING' ? 'En attente' :
                                         status === 'COMPLETED' ? 'Terminée' :
                                         status === 'VALIDATED' ? 'Validée' :
                                         status === 'REJECTED' ? 'Rejetée' : status
                                }))
                              ]}
                              className="w-32 h-7 text-xs"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
                
                {evaluations.content.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-neutral-500 dark:text-neutral-400">
                      {filters.search || filters.currentStatus !== 'all' || filters.period !== 'all'
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