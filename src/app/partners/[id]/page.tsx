'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  CalendarIcon,
  PhoneIcon,
  EnvelopeIcon,
  GlobeAltIcon,
  PencilIcon,
  EyeIcon,
  UsersIcon
} from '@heroicons/react/24/outline'
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
import { partnersService } from '@/services/partners'
import { ApiPartner, ApiDriver } from '@/types'


const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return <Badge variant="success" size="md">Actif</Badge>
    case 'SUSPENDED':
      return <Badge variant="warning" size="md">Suspendu</Badge>
    default:
      return <Badge variant="info" size="md">{status}</Badge>
  }
}


export default function PartnerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const partnerId = typeof params?.id === 'string' ? params.id : ''
  const [partner, setPartner] = useState<ApiPartner | null>(null)
  const [drivers, setDrivers] = useState<ApiDriver[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      if (!partnerId) return
      setIsLoading(true)
      try {
        const [partnerData, driversData] = await Promise.all([
          partnersService.getPartner(partnerId),
          partnersService.getPartnerDrivers(partnerId)
        ])
        setPartner(partnerData)
        setDrivers(driversData)
      } catch (error) {
        console.error('Erreur lors du chargement des données:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [partnerId])

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

  if (!partner) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-neutral-600 dark:text-neutral-400">Partenaire non trouvé</p>
            <Button
              onClick={() => router.push('/partners')}
              className="mt-4"
            >
              Retour aux partenaires
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
                {partner.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Partenaire • {partner.shortName}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/partners/${partnerId}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            {getStatusBadge(partner.status)}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {drivers.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Chauffeurs assignés
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                -
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                comming soon
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Informations entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Informations entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <div className="h-16 w-16 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <BuildingOfficeIcon className="h-8 w-8 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-neutral-100">
                    {partner.name}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    ID: {partner.uuid}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Nom court</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.shortName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">N° d'identification</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.companyIdentifier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Adresse email</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.email}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Téléphone</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.phone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Date de création</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(partner.createdDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

        {/* Adresse */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MapPinIcon className="h-5 w-5 mr-2" />
              Adresse
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Adresse complète</p>
              <p className="font-medium text-neutral-900 dark:text-neutral-100">
                {partner.address}
              </p>
            </div>
          </CardContent>
        </Card>
        </div>



        {/* Chauffeurs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Chauffeurs ({drivers.length})
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push('/drivers')}
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                Voir tous
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {drivers.length === 0 ? (
                <p className="text-center py-4 text-neutral-500">Aucun chauffeur assigné à ce partenaire.</p>
              ) : (
                drivers.map((driver) => (
                  <div
                    key={driver.uuid}
                    className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    onClick={() => router.push(`/drivers/${driver.uuid}`)}
                  >
                    <div className="flex items-center space-x-3">
                      <Avatar
                        src={driver.user.profileImage}
                        fallback={`${driver.user.firstname[0]}${driver.user.lastname[0]}`}
                        size="md"
                      />
                      <div>
                        <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                          {driver.user.firstname} {driver.user.lastname}
                        </h4>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                          {driver.user.email} • {driver.user.phone}
                        </p>
                      </div>
                    </div>
                    <Badge variant={driver.user.active ? 'success' : 'warning'} size="sm">
                      {driver.user.active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>


        {/* Actions */}
        <div className="flex items-center justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => router.push('/partners')}
          >
            Retour à la liste
          </Button>

          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              onClick={() => router.push(`/drivers/new?partner=${partner.uuid}`)}
            >
              Ajouter un chauffeur
            </Button>
            <Button
              onClick={() => router.push(`/partners/${partnerId}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier le partenaire
            </Button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}