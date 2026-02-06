'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  StarIcon,
  CalendarIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  EyeIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Avatar,
  Modal,
  Select
} from '@/components/ui'
import { ApiDriver, ApiPartner, ApiDocument, ApiDriverPartnerHistory } from '@/types'
import { driversService } from '@/services/drivers'
import { partnersService } from '@/services/partners'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import { DriverPermissions } from '@/types'


const getStatusBadge = (active: boolean) => {
  return active
    ? <Badge variant="success" size="md">Actif</Badge>
    : <Badge variant="warning" size="md">Inactif</Badge>
}

const getVehicleTypeLabel = (vehicleType: string) => {
  const types: Record<string, string> = {
    'CAR': 'Voiture',
    'MOTORCYCLE': 'Moto',
    'VAN': 'Van',
    'TRUCK': 'Camion',
    'car': 'Voiture',
    'motorcycle': 'Moto',
    'van': 'Van',
    'truck': 'Camion'
  }
  return types[vehicleType] || vehicleType
}

const getRatingStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <StarSolidIcon
      key={i}
      className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
        }`}
    />
  ))
}

const getDocumentStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'APPROVED':
    case 'VALIDATED':
      return <Badge variant="success" size="sm">Validé</Badge>
    case 'REJECTED':
      return <Badge variant="danger" size="sm">Rejeté</Badge>
    case 'PENDING':
      return <Badge variant="info" size="sm">En attente</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

export default function DriverDetailPage() {
  const router = useRouter()
  const params = useParams()
  const driverId = typeof params?.id === 'string' ? params.id : ''
  const [driver, setDriver] = useState<ApiDriver | null>(null)
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [history, setHistory] = useState<ApiDriverPartnerHistory[]>([])
  const [evaluations, setEvaluations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedPartnerUuid, setSelectedPartnerUuid] = useState('')

  const averageRating = useMemo(() => {
    const validatedEvaluations = evaluations.filter(ev => ev.status === 'VALIDATED')
    if (validatedEvaluations.length === 0) return 0
    const sum = validatedEvaluations.reduce((acc, ev) => acc + (ev.averageScore || 0), 0)
    return sum / validatedEvaluations.length
  }, [evaluations])

  const { user } = useAuth()

  const { hasPermission, hasAllAccess } = usePermissions()
  const canUpdateDocs = hasAllAccess() || hasPermission(DriverPermissions.UPDATE_DRIVER_DOCUMENT)
  const canUpdateDriver = hasAllAccess() || hasPermission(DriverPermissions.UPDATE_DRIVER)

  const loadDriver = async () => {
    if (!driverId) return

    setIsLoading(true)
    setError(null)
    try {
      // Charger d'abord les données essentielles du chauffeur
      const driverData = await driversService.getDriver(driverId)
      setDriver(driverData)

      // Charger l'historique et les évaluations de manière non bloquante
      Promise.allSettled([
        driversService.getDriverHistory(driverId),
        driversService.getDriverEvaluations(driverId)
      ]).then((results) => {
        if (results[0].status === 'fulfilled') {
          setHistory(results[0].value)
        } else {
          console.error('Erreur chargement historique:', results[0].reason)
        }

        if (results[1].status === 'fulfilled') {
          setEvaluations(results[1].value)
        } else {
          console.error('Erreur chargement évaluations:', results[1].reason)
        }
      })

    } catch (error) {
      console.error('Erreur lors du chargement du chauffeur:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const loadPartners = async () => {
    try {
      const response = await partnersService.getPartners({ size: 100 })
      setPartners(response.content)
    } catch (error) {
      console.error('Erreur partners:', error)
    }
  }

  useEffect(() => {
    loadDriver()
    if (canUpdateDriver) {
      loadPartners()
    }
  }, [driverId, canUpdateDriver])

  const handleUpdateDocStatus = async (docUuid: string, status: string) => {
    try {
      setIsActionLoading(true)
      await driversService.updateDocumentStatus(docUuid, status)
      await loadDriver()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du document')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleAssignPartner = async () => {
    if (!selectedPartnerUuid) return
    try {
      setIsActionLoading(true)
      await driversService.assignPartner(driverId, selectedPartnerUuid)
      setShowAssignModal(false)
      await loadDriver()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'assignation')
    } finally {
      setIsActionLoading(false)
    }
  }

  const handleUnassignPartner = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir désassigner ce chauffeur de son partenaire actuel ?')) return
    try {
      setIsActionLoading(true)
      await driversService.unassignPartner(driverId)
      await loadDriver()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désassignation')
    } finally {
      setIsActionLoading(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button
              onClick={() => router.push('/drivers')}
              className="mt-4"
            >
              Retour aux chauffeurs
            </Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">Chauffeur non trouvé</p>
            <Button
              onClick={() => router.push('/drivers')}
              className="mt-4"
            >
              Retour aux chauffeurs
            </Button>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {driver.user.firstname} {driver.user.lastname}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Chauffeur VTC • {driver.partner?.name || 'Indépendant'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/drivers/${driverId}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            {canUpdateDriver && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    // Si c'est un partenaire, on pré-sélectionne son propre UUID
                    if (user?.type === 'PARTNER' && user.partnerId) {
                      setSelectedPartnerUuid(user.partnerId)
                    }
                    setShowAssignModal(true)
                  }}
                  disabled={isActionLoading}
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  {driver.partner?.uuid ? 'Changer Partenaire' : 'Assigner Partenaire'}
                </Button>
                {driver.partner?.uuid && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={handleUnassignPartner}
                    disabled={isActionLoading}
                  >
                    <XCircleIcon className="h-4 w-4 mr-1" />
                    Désassigner
                  </Button>
                )}
              </div>
            )}
            {getStatusBadge(driver.user.active)}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                {getRatingStars(averageRating)}
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Note moyenne (Validées)
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {driver.totalRides || 0}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Courses totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary-600">
                N/A
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Gains totaux
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {Math.floor((new Date().getTime() - new Date(driver.createdDate).getTime()) / (1000 * 60 * 60 * 24))}j
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Ancienneté
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar
                  src={driver.user.profileImage}
                  fallback={`${driver.user.firstname[0]}${driver.user.lastname[0]}`}
                  size="xl"
                />
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {driver.user.firstname} {driver.user.lastname}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    ID: {driver.uuid}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">{driver.user.email}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">{driver.user.phone}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CalendarIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    Né le {new Date(driver.user.dob).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <UserIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">
                    Permis: {driver.licenseNumber || driver.licenseID}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <DocumentCheckIcon className="h-5 w-5 mr-2" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50 dark:bg-neutral-800">
                  <tr>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Type</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Nom du fichier</th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Statut</th>
                    <th className="text-right py-3 px-4 text-xs font-medium text-neutral-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                  {driver.documents && driver.documents.length > 0 ? (
                    driver.documents.map((doc: ApiDocument) => (
                      <tr key={doc.uuid}>
                        <td className="py-3 px-4 text-sm">{doc.type}</td>
                        <td className="py-3 px-4 text-sm">{doc.fileName}</td>
                        <td className="py-3 px-4 text-sm">{getDocumentStatusBadge(doc.status)}</td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <a
                              href={doc.url}
                              target="_blank"
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </a>
                            {canUpdateDocs && doc.status === 'PENDING' && (
                              // Seul l'admin ou le partenaire ACTUEL peut valider les documents
                              (hasAllAccess() || user?.partnerId === driver.partner?.uuid) ? (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-green-600"
                                    onClick={() => handleUpdateDocStatus(doc.uuid, 'VALIDATED')}
                                    disabled={isActionLoading}
                                  >
                                    <CheckCircleIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600"
                                    onClick={() => handleUpdateDocStatus(doc.uuid, 'REJECTED')}
                                    disabled={isActionLoading}
                                  >
                                    <XCircleIcon className="h-4 w-4" />
                                  </Button>
                                </>
                              ) : (
                                <span className="text-xs text-neutral-400 italic">Validation restreinte</span>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-neutral-500">Aucun document</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Historique des partenaires (Vue 360°) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Parcours & Historique Partenaires
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {history.length > 0 ? (
                <div className="relative">
                  <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-neutral-200 dark:bg-neutral-800"></div>
                  <div className="space-y-6">
                    {history.map((h, index) => (
                      <div key={h.id} className="relative pl-10">
                        <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white dark:border-neutral-900 flex items-center justify-center ${h.status === 'ACTIVE' ? 'bg-green-500' : 'bg-neutral-400'
                          }`}>
                          <TruckIcon className="h-4 w-4 text-white" />
                        </div>
                        <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-semibold text-neutral-900 dark:text-neutral-100">
                              {h.partner.name}
                            </h4>
                            <Badge variant={h.status === 'ACTIVE' ? 'success' : 'default'}>
                              {h.status === 'ACTIVE' ? 'Actuel' : 'Terminé'}
                            </Badge>
                          </div>
                          <div className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                            <p>Début : {new Date(h.startDate).toLocaleDateString('fr-FR')}</p>
                            {h.endDate && <p>Fin : {new Date(h.endDate).toLocaleDateString('fr-FR')}</p>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-neutral-500">Aucun historique disponible</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal Assigner Partenaire */}
        <Modal
          isOpen={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          title={driver.partner?.uuid ? "Changer le Partenaire" : "Assigner un Partenaire"}
        >
          <div className="space-y-4 pt-4">
            {user?.type === 'PARTNER' ? (
              <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-100 dark:border-primary-800">
                <p className="text-sm text-primary-800 dark:text-primary-200">
                  En tant que partenaire, vous allez assigner ce chauffeur à votre propre flotte.
                </p>
                <p className="mt-2 font-semibold text-primary-900 dark:text-primary-100">
                  Partenaire : {partners.find(p => p.uuid === user.partnerId)?.name || 'Votre entreprise'}
                </p>
              </div>
            ) : (
              <Select
                label="Choisir un partenaire"
                value={selectedPartnerUuid}
                onChange={(e) => setSelectedPartnerUuid(e.target.value)}
                options={partners.map(p => ({ label: p.name, value: p.uuid }))}
              />
            )}
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="outline" onClick={() => setShowAssignModal(false)}>Annuler</Button>
              <Button onClick={handleAssignPartner} disabled={isActionLoading || (!selectedPartnerUuid && user?.type !== 'PARTNER')}>
                {isActionLoading ? 'Traitement...' : 'Confirmer'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Évaluations récentes */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <StarIcon className="h-5 w-5 mr-2" />
                Évaluations récentes
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/evaluations')}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Voir toutes
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {evaluations && evaluations.length > 0 ? (
                evaluations.slice(0, 5).map((evaluation: any) => (
                  <div
                    key={evaluation.uuid}
                    className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex mb-1">
                        {getRatingStars(evaluation.averageScore || evaluation.overallRating)}
                      </div>
                      <Badge variant={evaluation.status === 'VALIDATED' ? 'success' : 'info'}>
                        {evaluation.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                          {evaluation.partner?.name || 'Partenaire inconnu'}
                        </p>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          Par {evaluation.evaluator?.firstname} {evaluation.evaluator?.lastname}
                        </p>
                      </div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(evaluation.evaluationDate || evaluation.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {evaluation.comments && (
                      <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400 italic">
                        "{evaluation.comments}"
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-neutral-500 dark:text-neutral-400">
                  Aucune évaluation disponible
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/drivers')}
          >
            Retour à la liste
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/evaluations/new?driver=${driver.uuid}`)}
            >
              Nouvelle évaluation
            </Button>
            <Button
              onClick={() => router.push(`/drivers/${driverId}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier le profil
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}