'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  DocumentIcon,
  CloudArrowUpIcon,
  CloudArrowDownIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  FileUpload,
  Badge
} from '@/components/ui'
import { importExportService } from '@/services/importExport'

export default function ImportExportPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string>('')

  const handleExport = async (type: string) => {
    if (type !== 'drivers') {
      setError('Seul l\'export des chauffeurs est supporté actuellement via l\'API.')
      return
    }

    try {
      setIsExporting(true)
      setExportType(type)
      setError(null)
      setSuccess(null)

      const blob = await importExportService.exportDrivers()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `drivers_export_${new Date().toISOString().split('T')[0]}.xlsx`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      setSuccess('Export réussi !')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
    } finally {
      setIsExporting(false)
      setExportType('')
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return
    const file = files[0]

    try {
      setIsExporting(true) // Reuse for blocking UI if needed
      setError(null)
      setSuccess(null)

      await importExportService.importDrivers(file)
      setSuccess('Import des chauffeurs réussi !')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Import / Export
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Importez et exportez vos données en toute simplicité
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <p className="text-green-800 dark:text-green-200">{success}</p>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Export */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                Exportation des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Exportez vos données vers différents formats pour analyse ou sauvegarde.
              </p>

              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('drivers')}
                  disabled={isExporting}
                >
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  {isExporting && exportType === 'drivers' ? 'Export en cours...' : 'Exporter les chauffeurs (CSV)'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('partners')}
                  disabled={isExporting}
                >
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  {isExporting && exportType === 'partners' ? 'Export en cours...' : 'Exporter les partenaires (CSV)'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('evaluations')}
                  disabled={isExporting}
                >
                  <CloudArrowDownIcon className="h-4 w-4 mr-2" />
                  {isExporting && exportType === 'evaluations' ? 'Export en cours...' : 'Exporter les évaluations (CSV)'}
                </Button>

                <Button
                  variant="outline"
                  className="w-full justify-start"
                  onClick={() => handleExport('all')}
                  disabled={isExporting}
                >
                  <DocumentIcon className="h-4 w-4 mr-2" />
                  {isExporting && exportType === 'all' ? 'Export en cours...' : 'Export complet (ZIP)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                Importation des données
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Importez vos données depuis des fichiers CSV ou Excel.
              </p>

              <FileUpload
                onFileSelect={handleFileUpload}
                accept=".csv,.xlsx,.xls"
                maxSize={10} // 10MB
                multiple={true}
              />

              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Formats supportés
                </h4>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>• CSV (UTF-8)</li>
                  <li>• Excel (.xlsx, .xls)</li>
                  <li>• Taille maximale : 10 MB par fichier</li>
                  <li>• Maximum 5 fichiers simultanément</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <Card>
          <CardHeader>
            <CardTitle>Instructions d'utilisation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Export des données
                </h4>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>• Cliquez sur le type de données à exporter</li>
                  <li>• Le fichier sera automatiquement téléchargé</li>
                  <li>• Les données sont exportées au format CSV</li>
                  <li>• L'export complet inclut toutes les données en ZIP</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                  Import des données
                </h4>
                <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                  <li>• Glissez-déposez vos fichiers ou cliquez pour sélectionner</li>
                  <li>• Assurez-vous que les colonnes correspondent au format attendu</li>
                  <li>• Les données existantes ne seront pas écrasées</li>
                  <li>• Un rapport d'import vous sera fourni</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}