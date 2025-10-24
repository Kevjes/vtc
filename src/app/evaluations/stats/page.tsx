'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ChartBarIcon,
  CalendarIcon,
  UserIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ArrowPathIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Select, Badge } from '@/components/ui'
import { evaluationsService, ApiEvaluation } from '@/services/evaluations'
import { evaluationStatsService, EvaluationStats } from '@/services/evaluationStats'
import { PaginatedResponse } from '@/types'
import '@/styles/templates.css'

// Composant graphique simple pour les barres
const SimpleBarChart = ({ 
  data, 
  title, 
  valueKey, 
  labelKey,
  color = 'blue' 
}: { 
  data: any[]
  title: string
  valueKey: string
  labelKey: string
  color?: string
}) => {
  const maxValue = Math.max(...data.map(item => item[valueKey]))
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="w-20 text-sm text-neutral-600 dark:text-neutral-400 truncate">
              {item[labelKey]}
            </div>
            <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full bg-${color}-500`}
                style={{ width: `${(item[valueKey] / maxValue) * 100}%` }}
              />
            </div>
            <div className="w-12 text-sm font-medium text-neutral-900 dark:text-neutral-100 text-right">
              {item[valueKey]}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Composant graphique en secteurs simple
const SimplePieChart = ({ 
  data, 
  title 
}: { 
  data: Array<{ label: string; value: number; color: string }>
  title: string
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0)
  
  return (
    <div className="space-y-3">
      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">{title}</h4>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                {item.label}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {item.value}
              </span>
              <span className="text-xs text-neutral-500 dark:text-neutral-400">
                ({total > 0 ? ((item.value / total) * 100).toFixed(1) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface StatsFilters {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all'
  partner: string
  template: string
}

export default function EvaluationStatsPage() {
  const router = useRouter()
  
  // États pour les données
  const [evaluations, setEvaluations] = useState<ApiEvaluation[]>([])
  const [stats, setStats] = useState<EvaluationStats | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // États pour les filtres
  const [filters, setFilters] = useState<StatsFilters>({
    period: 'month',
    partner: 'all',
    template: 'all'
  })
  
  // Données pour les filtres
  const [partners, setPartners] = useState<Array<{ uuid: string; name: string }>>([])
  const [templates, setTemplates] = useState<Array<{ uuid: string; name: string }>>([])

  // Charger les évaluations et calculer les statistiques
  const loadStats = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Construire le filtre
      let filterParts: string[] = []
      
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
      
      if (filters.partner !== 'all') {
        filterParts.push(`partner.uuid='${filters.partner}'`)
      }
      
      if (filters.template !== 'all') {
        filterParts.push(`template.uuid='${filters.template}'`)
      }
      
      const params: any = { size: 1000 } // Récupérer plus de données pour les stats
      if (filterParts.length > 0) {
        params.filter = `(${filterParts.join(' AND ')})`
      }

      const data = await evaluationsService.getEvaluations(params)
      setEvaluations(data.content)
      
      // Calculer les statistiques
      const calculatedStats = evaluationStatsService.calculateStats(data.content)
      setStats(calculatedStats)
      
      // Extraire les partenaires et templates uniques
      const uniquePartners = Array.from(
        new Map(data.content.map(e => [e.partner.uuid, e.partner])).values()
      )
      const uniqueTemplates = Array.from(
        new Map(data.content.map(e => [e.template.uuid, e.template])).values()
      )
      
      setPartners(uniquePartners)
      setTemplates(uniqueTemplates)
      
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters])

  const handleFilterChange = (key: keyof StatsFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Préparer les données pour les graphiques
  const statusChartData = stats ? [
    { label: 'En attente', value: stats.pendingEvaluations, color: '#f59e0b' },
    { label: 'Terminées', value: stats.completedEvaluations, color: '#10b981' },
    { label: 'Validées', value: stats.validatedEvaluations, color: '#3b82f6' },
    { label: 'Rejetées', value: stats.rejectedEvaluations, color: '#ef4444' }
  ] : []

  const monthlyChartData = stats?.evaluationsByMonth.slice(-6) || []
  
  const topDriversChartData = stats?.topDrivers.slice(0, 10) || []

  // Calculer les tendances
  const getTrend = (current: number, previous: number) => {
    if (previous === 0) return { value: 0, isPositive: true }
    const change = ((current - previous) / previous) * 100
    return { value: Math.abs(change), isPositive: change >= 0 }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Statistiques avancées
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Analyse détaillée des évaluations
            </p>
          </div>
          <Button 
            variant="outline"
            onClick={loadStats}
            disabled={isLoading}
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-4 w-4 text-neutral-500" />
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Filtres:
                </span>
              </div>
              <div className="flex gap-2">
                <Select
                  value={filters.period}
                  onChange={(e) => handleFilterChange('period', e.target.value)}
                  options={[
                    { value: 'week', label: '7 derniers jours' },
                    { value: 'month', label: 'Ce mois' },
                    { value: 'quarter', label: 'Ce trimestre' },
                    { value: 'year', label: 'Cette année' },
                    { value: 'all', label: 'Toute période' },
                  ]}
                  className="w-36 h-9 text-sm"
                />
                <Select
                  value={filters.partner}
                  onChange={(e) => handleFilterChange('partner', e.target.value)}
                  options={[
                    { value: 'all', label: 'Tous partenaires' },
                    ...partners.map(p => ({ value: p.uuid, label: p.name }))
                  ]}
                  className="w-40 h-9 text-sm"
                />
                <Select
                  value={filters.template}
                  onChange={(e) => handleFilterChange('template', e.target.value)}
                  options={[
                    { value: 'all', label: 'Tous templates' },
                    ...templates.map(t => ({ value: t.uuid, label: t.name }))
                  ]}
                  className="w-40 h-9 text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="text-neutral-600 dark:text-neutral-400">Chargement des statistiques...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Stats Content */}
        {!isLoading && !error && stats && (
          <>
            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stats.totalEvaluations}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Total évaluations
                      </p>
                    </div>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                      <ChartBarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stats.averageScore.toFixed(1)}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Note moyenne
                      </p>
                    </div>
                    <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                      <TrendingUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stats.completedEvaluations}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Terminées
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="success" size="sm">
                          {stats.totalEvaluations > 0 ? ((stats.completedEvaluations / stats.totalEvaluations) * 100).toFixed(1) : 0}%
                        </Badge>
                      </div>
                    </div>
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                      <CalendarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                        {stats.topDrivers.length}
                      </p>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        Chauffeurs évalués
                      </p>
                    </div>
                    <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                      <UserIcon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle>Répartition par statut</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimplePieChart 
                    data={statusChartData}
                    title="Distribution des statuts"
                  />
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card>
                <CardHeader>
                  <CardTitle>Évolution mensuelle</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={monthlyChartData}
                    title="Évaluations par mois"
                    valueKey="count"
                    labelKey="month"
                    color="blue"
                  />
                </CardContent>
              </Card>

              {/* Top Drivers */}
              <Card>
                <CardHeader>
                  <CardTitle>Top chauffeurs</CardTitle>
                </CardHeader>
                <CardContent>
                  <SimpleBarChart 
                    data={topDriversChartData}
                    title="Meilleurs chauffeurs (note moyenne)"
                    valueKey="averageScore"
                    labelKey="driverName"
                    color="green"
                  />
                </CardContent>
              </Card>

              {/* Detailed Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>Statistiques détaillées</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {stats.validatedEvaluations}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Validées</p>
                      </div>
                      <div className="text-center p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                        <p className="text-lg font-bold text-neutral-900 dark:text-neutral-100">
                          {stats.rejectedEvaluations}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">Rejetées</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800">
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                        Taux de validation
                      </h4>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-neutral-200 dark:bg-neutral-700 rounded-full h-3">
                          <div 
                            className="h-3 rounded-full bg-green-500"
                            style={{ 
                              width: `${stats.totalEvaluations > 0 ? (stats.validatedEvaluations / stats.totalEvaluations) * 100 : 0}%` 
                            }}
                          />
                        </div>
                        <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {stats.totalEvaluations > 0 ? ((stats.validatedEvaluations / stats.totalEvaluations) * 100).toFixed(1) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Insights de performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                      Évaluations en cours
                    </h4>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {stats.pendingEvaluations + stats.completedEvaluations}
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      En attente de validation
                    </p>
                  </div>
                  
                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">
                      Taux de réussite
                    </h4>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                      {stats.totalEvaluations > 0 ? (((stats.validatedEvaluations + stats.completedEvaluations) / stats.totalEvaluations) * 100).toFixed(1) : 0}%
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Évaluations positives
                    </p>
                  </div>
                  
                  <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <h4 className="font-medium text-purple-900 dark:text-purple-100 mb-2">
                      Chauffeurs actifs
                    </h4>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {stats.topDrivers.filter(d => d.evaluationCount > 0).length}
                    </p>
                    <p className="text-sm text-purple-700 dark:text-purple-300">
                      Avec évaluations récentes
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}