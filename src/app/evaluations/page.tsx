'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar } from '@/components/ui'

interface Evaluation {
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
}

const mockEvaluations: Evaluation[] = [
  {
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
    comment: 'Excellent chauffeur, très professionnel',
    date: '2024-09-07',
    status: 'completed'
  },
  {
    id: '2',
    driverName: 'Fatima Coulibaly',
    partnerName: 'TransAfrica',
    overallRating: 4.5,
    criteria: {
      punctuality: 4,
      courtesy: 5,
      vehicleCleanliness: 4,
      routeRespect: true,
      communication: 4,
      attendance: 5
    },
    comment: 'Très bonne conduite, parfois en léger retard',
    date: '2024-09-06',
    status: 'completed'
  },
  {
    id: '3',
    driverName: 'Ibrahim Sanogo',
    partnerName: 'CityRide',
    overallRating: 0,
    criteria: {
      punctuality: 0,
      courtesy: 0,
      vehicleCleanliness: 0,
      routeRespect: false,
      communication: 0,
      attendance: 0
    },
    date: '2024-09-08',
    status: 'pending'
  },
]

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

const getStatusBadge = (status: Evaluation['status']) => {
  switch (status) {
    case 'completed':
      return <Badge variant="success" size="sm">Terminée</Badge>
    case 'pending':
      return <Badge variant="warning" size="sm">En attente</Badge>
  }
}

export default function EvaluationsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'pending'>('all')
  const [showFilters, setShowFilters] = useState(false)

  // Filter evaluations based on search and status
  const filteredEvaluations = mockEvaluations.filter(evaluation => {
    const matchesSearch = evaluation.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         evaluation.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (evaluation.comment && evaluation.comment.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesStatus = filterStatus === 'all' || evaluation.status === filterStatus
    
    return matchesSearch && matchesStatus
  })

  const handleViewEvaluation = (evaluationId: string) => {
    router.push(`/evaluations/${evaluationId}`)
  }

  const handleEditEvaluation = (evaluationId: string) => {
    router.push(`/evaluations/${evaluationId}/edit`)
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
              onClick={() => router.push('/evaluations/criteria')}
            >
              Gérer les critères
            </Button>
            <Button onClick={() => router.push('/evaluations/new')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle évaluation
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {filteredEvaluations.filter(e => e.status === 'completed').length}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Évaluations terminées
                </p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                  {mockEvaluations.filter(e => e.status === 'pending').length}
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  En attente
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 mb-1">
                  <StarIcon className="h-5 w-5 text-yellow-500" />
                  <p className="text-3xl font-bold text-neutral-900 dark:text-neutral-100">
                    4.7
                  </p>
                </div>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Note moyenne
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <p className="text-3xl font-bold text-green-600">
                  92%
                </p>
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                  Satisfaction
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher une évaluation..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-4 w-4" />}
                />
              </div>
              <Button 
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>
            
            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    Toutes ({mockEvaluations.length})
                  </Button>
                  <Button
                    variant={filterStatus === 'completed' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('completed')}
                  >
                    Terminées ({mockEvaluations.filter(e => e.status === 'completed').length})
                  </Button>
                  <Button
                    variant={filterStatus === 'pending' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('pending')}
                  >
                    En attente ({mockEvaluations.filter(e => e.status === 'pending').length})
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Evaluations List */}
        <Card>
          <CardHeader>
            <CardTitle>Liste des évaluations ({filteredEvaluations.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredEvaluations.map((evaluation) => (
                <div 
                  key={evaluation.id} 
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer"
                  onClick={() => handleViewEvaluation(evaluation.id)}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <Avatar 
                        fallback={evaluation.driverName.split(' ').map(n => n[0]).join('')}
                        size="md"
                      />
                      <div>
                        <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {evaluation.driverName}
                        </h3>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Évalué par {evaluation.partnerName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      {evaluation.status === 'completed' ? (
                        <div className="flex items-center space-x-1">
                          {getRatingStars(evaluation.overallRating)}
                          <span className="ml-2 font-medium text-neutral-900 dark:text-neutral-100">
                            {evaluation.overallRating.toFixed(1)}
                          </span>
                        </div>
                      ) : null}
                      {getStatusBadge(evaluation.status)}
                    </div>
                  </div>

                  {evaluation.status === 'completed' && (
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-3">
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Ponctualité</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.criteria.punctuality}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Courtoisie</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.criteria.courtesy}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Propreté</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.criteria.vehicleCleanliness}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Itinéraire</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {evaluation.criteria.routeRespect ? 'Oui' : 'Non'}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Communication</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.criteria.communication}/5</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Assiduité</p>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">{evaluation.criteria.attendance}/5</p>
                      </div>
                    </div>
                  )}

                  {evaluation.comment && (
                    <div className="mb-3">
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                        "{evaluation.comment}"
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <span>{new Date(evaluation.date).toLocaleDateString('fr-FR')}</span>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewEvaluation(evaluation.id)
                        }}
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      {evaluation.status === 'pending' && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditEvaluation(evaluation.id)
                          }}
                          title="Modifier"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {filteredEvaluations.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    {searchTerm || filterStatus !== 'all' 
                      ? 'Aucune évaluation trouvée avec ces critères' 
                      : 'Aucune évaluation trouvée'
                    }
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}