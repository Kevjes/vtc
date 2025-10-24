'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Modal, Select } from '@/components/ui'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { ApiEvaluationTemplate, PaginatedResponse } from '@/types'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  MagnifyingGlassIcon, 
  EyeIcon,
  DocumentDuplicateIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  XMarkIcon,
  Squares2X2Icon
} from '@heroicons/react/24/outline'

export default function ManageEvaluationTemplatesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [templates, setTemplates] = useState<PaginatedResponse<ApiEvaluationTemplate> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  
  // Selection state
  const [selectedTemplates, setSelectedTemplates] = useState<Set<string>>(new Set())
  const [selectAll, setSelectAll] = useState(false)
  
  // Modal states
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [templateToDuplicate, setTemplateToDuplicate] = useState<string | null>(null)
  const [duplicateName, setDuplicateName] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showImportModal, setShowImportModal] = useState(false)
  
  // Loading states
  const [isDeleting, setIsDeleting] = useState(false)
  const [isDuplicating, setIsDuplicating] = useState(false)
  const [isBulkUpdating, setIsBulkUpdating] = useState(false)
  const [isImporting, setIsImporting] = useState(false)

  const loadTemplates = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const activeParam = statusFilter === 'all' ? undefined : statusFilter === 'active'
      const data = await evaluationTemplatesService.getTemplates({ page, size, filter: searchTerm || undefined, active: activeParam })
      setTemplates(data)
    } catch (err) {
      console.error('Erreur lors du chargement des templates:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadTemplates()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter])

  const handleSearch = () => {
    setPage(0)
    loadTemplates()
  }

  // Selection handlers
  const toggleSelectTemplate = (uuid: string) => {
    const newSelected = new Set(selectedTemplates)
    if (newSelected.has(uuid)) {
      newSelected.delete(uuid)
    } else {
      newSelected.add(uuid)
    }
    setSelectedTemplates(newSelected)
    setSelectAll(newSelected.size === templates?.content.length)
  }

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedTemplates(new Set())
    } else {
      setSelectedTemplates(new Set(templates?.content.map(t => t.uuid) || []))
    }
    setSelectAll(!selectAll)
  }

  // CRUD operations
  const confirmDelete = async () => {
    if (!templateToDelete) return
    setIsDeleting(true)
    try {
      await evaluationTemplatesService.deleteTemplate(templateToDelete)
      setTemplateToDelete(null)
      loadTemplates()
    } catch (err) {
      console.error('❌ Erreur lors de la suppression:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDuplicate = async () => {
    if (!templateToDuplicate) return
    setIsDuplicating(true)
    try {
      await evaluationTemplatesService.duplicateTemplate(templateToDuplicate, duplicateName || undefined)
      setTemplateToDuplicate(null)
      setDuplicateName('')
      loadTemplates()
    } catch (err) {
      console.error('❌ Erreur lors de la duplication:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la duplication')
    } finally {
      setIsDuplicating(false)
    }
  }

  // Bulk operations
  const handleBulkActivate = async () => {
    setIsBulkUpdating(true)
    try {
      await evaluationTemplatesService.bulkUpdateStatus(Array.from(selectedTemplates), true)
      setSelectedTemplates(new Set())
      setSelectAll(false)
      loadTemplates()
    } catch (err) {
      console.error('❌ Erreur lors de l\'activation en masse:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'activation en masse')
    } finally {
      setIsBulkUpdating(false)
    }
  }

  const handleBulkDeactivate = async () => {
    setIsBulkUpdating(true)
    try {
      await evaluationTemplatesService.bulkUpdateStatus(Array.from(selectedTemplates), false)
      setSelectedTemplates(new Set())
      setSelectAll(false)
      loadTemplates()
    } catch (err) {
      console.error('❌ Erreur lors de la désactivation en masse:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la désactivation en masse')
    } finally {
      setIsBulkUpdating(false)
    }
  }

  // Export/Import operations
  const handleExport = async (uuid: string) => {
    try {
      const template = templates?.content.find(t => t.uuid === uuid)
      if (!template) return

      const blob = await evaluationTemplatesService.exportTemplate(uuid)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `template-${template.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('❌ Erreur lors de l\'export:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'export')
    }
  }

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsImporting(true)
    try {
      await evaluationTemplatesService.importTemplate(file)
      setShowImportModal(false)
      loadTemplates()
    } catch (err) {
      console.error('❌ Erreur lors de l\'import:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'import')
    } finally {
      setIsImporting(false)
    }
  }

  const totalPages = templates?.totalPages ?? 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Gestion des templates d'évaluation
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Gérez, dupliquez et organisez vos modèles d'évaluation
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
              Importer
            </Button>
            <Button onClick={() => router.push('/evaluations/templates/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>
        </div>

        {/* Filtres et recherche */}
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <Input
                placeholder="Rechercher un template..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
              />
              <Select
                label="Statut"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
                options={[
                  { value: 'all', label: 'Tous' },
                  { value: 'active', label: 'Actif' },
                  { value: 'inactive', label: 'Inactif' },
                ]}
              />
              <Button variant="outline" onClick={handleSearch}>Rechercher</Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBulkActions(!showBulkActions)}
                className={selectedTemplates.size > 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
              >
                <Squares2X2Icon className="h-4 w-4 mr-2" />
                Actions ({selectedTemplates.size})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions en masse */}
        {showBulkActions && selectedTemplates.size > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                  {selectedTemplates.size} template(s) sélectionné(s)
                </span>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleBulkActivate}
                    disabled={isBulkUpdating}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    Activer
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={handleBulkDeactivate}
                    disabled={isBulkUpdating}
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Désactiver
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading && (
          <div className="text-center text-neutral-600 dark:text-neutral-400">Chargement...</div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {templates && templates.content.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-neutral-600 dark:text-neutral-400">
              Aucun template trouvé.
            </CardContent>
          </Card>
        )}

        {templates && templates.content.length > 0 && (
          <>
            {/* Header avec sélection */}
            <div className="flex items-center space-x-3 px-4">
              <input
                type="checkbox"
                checked={selectAll}
                onChange={toggleSelectAll}
                className="rounded border-neutral-300 dark:border-neutral-600"
              />
              <span className="text-sm text-neutral-600 dark:text-neutral-400">
                Sélectionner tout
              </span>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {templates.content.map((item) => (
                <Card key={item.uuid} className={selectedTemplates.has(item.uuid) ? 'ring-2 ring-blue-500' : ''}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedTemplates.has(item.uuid)}
                          onChange={() => toggleSelectTemplate(item.uuid)}
                          className="rounded border-neutral-300 dark:border-neutral-600"
                        />
                        <span>{item.name}</span>
                      </div>
                      <Badge variant={item.active ? 'success' : 'warning'} size="sm">
                        {item.active ? 'Actif' : 'Inactif'}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                      {item.description || '—'}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-neutral-600 dark:text-neutral-400">
                      <div>
                        <span className="font-medium">Code:</span> {item.code || '—'}
                      </div>
                      <div>
                        <span className="font-medium">Créé le:</span> {item.createdDate ? new Date(item.createdDate).toLocaleString() : '—'}
                      </div>
                      <div>
                        <span className="font-medium">Modifié le:</span> {item.lastModifiedDate ? new Date(item.lastModifiedDate).toLocaleString() : '—'}
                      </div>
                      <div>
                        <span className="font-medium">Critères:</span> {Array.isArray(item.templateCriteriaList) ? item.templateCriteriaList.length : 0}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/evaluations/templates/${item.uuid}`)}>
                        <EyeIcon className="h-4 w-4 mr-1" />
                        Voir
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => router.push(`/evaluations/templates/${item.uuid}/edit`)}>
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setTemplateToDuplicate(item.uuid)
                          setDuplicateName(`${item.name} (Copie)`)
                        }}
                      >
                        <DocumentDuplicateIcon className="h-4 w-4 mr-1" />
                        Dupliquer
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleExport(item.uuid)}>
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Exporter
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => setTemplateToDelete(item.uuid)}>
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            Page {page + 1} / {totalPages || 1}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" disabled={page <= 0} onClick={() => setPage((p) => Math.max(0, p - 1))}>
              Précédent
            </Button>
            <Button variant="outline" disabled={templates ? page + 1 >= totalPages : true} onClick={() => setPage((p) => p + 1)}>
              Suivant
            </Button>
          </div>
        </div>
      </div>

      {/* Modal de suppression */}
      <Modal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        title="Supprimer le template"
        size="sm"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir supprimer ce template d'évaluation ?</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Cette action est irréversible.</p>
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setTemplateToDelete(null)} disabled={isDeleting}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de duplication */}
      <Modal
        isOpen={!!templateToDuplicate}
        onClose={() => {
          setTemplateToDuplicate(null)
          setDuplicateName('')
        }}
        title="Dupliquer le template"
        size="md"
      >
        <div className="space-y-4">
          <p>Créer une copie de ce template d'évaluation.</p>
          <div>
            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
              Nom du nouveau template
            </label>
            <Input
              value={duplicateName}
              onChange={(e) => setDuplicateName(e.target.value)}
              placeholder="Nom du template dupliqué"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => {
                setTemplateToDuplicate(null)
                setDuplicateName('')
              }} 
              disabled={isDuplicating}
            >
              Annuler
            </Button>
            <Button onClick={confirmDuplicate} disabled={isDuplicating || !duplicateName.trim()}>
              {isDuplicating ? 'Duplication...' : 'Dupliquer'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal d'import */}
      <Modal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        title="Importer un template"
        size="md"
      >
        <div className="space-y-4">
          <p>Sélectionnez un fichier JSON contenant un template d'évaluation exporté.</p>
          <div>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              disabled={isImporting}
              className="block w-full text-sm text-neutral-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>
          {isImporting && (
            <p className="text-sm text-neutral-600 dark:text-neutral-400">Import en cours...</p>
          )}
        </div>
      </Modal>
    </DashboardLayout>
  )
}