'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  UserIcon,
  CalendarIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge, 
  Avatar 
} from '@/components/ui'

interface EvaluationDetail {
  id: string
  driverName: string
  partnerName: string
  overallRating: number
  criteria: {
    punctuality: number
    courtesy: number
    vehicleCleanliness: number
    routeRespect: boolean
    communication: number
    attendance: number
  }
  comment?: string
  date: string
  status: 'completed' | 'pending'
  evaluatedBy: string
  evaluationDate: string
  period: string
}

// Mock data - à remplacer par un appel API
const mockEvaluation: EvaluationDetail = {
  id: '1',
  driverName: 'Moussa Traoré',
  partnerName: 'VTC Plus',
  overallRating: 4.8,
  criteria: {
    punctuality: 5,
    courtesy: 5,
    vehicleCleanliness: 4,
    routeRespect: true,
    communication: 5,
    attendance: 5
  },
  comment: 'Excellent chauffeur, très professionnel et ponctuel. Il maintient toujours son véhicule propre et communique bien avec les passagers. Attitude exemplaire et respect des consignes.',
  date: '2024-09-07',
  status: 'completed',
  evaluatedBy: 'Mamadou Diarra',
  evaluationDate: '2024-09-07',
  period: 'Septembre 2024'
}

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <StarSolidIcon
      key={i}
      className={`h-5 w-5 ${
        i < Math.floor(rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
      }`}
    />
  ))
}

const getStatusBadge = (status: EvaluationDetail['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success" size="md">Terminée</Badge>
    case 'pending':
      return <Badge variant="warning" size="md">En attente</Badge>
  }
}

const getCriteriaIcon = (value: number | boolean) => {
  if (typeof value === 'boolean') {
    return value ? (
      <CheckCircleIcon className="h-5 w-5 text-green-500" />
    ) : (
      <XCircleIcon className="h-5 w-5 text-red-500" />
    )
  }
  
  return (
    <div className="flex items-center space-x-1">
      <StarSolidIcon className="h-4 w-4 text-yellow-500" />
      <span className="font-medium">{value}/5</span>
    </div>
  )
}

export default function EvaluationDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [evaluation, setEvaluation] = useState<EvaluationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadEvaluation = async () => {
      setIsLoading(true)
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setEvaluation(mockEvaluation)
      } catch (error) {
        console.error('Erreur lors du chargement de l\'évaluation:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadEvaluation()
  }, [params.id])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!evaluation) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">Évaluation non trouvée</p>
            <Button 
              onClick={() => router.push('/evaluations')} 
              className="mt-4"
            >
              Retour aux évaluations
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Évaluation de {evaluation.driverName}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {evaluation.period} • Évaluée par {evaluation.partnerName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            {evaluation.status === 'pending' && (
              <Button 
                variant="outline"
                onClick={() => router.push(`/evaluations/${params.id}/edit`)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            )}
            {getStatusBadge(evaluation.status)}
          </div>
        </div>

        {/* Note globale */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-2">
                {getRatingStars(evaluation.overallRating)}
              </div>
              <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                {evaluation.overallRating.toFixed(1)}/5
              </p>
              <p className="text-neutral-600 dark:text-neutral-400">
                Note globale
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations générales */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Informations générales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Avatar 
                  fallback={evaluation.driverName.split(' ').map(n => n[0]).join('')}
                  size="lg"
                />
                <div>
                  <h3 className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {evaluation.driverName}
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">
                    Chauffeur VTC
                  </p>
                </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Partenaire</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {evaluation.partnerName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Évalué par</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {evaluation.evaluatedBy}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Date d'évaluation</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(evaluation.evaluationDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Période</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {evaluation.period}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Détail des critères */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <StarIcon className="h-5 w-5 mr-2" />
                Détail des critères
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Ponctualité
                  </span>
                  {getCriteriaIcon(evaluation.criteria.punctuality)}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Courtoisie
                  </span>
                  {getCriteriaIcon(evaluation.criteria.courtesy)}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Propreté du véhicule
                  </span>
                  {getCriteriaIcon(evaluation.criteria.vehicleCleanliness)}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Respect de l'itinéraire
                  </span>
                  {getCriteriaIcon(evaluation.criteria.routeRespect)}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Communication
                  </span>
                  {getCriteriaIcon(evaluation.criteria.communication)}
                </div>
                
                <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    Assiduité
                  </span>
                  {getCriteriaIcon(evaluation.criteria.attendance)}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Commentaires */}
        {evaluation.comment && (
          <Card>
            <CardHeader>
              <CardTitle>Commentaires et observations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <p className="text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {evaluation.comment}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/evaluations')}
          >
            Retour à la liste
          </Button>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
            >
              Imprimer
            </Button>
            {evaluation.status === 'pending' && (
              <Button
                onClick={() => router.push(`/evaluations/${params.id}/edit`)}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier l'évaluation
              </Button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}