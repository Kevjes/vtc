'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Modal } from '@/components/ui'
import { evaluationCriteriaService } from '@/services/evaluationCriteria'
import { ApiEvaluationCriteria, PaginatedResponse } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function EvaluationCriteriaPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [criteria, setCriteria] = useState<PaginatedResponse<ApiEvaluationCriteria> | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [criterionToDelete, setCriterionToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const loadCriteria = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await evaluationCriteriaService.getCriteria({ page: 0, size: 10, filter: searchTerm })
      setCriteria(data)
    } catch (err) {
      console.error('Erreur lors du chargement des critères:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadCriteria()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSearch = () => {
    loadCriteria()
  }

  const handleDelete = (uuid: string) => {
    setCriterionToDelete(uuid)
  }

  const confirmDelete = async () => {
    if (!criterionToDelete) return
    
    setIsDeleting(true)
    try {
      await evaluationCriteriaService.deleteCriterion(criterionToDelete)
      console.log('✅ Critère supprimé avec succès')
      setCriterionToDelete(null)
      loadCriteria() // Recharger la liste
    } catch (error) {
      console.error('❌ Erreur lors de la suppression:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Critères d'évaluation</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Gérez les critères utilisés pour les évaluations</p>
          </div>
          <div className="flex items-center space-x-3">
            <Button onClick={() => router.push('/evaluations/criteria/create')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau critère
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="flex gap-3">
              <Input
                placeholder="Rechercher un critère..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon={<MagnifyingGlassIcon className="h-4 w-4" />}
              />
              <Button variant="outline" onClick={handleSearch}>Rechercher</Button>
            </div>
          </CardContent>
        </Card>

        {isLoading && (
          <div className="text-center text-neutral-600 dark:text-neutral-400">Chargement...</div>
        )}

        {error && (
          <div className="text-center text-red-600 dark:text-red-400">{error}</div>
        )}

        {criteria && (
          <div className="grid gap-6 md:grid-cols-2">
            {criteria.content.map((item) => (
              <Card key={item.uuid}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{item.name}</span>
                    <Badge variant={item.active ? 'success' : 'warning'} size="sm">
                      {item.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-neutral-700 dark:text-neutral-300 text-sm">
                    {item.description || '—'}
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/evaluations/criteria/${item.uuid}`)}>
                      <EyeIcon className="h-4 w-4 mr-1" />
                      Voir
                    </Button>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => handleDelete(item.uuid)}>
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={!!criterionToDelete}
        onClose={() => setCriterionToDelete(null)}
        title="Supprimer le critère"
        size="sm"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir supprimer ce critère d'évaluation ?</p>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            Cette action est irréversible.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setCriterionToDelete(null)}
              disabled={isDeleting}
            >
              Annuler
            </Button>
            <Button
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  )
}