'use client'

import React, { useState, useEffect } from 'react'
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
  EyeIcon
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
  Avatar 
} from '@/components/ui'
import { ApiDriver } from '@/types'
import { driversService } from '@/services/drivers'


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
      className={`h-4 w-4 ${
        i < Math.floor(rating) ? 'text-yellow-500' : 'text-neutral-300 dark:text-neutral-600'
      }`}
    />
  ))
}

export default function DriverDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [driver, setDriver] = useState<ApiDriver | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDriver = async () => {
      if (!params.id || typeof params.id !== 'string') return

      setIsLoading(true)
      setError(null)
      try {
        const driverData = await driversService.getDriver(params.id)
        setDriver(driverData)
      } catch (error) {
        console.error('Erreur lors du chargement du chauffeur:', error)
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    loadDriver()
  }, [params.id])

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
                Chauffeur VTC • {driver.partnerName || 'Indépendant'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => router.push(`/drivers/${params.id}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            {getStatusBadge(driver.user.active)}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center space-x-1 mb-2">
                {getRatingStars(driver.rating || 0)}
              </div>
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {driver.rating ? driver.rating.toFixed(1) : 'N/A'}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Note moyenne
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

          {/* Informations véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Type</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {getVehicleTypeLabel(driver.vehicleType || '')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Marque</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {driver.vehicleInfo?.make || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Modèle</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {driver.vehicleInfo?.model || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Année</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {driver.vehicleInfo?.year || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Couleur</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {driver.vehicleInfo?.color || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Plaque</p>
                    <p className="font-medium text-neutral-900 dark:text-neutral-100">
                      {driver.vehicleInfo?.plateNumber || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              {driver.evaluations && driver.evaluations.length > 0 ? (
                driver.evaluations.slice(0, 3).map((evaluation: any) => (
                  <div
                    key={evaluation.uuid}
                    className="p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {getRatingStars(evaluation.overallRating)}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {evaluation.overallRating}/5
                        </span>
                      </div>
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {new Date(evaluation.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {evaluation.comment && (
                      <p className="text-sm text-neutral-600 dark:text-neutral-400 italic">
                        "{evaluation.comment}"
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
              onClick={() => router.push(`/drivers/${params.id}/edit`)}
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