'use client'

import React, { useState } from 'react'
import { 
  ChartBarIcon,
  PresentationChartLineIcon,
  DocumentChartBarIcon,
  CalendarIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button,
  Input,
  Select
} from '@/components/ui'

export default function ReportingPage() {
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })
  const [selectedReport, setSelectedReport] = useState('')

  const reportTypes = [
    { value: '', label: 'Sélectionner un type de rapport' },
    { value: 'drivers-performance', label: 'Performance des chauffeurs' },
    { value: 'partners-activity', label: 'Activité des partenaires' },
    { value: 'evaluations-summary', label: 'Résumé des évaluations' },
    { value: 'financial-overview', label: 'Vue d\'ensemble financière' },
    { value: 'usage-statistics', label: 'Statistiques d\'usage' }
  ]

  const handleGenerateReport = () => {
    console.log('Génération du rapport:', {
      type: selectedReport,
      dateRange
    })
    // Ici vous implémenteriez la génération du rapport
  }

  const quickStats = [
    {
      title: 'Courses ce mois',
      value: '2,847',
      change: '+12.5%',
      positive: true
    },
    {
      title: 'Revenus ce mois',
      value: '15,680,000 FCFA',
      change: '+8.2%',
      positive: true
    },
    {
      title: 'Note moyenne',
      value: '4.7/5',
      change: '+0.3',
      positive: true
    },
    {
      title: 'Chauffeurs actifs',
      value: '156',
      change: '+5',
      positive: true
    }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Rapports et Statistiques
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Analysez les performances de votre plateforme VTC
          </p>
        </div>

        {/* Stats rapides */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {stat.value}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                    {stat.title}
                  </p>
                  <p className={`text-sm mt-2 ${
                    stat.positive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Générateur de rapports */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                  Générateur de rapports
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Type de rapport
                    </label>
                    <Select
                      value={selectedReport}
                      onChange={(e) => setSelectedReport(e.target.value)}
                      options={reportTypes}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Période
                      </label>
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          type="date"
                          placeholder="Date de début"
                          value={dateRange.startDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                        <Input
                          type="date"
                          placeholder="Date de fin"
                          value={dateRange.endDate}
                          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={handleGenerateReport}
                  disabled={!selectedReport}
                  className="w-full"
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                  Générer le rapport
                </Button>
              </CardContent>
            </Card>

            {/* Graphiques placeholder */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2" />
                  Évolution des performances
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <PresentationChartLineIcon className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
                    <p className="text-neutral-600 dark:text-neutral-400">
                      Graphique des performances
                    </p>
                    <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
                      Les graphiques seront intégrés ici
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Rapports rapides */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Rapports rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Rapport aujourd\'hui')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Aujourd'hui
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Rapport cette semaine')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Cette semaine
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Rapport ce mois')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ce mois
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => console.log('Rapport trimestre')}
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Ce trimestre
                </Button>
              </CardContent>
            </Card>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Indicateurs clés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      Taux de satisfaction
                    </h4>
                    <p className="text-2xl font-bold text-green-600 mt-1">92%</p>
                  </div>
                  
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      Temps de réponse moyen
                    </h4>
                    <p className="text-2xl font-bold text-primary-600 mt-1">3.2 min</p>
                  </div>
                  
                  <div className="p-3 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                    <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                      Taux de conversion
                    </h4>
                    <p className="text-2xl font-bold text-primary-600 mt-1">87%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}