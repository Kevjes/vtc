'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
    ArrowLeftIcon,
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    StarIcon,
    CheckCircleIcon,
    ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Textarea, Select, Badge } from '@/components/ui'
import { evaluationsService, ApiEvaluation, UpdateEvaluationRequest } from '@/services/evaluations'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { driversService } from '@/services/drivers'
import { partnersService } from '@/services/partners'
import { ApiEvaluationTemplate, ApiDriver, ApiPartner, EvaluationPermissions } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import '@/styles/templates.css'

interface EvaluationScore {
    uuid?: string
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
                        Note (sur 10)
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
                                        className={`h-6 w-6 cursor-pointer transition-colors ${i < score.numericValue
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

export default function EditEvaluationPage() {
    const router = useRouter()
    const params = useParams()
    const evaluationId = params?.id as string
    const { user } = useAuth()
    const { hasPermission, hasAllAccess } = usePermissions()

    // États pour les données
    const [evaluation, setEvaluation] = useState<ApiEvaluation | null>(null)
    const [drivers, setDrivers] = useState<ApiDriver[]>([])
    const [partners, setPartners] = useState<ApiPartner[]>([])
    const [templates, setTemplates] = useState<ApiEvaluationTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<ApiEvaluationTemplate | null>(null)

    // Permission checks
    const canUpdateEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.UPDATE_EVALUATION)
    const canUpdateOwnEvaluation = hasAllAccess() || hasPermission(EvaluationPermissions.UPDATE_OWN_EVALUATION)

    // Helper to check if evaluation belongs to current user
    const isOwnEvaluation = (ev: ApiEvaluation | null) => {
        if (!ev) return false
        // Check if user is the driver of this evaluation
        return user?.uuid === ev.driver?.uuid
    }

    // Helper to check if user can update this specific evaluation
    const canUpdateThisEvaluation = (ev: ApiEvaluation | null) => {
        if (!ev) return false
        if (hasAllAccess() || canUpdateEvaluation) return true
        if (canUpdateOwnEvaluation && isOwnEvaluation(ev)) return true
        return false
    }

    // États pour le formulaire
    const [formData, setFormData] = useState({
        driverUuid: '',
        partnerUuid: '',
        templateUuid: '',
        comments: '',
        periodStart: '',
        periodEnd: ''
    })

    const [scores, setScores] = useState<EvaluationScore[]>([])

    // États pour l'interface
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [hasChanges, setHasChanges] = useState(false)

    // Charger l'évaluation et les données initiales
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true)
            try {
                const [evaluationData, driversData, partnersData, templatesData] = await Promise.all([
                    evaluationsService.getEvaluation(evaluationId),
                    driversService.getDrivers({ size: 100 }),
                    partnersService.getPartners({ size: 100 }),
                    evaluationTemplatesService.getTemplates({ active: true, size: 100 })
                ])

                setEvaluation(evaluationData)
                setDrivers(Array.isArray(driversData.content) ? driversData.content : [])
                setPartners(Array.isArray(partnersData.content) ? partnersData.content : [])
                setTemplates(Array.isArray(templatesData.content) ? templatesData.content : [])

                // Initialiser le formulaire avec les données existantes
                if (evaluationData && evaluationData.driver && evaluationData.partner && evaluationData.template) {
                    setFormData({
                        driverUuid: evaluationData.driver.uuid,
                        partnerUuid: evaluationData.partner.uuid,
                        templateUuid: evaluationData.template.uuid,
                        comments: evaluationData.comments || '',
                        periodStart: evaluationData.periodStart.split('T')[0],
                        periodEnd: evaluationData.periodEnd.split('T')[0]
                    })
                }

                // Initialiser les scores
                const evaluationScores = (evaluationData as any).evaluationScores
                const initialScores: EvaluationScore[] = evaluationScores && Array.isArray(evaluationScores)
                    ? evaluationScores.map((score: any) => ({
                        uuid: score.uuid,
                        criteriaUuid: score.criteria.uuid,
                        criteriaName: score.criteria.name,
                        criteriaDescription: score.criteria.description,
                        numericValue: score.numericValue,
                        comment: score.comment || ''
                    }))
                    : []
                setScores(initialScores)

                // Trouver le template sélectionné
                if (Array.isArray(templatesData.content) && evaluationData.template) {
                    const template = templatesData.content.find(t => t.uuid === evaluationData.template.uuid)
                    if (template) {
                        setSelectedTemplate(template)
                    }
                }

            } catch (err) {
                console.error('Erreur lors du chargement des données:', err)
                setError(err instanceof Error ? err.message : 'Erreur lors du chargement des données')
            } finally {
                setIsLoading(false)
            }
        }

        if (evaluationId) {
            loadData()
        }
    }, [evaluationId])

    // Détecter les changements
    useEffect(() => {
        if (evaluation) {
            const hasFormChanges =
                formData.driverUuid !== evaluation.driver.uuid ||
                formData.partnerUuid !== evaluation.partner.uuid ||
                formData.templateUuid !== evaluation.template.uuid ||
                formData.comments !== (evaluation.comments || '') ||
                formData.periodStart !== evaluation.periodStart.split('T')[0] ||
                formData.periodEnd !== evaluation.periodEnd.split('T')[0]

            const hasScoreChanges = scores.some(score => {
                const originalScore = (evaluation as any).evaluationScores?.find((s: any) => s.criteria.uuid === score.criteriaUuid)
                return !originalScore ||
                    originalScore.numericValue !== score.numericValue ||
                    (originalScore.comment || '') !== score.comment
            })

            setHasChanges(hasFormChanges || hasScoreChanges)
        }
    }, [formData, scores, evaluation])

    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleScoreChange = (index: number, updatedScore: EvaluationScore) => {
        setScores(prev => prev.map((score, i) => i === index ? updatedScore : score))
    }

    const handleSave = async () => {
        if (!evaluation) return

        // Check permission before updating
        if (!canUpdateThisEvaluation(evaluation)) {
            setError("Vous n'avez pas la permission de modifier cette évaluation")
            return
        }

        setIsSaving(true)
        setError(null)

        try {
            const payload: UpdateEvaluationRequest = {
                driver: { uuid: formData.driverUuid },
                partner: { uuid: formData.partnerUuid },
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

            await evaluationsService.updateEvaluation(evaluation.uuid, payload)
            router.push(`/evaluations/${evaluation.uuid}`)
        } catch (err) {
            console.error('Erreur lors de la sauvegarde:', err)
            setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
        } finally {
            setIsSaving(false)
        }
    }

    const handleCancel = () => {
        if (hasChanges) {
            if (confirm('Vous avez des modifications non sauvegardées. Êtes-vous sûr de vouloir annuler ?')) {
                router.back()
            }
        } else {
            router.back()
        }
    }

    if (isLoading) {
        return (
            <DashboardLayout>
                <div className="text-center py-12">
                    <div className="text-neutral-600 dark:text-neutral-400">Chargement de l'évaluation...</div>
                </div>
            </DashboardLayout>
        )
    }

    if (error || !evaluation) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">
                            {error || 'Évaluation non trouvée'}
                        </p>
                    </div>
                </div>
            </DashboardLayout>
        )
    }

    // Check if user has permission to edit this evaluation
    if (!canUpdateThisEvaluation(evaluation)) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <Card className="p-8 max-w-md text-center">
                        <div className="mb-4">
                            <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto" />
                        </div>
                        <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
                            Accès non autorisé
                        </h2>
                        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
                            Vous n'avez pas les permissions nécessaires pour modifier cette évaluation.
                        </p>
                        <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Permissions requises: CAN_UPDATE_EVALUATION ou CAN_UPDATE_OWN_EVALUATION
                        </p>
                        <div className="mt-6">
                            <Button onClick={() => router.push('/evaluations')}>
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Retour aux évaluations
                            </Button>
                        </div>
                    </Card>
                </div>
            </DashboardLayout>
        )
    }

    // Vérifier si l'évaluation peut être modifiée
    if (evaluation.status === 'VALIDATED') {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => router.back()}>
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Retour
                        </Button>
                    </div>
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <p className="text-yellow-600 dark:text-yellow-400">
                            Cette évaluation a été validée et ne peut plus être modifiée.
                        </p>
                    </div>
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
                                Modifier l'évaluation
                            </h1>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                                {evaluation.driver.user.firstname} {evaluation.driver.user.lastname}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-3">
                        <Badge variant={evaluation.status === 'PENDING' ? 'warning' : 'default'}>
                            {evaluation.status === 'PENDING' ? 'En attente' : evaluation.status}
                        </Badge>
                        <Button variant="outline" onClick={handleCancel}>
                            <XMarkIcon className="h-4 w-4 mr-2" />
                            Annuler
                        </Button>
                        <Button
                            onClick={handleSave}
                            disabled={!hasChanges || isSaving}
                        >
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            {isSaving ? 'Sauvegarde...' : 'Sauvegarder'}
                        </Button>
                    </div>
                </div>

                {/* Error Display */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                        <p className="text-red-600 dark:text-red-400">{error}</p>
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
                                    Chauffeur
                                </label>
                                <Select
                                    value={formData.driverUuid}
                                    onChange={(e) => handleFormChange('driverUuid', e.target.value)}
                                    options={drivers && Array.isArray(drivers) ? drivers.map(driver => ({
                                        value: driver.uuid,
                                        label: `${driver.user.firstname} ${driver.user.lastname} (${driver.user.email})`
                                    })) : []}

                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Partenaire évaluateur
                                </label>
                                <Select
                                    value={formData.partnerUuid}
                                    onChange={(e) => handleFormChange('partnerUuid', e.target.value)}
                                    options={partners && Array.isArray(partners) ? partners.map(partner => ({
                                        value: partner.uuid,
                                        label: partner.name
                                    })) : []}

                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                Template d'évaluation
                            </label>
                            <Select
                                value={formData.templateUuid}
                                onChange={(e) => handleFormChange('templateUuid', e.target.value)}
                                options={templates && Array.isArray(templates) ? templates.map(template => ({
                                    value: template.uuid,
                                    label: template.name
                                })) : []}

                                disabled // Ne pas permettre de changer le template lors de l'édition
                            />
                            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                Le template ne peut pas être modifié après création
                            </p>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Début de période
                                </label>
                                <Input
                                    type="date"
                                    value={formData.periodStart}
                                    onChange={(e) => handleFormChange('periodStart', e.target.value)}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                                    Fin de période
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
                <Card>
                    <CardHeader>
                        <CardTitle>Évaluation des critères</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {scores && Array.isArray(scores) ? scores.map((score, index) => (
                                <ScoreInput
                                    key={score.criteriaUuid}
                                    score={score}
                                    onChange={(updatedScore) => handleScoreChange(index, updatedScore)}
                                />
                            )) : (
                                <div className="text-center py-4 text-neutral-500">
                                    Aucun critère d'évaluation disponible
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

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
                <Card>
                    <CardHeader>
                        <CardTitle>Résumé</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-3">
                            <div className="text-center">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {scores && scores.length > 0 ? (scores.reduce((sum, s) => sum + s.numericValue, 0) / scores.length).toFixed(1) : '0.0'}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Note moyenne</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {scores ? scores.length : 0}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Critères évalués</p>
                            </div>
                            <div className="text-center">
                                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                                    {scores ? scores.filter(s => s.comment.trim() !== '').length : 0}
                                </p>
                                <p className="text-sm text-neutral-600 dark:text-neutral-400">Avec commentaires</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    )
}