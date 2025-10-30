'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Input, 
  Textarea,
  Switch
} from '@/components/ui'
import { ApiEvaluationCriteria, UpdateEvaluationCriteriaRequest } from '@/types'
import { evaluationCriteriaService } from '@/services/evaluationCriteria'

export default function EditEvaluationCriteriaPage() {
  const router = useRouter()
  const params = useParams()
  const itemId = typeof params?.id === 'string' ? params.id : ''
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    active: true
  })

  const [errors, setErrors] = useState<Partial<Record<keyof typeof formData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCriterion = async () => {
      if (!itemId || typeof itemId !== 'string') return

      setIsLoading(true)
      setError(null)
      try {
        const criterion = await evaluationCriteriaService.getCriterion(itemId)
        setFormData({
          name: criterion.name,
          description: criterion.description ?? '',
          active: criterion.active
        })
      } catch (error) {
        console.error('Erreur lors du chargement du critère:', error)
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    loadCriterion()
  }, [itemId])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof typeof formData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.description.trim()) newErrors.description = 'La description est requise'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !itemId || typeof itemId !== 'string') {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData: UpdateEvaluationCriteriaRequest = {
        name: formData.name,
        description: formData.description,
        active: formData.active
      }

      await evaluationCriteriaService.updateCriterion(itemId, updateData)
      router.push(`/evaluations/criteria/${itemId}?success=criterion-updated`)
    } catch (error) {
      console.error('Erreur lors de la modification du critère:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name as keyof typeof formData]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData(prev => ({ ...prev, active: checked }))
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 rounded w-1/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-32 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  if (error && !isLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto py-6">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <Button onClick={() => router.back()}>
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Retour
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeftIcon className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Modifier le critère d'évaluation</h1>
              <p className="text-muted-foreground">Mettre à jour les informations du critère</p>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <DocumentTextIcon className="mr-2 h-5 w-5" />
                Informations du critère
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label htmlFor="name" className="text-sm font-medium">
                    Nom du critère <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Ex: Ponctualité"
                    className={errors.name ? 'border-red-500' : ''}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Statut</label>
                  <div className="flex items-center space-x-2">
                    <Switch
                      checked={formData.active}
                      onChange={handleSwitchChange}
                    />
                    <span className="text-sm">
                      {formData.active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Description détaillée du critère d'évaluation..."
                  rows={4}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Boutons d'action */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="mr-2 h-4 w-4" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  )
}