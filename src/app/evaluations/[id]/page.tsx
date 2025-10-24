'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  StarIcon,
  CalendarIcon,
  UserIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, Avatar, Select } from '@/components/ui'
import { evaluationsService, ApiEvaluation } from '@/services/evaluations'
import '@/styles/templates.css'

const getRatingStars = (rating: number) => {
  return Array.from({ length: 10 }, (_, i) => (
    <StarIconSolid
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
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
      return <CheckCircleIcon className="h-6 w-6 text-green-500" />
    case 'PENDING':
      return <ClockIcon className="h-6 w-6 text-yellow-500" />
    case 'VALIDATED':
      return <CheckCircleIcon className="h-6 w-6 text-blue-500" />
    case 'REJECTED':
      return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
    default:
      return <ClockIcon className="h-6 w-6 text-neutral-500" />
  }
}

export default function EvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const evaluationId = params?.id as string

  // États pour les données
  const [evaluation, setEvaluation] = useState<ApiEvaluation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)

  // Charger l'évaluation
  const loadEvaluation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await evaluationsService.getEvaluation(evaluationId)
      setEvaluation(data)
    } catch (err) {
      console.error('Erreur lors du chargement de l\'évaluation:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (evaluationId) {
      loadEvaluation()
    }
  }, [evaluationId])

  const handleStatusChange = async (newStatus: ApiEvaluation['status']) => {
    if (!evaluation) return

    setIsUpdatingStatus(true)
    try {
      const updatedEvaluation = await evaluationsService.updateEvaluationStatus(evaluation.uuid, newStatus)
      setEvaluation(updatedEvaluation)
    } catch (err) {
      console.error('Erreur lors de la mise à jour du statut:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleDelete = async () => {
    if (!evaluation) return

    if (confirm('Êtes-vous sûr de vouloir supprimer cette évaluation ?')) {
      try {
        await evaluationsService.deleteEvaluation(evaluation.uuid)
        router.push('/evaluations')
      } catch (err) {
        console.error('Erreur lors de la suppression:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      }
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">Chargement de l'évaluation...</div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !evaluation) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">
              {error || 'Évaluation non trouvée'}
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const overallScore = (evaluation as any).averageScore || 0

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-1" />
              Retour
            </Button>
            <div>
              <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Évaluation de {evaluation.driver.user.firstname} {evaluation.driver.user.lastname}
              </h1>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Évaluée le {new Date(evaluation.evaluationDate).toLocaleDateString('fr-FR')}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {evaluation.status === 'PENDING' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push(`/evaluations/${evaluation.uuid}/edit`)}
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Modifier
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleDelete}
              disabled={evaluation.status === 'VALIDATED'}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Supprimer
            </Button>
          </div>
        </div>

        {/* Status and Score Overview */}
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                {getStatusIcon(evaluation.status)}
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Statut</p>
                  {getStatusBadge(evaluation.status)}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <StarIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Note globale</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                      {overallScore.toFixed(1)}/10
                    </span>
                    <div className="flex">
                      {getRatingStars(overallScore)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                  <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400">Période évaluée</p>
                  <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(evaluation.periodStart).toLocaleDateString('fr-FR')} - {new Date(evaluation.periodEnd).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Evaluation Details */}
        <div className="grid gap-3 md:grid-cols-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Détails de l'évaluation</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Chauffeur: </span>
                  <span className="font-medium">{evaluation.driver.user.firstname} {evaluation.driver.user.lastname}</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Partenaire: </span>
                  <span className="font-medium">{evaluation.partner.name}</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Évaluateur: </span>
                  <span className="font-medium">{evaluation.evaluator.firstname} {evaluation.evaluator.lastname}</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Template: </span>
                  <span className="font-medium">{evaluation.template.name}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status Management */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Gestion du statut</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Select
                    value={evaluation.status}
                    onChange={(e) => handleStatusChange(e.target.value as ApiEvaluation['status'])}
                    disabled={isUpdatingStatus || evaluation.status === 'VALIDATED'}
                    options={[
                      { value: 'PENDING', label: 'En attente' },
                      { value: 'COMPLETED', label: 'Terminée' },
                      { value: 'VALIDATED', label: 'Validée' },
                      { value: 'REJECTED', label: 'Rejetée' },
                    ]}
                    className="w-40"
                  />
                  {isUpdatingStatus && (
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">
                      Mise à jour...
                    </div>
                  )}
                </div>

                {/* Status workflow info */}
                <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3">
                  <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2 text-sm">
                    Workflow des statuts
                  </h4>
                  <div className="flex items-center space-x-2 text-xs text-neutral-600 dark:text-neutral-400">
                    <Badge variant="warning" size="sm">En attente</Badge>
                    <span>→</span>
                    <Badge variant="success" size="sm">Terminée</Badge>
                    <span>→</span>
                    <Badge variant="success" size="sm">Validée</Badge>
                    <span className="text-xs">ou</span>
                    <Badge variant="danger" size="sm">Rejetée</Badge>
                  </div>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-2">
                    Une fois validée, l'évaluation ne peut plus être modifiée.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Scores Detail */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Détail des scores</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {(evaluation as any).evaluationScores && (evaluation as any).evaluationScores.map((score: any) => (
                <div key={score.uuid} className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm text-neutral-900 dark:text-neutral-100">
                      {score.criteria.name}
                    </h4>
                    <div className="flex items-center space-x-2">
                      <div className="flex">
                        {getRatingStars(score.numericValue)}
                      </div>
                      <span className="font-bold text-neutral-900 dark:text-neutral-100">
                        {score.numericValue}/10
                      </span>
                    </div>
                  </div>
                  {score.criteria.description && (
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 mb-2">
                      {score.criteria.description}
                    </p>
                  )}
                  {score.comment && (
                    <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-2">
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 italic">
                        "{score.comment}"
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        {evaluation.comments && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">Commentaires généraux</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-lg p-3">
                <p className="text-sm text-neutral-700 dark:text-neutral-300">
                  {evaluation.comments}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metadata */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Informations techniques</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <p className="text-neutral-600 dark:text-neutral-400">Code</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.code}</p>
              </div>
              <div>
                <p className="text-neutral-600 dark:text-neutral-400">Version</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.version}</p>
              </div>
              <div>
                <p className="text-neutral-600 dark:text-neutral-400">Créée le</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {new Date(evaluation.createdDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <p className="text-neutral-600 dark:text-neutral-400">Modifiée le</p>
                <p className="font-medium text-neutral-900 dark:text-neutral-100">
                  {new Date(evaluation.lastModifiedDate).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}