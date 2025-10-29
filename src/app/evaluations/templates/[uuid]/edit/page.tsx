'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Switch, Badge } from '@/components/ui'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { evaluationCriteriaService } from '@/services/evaluationCriteria'
import { ApiEvaluationTemplate, ApiEvaluationCriteria, UpdateEvaluationTemplateRequest } from '@/types'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import '@/styles/templates.css'

export default function EditEvaluationTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const uuid = params.uuid as string

  const [template, setTemplate] = useState<ApiEvaluationTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(true)
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [availableCriteria, setAvailableCriteria] = useState<ApiEvaluationCriteria[]>([])
  const [selectedCriteria, setSelectedCriteria] = useState<ApiEvaluationCriteria[]>([])
  
  const [formData, setFormData] = useState<UpdateEvaluationTemplateRequest>({
    name: '',
    description: '',
    active: true,
    evaluationCriteriaList: []
  })

  // Charger le template existant
  useEffect(() => {
    const loadTemplate = async () => {
      if (!uuid) return

      setIsLoadingTemplate(true)
      setError(null)

      try {
        const data = await evaluationTemplatesService.getTemplate(uuid)
        setTemplate(data)
        
        // Initialiser le formulaire avec les données existantes
        setFormData({
          name: data.name,
          description: data.description || '',
          active: data.active,
          evaluationCriteriaList: data.templateCriteriaList?.map(tc => ({ uuid: tc.evaluationCriteria.uuid })) || []
        })

        // Initialiser les critères sélectionnés
        if (data.templateCriteriaList) {
          const criteria = data.templateCriteriaList
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(tc => tc.evaluationCriteria)
          setSelectedCriteria(criteria)
        }
      } catch (err) {
        console.error('Erreur lors du chargement du template:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du template')
      } finally {
        setIsLoadingTemplate(false)
      }
    }

    loadTemplate()
  }, [uuid])

  // Charger les critères d'évaluation disponibles
  useEffect(() => {
    const loadCriteria = async () => {
      setIsLoadingCriteria(true)
      try {
        const data = await evaluationCriteriaService.getCriteria({ active: true, size: 100 })
        setAvailableCriteria(data.content)
      } catch (err) {
        console.error('Erreur lors du chargement des critères:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des critères')
      } finally {
        setIsLoadingCriteria(false)
      }
    }

    loadCriteria()
  }, [])

  const handleInputChange = (field: keyof UpdateEvaluationTemplateRequest, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addCriterion = (criterion: ApiEvaluationCriteria) => {
    if (!selectedCriteria.find(c => c.uuid === criterion.uuid)) {
      setSelectedCriteria(prev => [...prev, criterion])
      setFormData(prev => ({
        ...prev,
        evaluationCriteriaList: [...(prev.evaluationCriteriaList || []), { uuid: criterion.uuid }]
      }))
    }
  }

  const removeCriterion = (criterionUuid: string) => {
    setSelectedCriteria(prev => prev.filter(c => c.uuid !== criterionUuid))
    setFormData(prev => ({
      ...prev,
      evaluationCriteriaList: prev.evaluationCriteriaList?.filter(c => c.uuid !== criterionUuid) || []
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name?.trim()) {
      setError('Le nom du template est requis')
      return
    }

    if (!formData.evaluationCriteriaList || formData.evaluationCriteriaList.length === 0) {
      setError('Au moins un critère d\'évaluation doit être sélectionné')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const payload: UpdateEvaluationTemplateRequest = {
        name: formData.name.trim(),
        description: formData.description?.trim() || undefined,
        active: formData.active,
        evaluationCriteriaList: formData.evaluationCriteriaList
      }

      console.log('🔍 Payload à envoyer:', payload)
      
      const result = await evaluationTemplatesService.updateTemplate(uuid, payload)
      console.log('✅ Template mis à jour avec succès:', result)
      
      // Rediriger vers les détails du template
      router.push(`/evaluations/templates/${uuid}`)
    } catch (err) {
      console.error('❌ Erreur lors de la mise à jour:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du template')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingTemplate) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center text-neutral-600 dark:text-neutral-400">
            Chargement du template...
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!template) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-neutral-600 dark:text-neutral-400 mb-4">Template non trouvé</div>
            <Button onClick={() => router.back()}>Retour</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Modifier le template
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Modifiez les informations et critères du template d'évaluation
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informations générales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Nom du template *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Ex: Template d'évaluation standard"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description
                </label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Description du template d'évaluation..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={!!formData.active}
                  onChange={(checked) => handleInputChange('active', checked)}
                />
                <label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Template actif
                </label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Critères d'évaluation</CardTitle>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Modifiez les critères qui seront utilisés dans ce template
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingCriteria ? (
                <div className="text-center text-neutral-600 dark:text-neutral-400">
                  Chargement des critères...
                </div>
              ) : (
                <>
                  {/* Critères sélectionnés */}
                  {selectedCriteria.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                        Critères sélectionnés ({selectedCriteria.length})
                      </h4>
                      <div className="space-y-1">
                        {selectedCriteria.map((criterion) => (
                          <div
                            key={criterion.uuid}
                            className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded"
                          >
                            <div className="flex-1 min-w-0">
                              <h5 className="font-medium text-blue-900 dark:text-blue-100 text-sm truncate">
                                {criterion.name}
                              </h5>
                              {criterion.description && (
                                <p className="text-xs text-blue-700 dark:text-blue-300 truncate">
                                  {criterion.description}
                                </p>
                              )}
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCriterion(criterion.uuid)}
                              className="text-red-600 hover:text-red-700 ml-2 px-2"
                            >
                              <XMarkIcon className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Critères disponibles */}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      Critères disponibles
                    </h4>
                    {availableCriteria.length === 0 ? (
                      <p className="text-neutral-600 dark:text-neutral-400 text-center py-3 text-sm">
                        Aucun critère d'évaluation disponible
                      </p>
                    ) : (
                      <div className="space-y-1 max-h-60 overflow-y-auto criteria-scroll">
                        {availableCriteria
                          .filter(criterion => !selectedCriteria.find(c => c.uuid === criterion.uuid))
                          .map((criterion) => (
                            <div
                              key={criterion.uuid}
                              className="flex items-center justify-between p-2 border border-neutral-200 dark:border-neutral-700 rounded hover:bg-neutral-50 dark:hover:bg-neutral-800"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                                    {criterion.name}
                                  </h5>
                                  <Badge variant={criterion.active ? 'success' : 'warning'} size="sm">
                                    {criterion.active ? 'Actif' : 'Inactif'}
                                  </Badge>
                                </div>
                                {criterion.description && (
                                  <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                    {criterion.description}
                                  </p>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => addCriterion(criterion)}
                                className="ml-2 px-2"
                              >
                                <PlusIcon className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !formData.name?.trim() || selectedCriteria.length === 0}
            >
              {isLoading ? 'Mise à jour...' : 'Mettre à jour'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}