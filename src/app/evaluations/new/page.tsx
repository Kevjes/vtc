'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeftIcon, 
  XMarkIcon,
  StarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, Badge } from '@/components/ui'
import { evaluationsService, CreateEvaluationRequest } from '@/services/evaluations'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { driversService } from '@/services/driversService'
import { partnersService } from '@/services/partnersService'
import { authService } from '@/services/auth'
import { ApiEvaluationTemplate, ApiDriver, ApiPartner, AuthUser } from '@/types'
import '@/styles/templates.css'

interface EvaluationScore {
  criteriaUuid: string
  criteriaName: string
  criteriaDescription?: string
  numericValue: number
  comment: string
}

const ScoreInput = ({ 
  score, 
  onChange 
}: { 
  score: EvaluationScore
  onChange: (score: EvaluationScore) => void 
}) => {
  const handleRatingClick = (rating: number) => {
    onChange({ ...score, numericValue: rating })
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 space-y-4">
      <div>
        <h4 className="font-medium text-neutral-900 dark:text-neutral-100 mb-1">
          {score.criteriaName}
        </h4>
        {score.criteriaDescription && (
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            {score.criteriaDescription}
          </p>
        )}
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Note (sur 10) *
          </label>
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleRatingClick(i + 1)}
                  className="focus:outline-none"
                >
                  <StarIconSolid
                    className={`h-6 w-6 cursor-pointer transition-colors ${
                      i < score.numericValue 
                        ? 'text-yellow-500 hover:text-yellow-600' 
                        : 'text-neutral-300 dark:text-neutral-600 hover:text-yellow-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            <span className="ml-3 text-lg font-bold text-neutral-900 dark:text-neutral-100">
              {score.numericValue}/10
            </span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Commentaire (optionnel)
          </label>
          <Textarea
            value={score.comment}
            onChange={(e) => onChange({ ...score, comment: e.target.value })}
            placeholder="Ajoutez un commentaire pour ce critère..."
            rows={2}
            className="text-sm"
          />
        </div>
      </div>
    </div>
  )
}

export default function NewEvaluationPage() {
  const router = useRouter()
  
  // États pour les données
  const [drivers, setDrivers] = useState<ApiDriver[]>([])
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [templates, setTemplates] = useState<ApiEvaluationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<ApiEvaluationTemplate | null>(null)
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null)
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    driverUuid: '',
    partnerUuid: '',
    templateUuid: '',
    evaluatorUuid: '', // Ajout de l'évaluateur
    comments: '',
    periodStart: '',
    periodEnd: ''
  })
  
  const [scores, setScores] = useState<EvaluationScore[]>([])
  
  // États pour l'interface
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])

  // Charger les données initiales
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoadingData(true)
      try {
        const [driversData, partnersData, templatesData, userData] = await Promise.all([
          driversService.getDrivers({ size: 100 }),
          partnersService.getPartners({ size: 100 }),
          evaluationTemplatesService.getTemplates({ active: true, size: 100 }),
          authService.getCurrentUser()
        ])
        
        setDrivers(driversData.content)
        setPartners(partnersData.content)
        setTemplates(templatesData.content)
        setCurrentUser(userData)
        
        // Définir des valeurs par défaut pour les dates
        const today = new Date()
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1)
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0)
        
        // Pré-sélectionner automatiquement les premiers éléments disponibles
        setFormData(prev => ({
          ...prev,
          driverUuid: driversData.content.length > 0 ? driversData.content[0].uuid : '',
          partnerUuid: partnersData.content.length > 0 ? partnersData.content[0].uuid : '',
          templateUuid: templatesData.content.length > 0 ? templatesData.content[0].uuid : '',
          periodStart: lastMonth.toISOString().split('T')[0],
          periodEnd: endOfLastMonth.toISOString().split('T')[0]
        }))
        
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err)
        setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données')
      } finally {
        setIsLoadingData(false)
      }
    }

    loadInitialData()
  }, [])

  // Charger le template sélectionné et initialiser les scores
  useEffect(() => {
    if (formData.templateUuid && templates.length > 0) {
      const template = templates.find(t => t.uuid === formData.templateUuid)
      if (template) {
        setSelectedTemplate(template)
        
        // Initialiser les scores basés sur les critères du template
        if (template.templateCriteriaList && template.templateCriteriaList.length > 0) {
          const initialScores: EvaluationScore[] = template.templateCriteriaList
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(tc => ({
              criteriaUuid: tc.evaluationCriteria.uuid,
              criteriaName: tc.evaluationCriteria.name,
              criteriaDescription: tc.evaluationCriteria.description,
              numericValue: 5, // Note par défaut
              comment: ''
            }))
          setScores(initialScores)
        }
      }
    } else {
      setSelectedTemplate(null)
      setScores([])
    }
  }, [formData.templateUuid, templates])

  const handleFormChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setValidationErrors([])
  }

  const handleScoreChange = (index: number, updatedScore: EvaluationScore) => {
    setScores(prev => prev.map((score, i) => i === index ? updatedScore : score))
  }

  const validateForm = (): boolean => {
    const errors: string[] = []
    
    if (!formData.driverUuid) errors.push('Veuillez sélectionner un chauffeur')
    if (!formData.partnerUuid) errors.push('Veuillez sélectionner un partenaire')
    if (!formData.templateUuid) errors.push('Veuillez sélectionner un template')
    if (!formData.periodStart) errors.push('Veuillez définir la date de début')
    if (!formData.periodEnd) errors.push('Veuillez définir la date de fin')
    
    if (formData.periodStart && formData.periodEnd) {
      if (new Date(formData.periodStart) >= new Date(formData.periodEnd)) {
        errors.push('La date de début doit être antérieure à la date de fin')
      }
    }
    
    if (scores.length === 0) {
      errors.push('Aucun critère à évaluer trouvé')
    } else {
      const unratedScores = scores.filter(s => !s.numericValue || s.numericValue <= 0)
      if (unratedScores.length > 0) {
        errors.push(`${unratedScores.length} critère(s) non noté(s)`)
      }
    }
    
    setValidationErrors(errors)
    return errors.length === 0
  }

  const handleSave = async (asDraft = false) => {
    if (!asDraft && !validateForm()) {
      return
    }
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Utiliser l'utilisateur connecté comme évaluateur par défaut
      const evaluatorUuid = formData.evaluatorUuid || currentUser?.uuid
      
      if (!evaluatorUuid) {
        setError('Impossible de déterminer l\'évaluateur. Veuillez vous reconnecter.')
        return
      }
      
      const payload: CreateEvaluationRequest = {
        driver: { uuid: formData.driverUuid },
        partner: { uuid: formData.partnerUuid },
        evaluator: { uuid: evaluatorUuid },
        template: { uuid: formData.templateUuid },
        comments: formData.comments,
        periodStart: formData.periodStart,
        periodEnd: formData.periodEnd,
        scores: scores.map(score => ({
          criteria: { uuid: score.criteriaUuid },
          numericValue: score.numericValue,
          comment: score.comment
        }))
      }
      
      const newEvaluation = await evaluationsService.createEvaluation(payload)
      
      // Rediriger vers la page de détail
      router.push(`/evaluations/${newEvaluation.uuid}`)
    } catch (err) {
      console.error('Erreur lors de la création:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    if (formData.driverUuid || formData.partnerUuid || formData.comments || scores.some(s => s.numericValue > 0 || s.comment)) {
      if (confirm('Vous avez des données non sauvegardées. Êtes-vous sûr de vouloir annuler ?')) {
        router.back()
      }
    } else {
      router.back()
    }
  }

  if (isLoadingData) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <div className="text-neutral-600 dark:text-neutral-400">Chargement des données...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={handleCancel}>
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Retour
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                Nouvelle évaluation
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                Créer une nouvelle évaluation de chauffeur
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={handleCancel}>
              <XMarkIcon className="h-4 w-4 mr-2" />
              Annuler
            </Button>
            <Button 
              onClick={() => handleSave(false)} 
              disabled={isLoading}
            >
              <CheckCircleIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Création...' : 'Créer l\'évaluation'}
            </Button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Validation Errors */}
        {validationErrors.length > 0 && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">
                  Veuillez corriger les erreurs suivantes :
                </h4>
                <ul className="list-disc list-inside text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Informations générales</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Chauffeur à évaluer *
                </label>
                <Select
                  value={formData.driverUuid}
                  onChange={(e) => handleFormChange('driverUuid', e.target.value)}
                  options={drivers.map(driver => ({
                    value: driver.uuid,
                    label: `${driver.user.firstname} ${driver.user.lastname} (${driver.user.email})`
                  }))}
                  placeholder="Sélectionner un chauffeur"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Partenaire évaluateur *
                </label>
                <Select
                  value={formData.partnerUuid}
                  onChange={(e) => handleFormChange('partnerUuid', e.target.value)}
                  options={partners.map(partner => ({
                    value: partner.uuid,
                    label: partner.name
                  }))}
                  placeholder="Sélectionner un partenaire"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Template d'évaluation *
              </label>
              <Select
                value={formData.templateUuid}
                onChange={(e) => handleFormChange('templateUuid', e.target.value)}
                options={templates.map(template => ({
                  value: template.uuid,
                  label: `${template.name} ${template.description ? `- ${template.description}` : ''}`
                }))}
                placeholder="Sélectionner un template"
              />
              {selectedTemplate && (
                <div className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>{selectedTemplate.name}</strong>
                    {selectedTemplate.description && ` - ${selectedTemplate.description}`}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {selectedTemplate.templateCriteriaList?.length || 0} critère(s) d'évaluation
                  </p>
                </div>
              )}
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Début de période *
                </label>
                <Input
                  type="date"
                  value={formData.periodStart}
                  onChange={(e) => handleFormChange('periodStart', e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Fin de période *
                </label>
                <Input
                  type="date"
                  value={formData.periodEnd}
                  onChange={(e) => handleFormChange('periodEnd', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scores */}
        {selectedTemplate && scores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Évaluation des critères</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scores.map((score, index) => (
                  <ScoreInput
                    key={score.criteriaUuid}
                    score={score}
                    onChange={(updatedScore) => handleScoreChange(index, updatedScore)}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Commentaires généraux</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={formData.comments}
              onChange={(e) => handleFormChange('comments', e.target.value)}
              placeholder="Ajoutez des commentaires généraux sur cette évaluation..."
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        {scores.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Aperçu de l'évaluation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {scores.length > 0 ? (scores.reduce((sum, s) => sum + s.numericValue, 0) / scores.length).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Note moyenne</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {scores.length}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Critères</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {scores.filter(s => s.numericValue > 0).length}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Notés</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                    {scores.filter(s => s.comment.trim() !== '').length}
                  </p>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Avec commentaires</p>
                </div>
              </div>
              
              {scores.filter(s => !s.numericValue || s.numericValue <= 0).length > 0 && (
                <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm text-yellow-700 dark:text-yellow-300">
                    <ExclamationTriangleIcon className="h-4 w-4 inline mr-1" />
                    {scores.filter(s => !s.numericValue || s.numericValue <= 0).length} critère(s) non noté(s)
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}