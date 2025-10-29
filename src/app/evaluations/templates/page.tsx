'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Modal, Select } from '@/components/ui'
import { TemplateCard, TemplateSearchBar } from '@/components/templates'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { ApiEvaluationTemplate, PaginatedResponse } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline'
import '@/styles/templates.css'

export default function EvaluationTemplatesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [templates, setTemplates] = useState<PaginatedResponse<ApiEvaluationTemplate> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [size, setSize] = useState(10)
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

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

  const openDeleteModal = (uuid: string) => {
    setTemplateToDelete(uuid)
  }

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

  const totalPages = templates?.totalPages ?? 0

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Templates d'évaluation</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Gérez les modèles utilisés pour les évaluations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => router.push('/evaluations/templates/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau template
            </Button>
          </div>
        </div>

        <TemplateSearchBar
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusFilterChange={setStatusFilter}
          onSearch={handleSearch}
          onClear={() => {
            setSearchTerm('')
            setStatusFilter('all')
            setPage(0)
            loadTemplates()
          }}
        />

        {isLoading && (
          <div className="text-center text-neutral-600 dark:text-neutral-400">Chargement...</div>
        )}

        {error && (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        )}

        {templates && templates.content.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center text-neutral-600 dark:text-neutral-400">
              Aucun template trouvé.
            </CardContent>
          </Card>
        )}

        {templates && templates.content.length > 0 && (
          <div className="space-y-2">
            {templates.content.map((template) => (
              <TemplateCard 
                key={template.uuid} 
                template={template} 
                onDelete={openDeleteModal}
              />
            ))}
          </div>
        )}

        <div className="flex items-center justify-between bg-neutral-50 dark:bg-neutral-800 rounded-lg p-3">
          <div className="text-sm text-neutral-600 dark:text-neutral-400">
            {templates ? `${templates.numberOfElements} template${templates.numberOfElements > 1 ? 's' : ''} sur ${templates.totalElements}` : '0 template'}
          </div>
          <div className="flex items-center gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              disabled={page <= 0} 
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              Précédent
            </Button>
            <span className="px-3 py-1 text-sm text-neutral-600 dark:text-neutral-400">
              {page + 1} / {totalPages || 1}
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={templates ? page + 1 >= totalPages : true} 
              onClick={() => setPage((p) => p + 1)}
            >
              Suivant
            </Button>
          </div>
        </div>
      </div>

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
            <Button variant="outline" onClick={() => setTemplateToDelete(null)} disabled={isDeleting}>Annuler</Button>
            <Button variant="danger" onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}