'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { ApiEvaluationTemplate } from '@/types'
import { ArrowLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import '@/styles/templates.css'

export default function EvaluationTemplateDetailsPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = typeof params?.uuid === 'string' ? params.uuid : ''
  const uuid = itemId as string

  const [template, setTemplate] = useState<ApiEvaluationTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTemplate = async () => {
      if (!uuid) return

      setIsLoading(true)
      setError(null)

      try {
        const data = await evaluationTemplatesService.getTemplate(uuid)
        setTemplate(data)
      } catch (err) {
        console.error('Erreur lors du chargement du template:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement du template')
      } finally {
        setIsLoading(false)
      }
    }

    loadTemplate()
  }, [uuid])

  if (isLoading) {
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <div className="text-red-600 dark:text-red-400 mb-4">{error}</div>
            <Button onClick={() => router.back()}>Retour</Button>
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
                {template.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Détails du template d'évaluation
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/evaluations/templates/${uuid}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Informations générales
                  <Badge variant={template.active ? 'success' : 'warning'}>
                    {template.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">{template.name}</p>
                </div>

                {template.description && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Description
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{template.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Code
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{template.code || '—'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Version
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{template.version}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">
                  Critères d'évaluation ({template.templateCriteriaList?.length || 0})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!template.templateCriteriaList || template.templateCriteriaList.length === 0 ? (
                  <p className="text-neutral-600 dark:text-neutral-400 text-center py-6 text-sm">
                    Aucun critère d'évaluation associé à ce template
                  </p>
                ) : (
                  <div className="space-y-2">
                    {template.templateCriteriaList
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map((templateCriteria, index) => (
                        <div
                          key={templateCriteria.uuid}
                          className="flex items-center space-x-3 p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg"
                        >
                          <div className="flex-shrink-0 w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium text-neutral-900 dark:text-neutral-100 text-sm truncate">
                                {templateCriteria.evaluationCriteria.name}
                              </h4>
                              <Badge
                                variant={templateCriteria.evaluationCriteria.active ? 'success' : 'warning'}
                                size="sm"
                              >
                                {templateCriteria.evaluationCriteria.active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            {templateCriteria.evaluationCriteria.description && (
                              <p className="text-xs text-neutral-600 dark:text-neutral-400 truncate">
                                {templateCriteria.evaluationCriteria.description}
                              </p>
                            )}
                            <span className="text-xs text-neutral-500">
                              {templateCriteria.evaluationCriteria.code}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Métadonnées</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    UUID
                  </label>
                  <p className="text-xs text-neutral-600 dark:text-neutral-400 font-mono break-all">
                    {template.uuid}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Créé le
                  </label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100">
                    {new Date(template.createdDate).toLocaleString()}
                  </p>
                </div>

                {template.lastModifiedDate && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Modifié le
                    </label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      {new Date(template.lastModifiedDate).toLocaleString()}
                    </p>
                  </div>
                )}

                {template.createdBy && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Créé par
                    </label>
                    <p className="text-sm text-neutral-900 dark:text-neutral-100">
                      Utilisateur #{template.createdBy}
                    </p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Supprimable
                  </label>
                  <Badge variant={template.isDeletable ? 'success' : 'warning'} size="sm">
                    {template.isDeletable ? 'Oui' : 'Non'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}