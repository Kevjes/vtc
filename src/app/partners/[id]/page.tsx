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

interface PartnerDetail {
  id: string
  companyName: string
  businessType: string
  registrationNumber: string
  taxNumber: string
  contactFirstName: string
  contactLastName: string
  contactEmail: string
  contactPhone: string
  contactPosition: string
  address: string
  city: string
  region: string
  country: string
  postalCode: string
  website?: string
  description?: string
  notes?: string
  maxDrivers: number
  commission: number
  status: 'active' | 'suspended' | 'pending'
  joinedDate: string
  driversCount: number
  totalRides: number
  totalRevenue: number
  drivers: Array<{
    id: string
    name: string
    rating: number
    totalRides: number
    status: 'active' | 'suspended' | 'archived'
  }>
}

// Mock data - à remplacer par un appel API
const mockPartner: PartnerDetail = {
  id: '1',
  companyName: 'VTC Plus',
  businessType: 'sarl',
  registrationNumber: 'ML-RCCM-2023-001',
  taxNumber: 'TAX-123456789',
  contactFirstName: 'Mamadou',
  contactLastName: 'Diarra',
  contactEmail: 'contact@vtcplus.ml',
  contactPhone: '+223 70 12 34 56',
  contactPosition: 'Directeur général',
  address: 'Quartier ACI 2000, Rue 456',
  city: 'Bamako',
  region: 'bamako',
  country: 'ML',
  postalCode: '12345',
  website: 'https://www.vtcplus.ml',
  description: 'Entreprise de transport VTC spécialisée dans les services de qualité supérieure.',
  notes: 'Partenaire prioritaire - bon historique de paiement',
  maxDrivers: 50,
  commission: 15.0,
  status: 'active',
  joinedDate: '2023-12-01',
  driversCount: 45,
  totalRides: 2458,
  totalRevenue: 15680000,
  drivers: [
    {
      id: '1',
      name: 'Moussa Traoré',
      rating: 4.9,
      totalRides: 156,
      status: 'active'
    },
    {
      id: '2',
      name: 'Aminata Keita',
      rating: 4.8,
      totalRides: 142,
      status: 'active'
    },
    {
      id: '3',
      name: 'Sekou Koné',
      rating: 4.7,
      totalRides: 98,
      status: 'active'
    }
  ]
}

const getStatusBadge = (status: PartnerDetail['status']) => {
  switch (status) {
    case 'active':
      return <Badge variant="success" size="md">Actif</Badge>
    case 'suspended':
      return <Badge variant="warning" size="md">Suspendu</Badge>
    case 'pending':
      return <Badge variant="info" size="md">En attente</Badge>
  }
}

const getBusinessTypeLabel = (type: string) => {
  const types: { [key: string]: string } = {
    individual: 'Entrepreneur individuel',
    sarl: 'SARL',
    sa: 'SA',
    association: 'Association',
    cooperative: 'Coopérative',
    other: 'Autre'
  }
  return types[type] || type
}

const getRegionLabel = (region: string) => {
  const regions: { [key: string]: string } = {
    bamako: 'Bamako (Mali)',
    dakar: 'Dakar (Sénégal)',
    accra: 'Accra (Ghana)',
    abidjan: 'Abidjan (Côte d\'Ivoire)',
    ouagadougou: 'Ouagadougou (Burkina Faso)',
    conakry: 'Conakry (Guinée)',
    niamey: 'Niamey (Niger)'
  }
  return regions[region] || region
}

const getCountryLabel = (code: string) => {
  const countries: { [key: string]: string } = {
    ML: 'Mali',
    SN: 'Sénégal',
    GH: 'Ghana',
    CI: 'Côte d\'Ivoire',
    BF: 'Burkina Faso',
    GN: 'Guinée',
    NE: 'Niger'
  }
  return countries[code] || code
}

export default function PartnerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [partner, setPartner] = useState<PartnerDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadPartner = async () => {
      setIsLoading(true)
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPartner(mockPartner)
      } catch (error) {
        console.error('Erreur lors du chargement du partenaire:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPartner()
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
                {partner.companyName}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {getBusinessTypeLabel(partner.businessType)} • {getRegionLabel(partner.region)}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline"
              onClick={() => router.push(`/partners/${params.id}/edit`)}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Modifier
            </Button>
            {getStatusBadge(partner.status)}
          </div>
        </div>

        {/* Stats rapides */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {partner.driversCount}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Chauffeurs actifs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {partner.totalRides}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Courses totales
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary-600">
                {new Intl.NumberFormat('fr-FR').format(partner.totalRevenue)} FCFA
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Chiffre d'affaires
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {partner.commission}%
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Commission
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
                    {partner.companyName}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    ID: {partner.id}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Type d'entreprise</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getBusinessTypeLabel(partner.businessType)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">N° d'enregistrement</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.registrationNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">N° fiscal</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.taxNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600 dark:text-neutral-400">Date d'adhésion</span>
                  <span className="font-medium text-neutral-900 dark:text-neutral-100">
                    {new Date(partner.joinedDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                {partner.website && (
                  <div className="flex items-center space-x-3 pt-2">
                    <GlobeAltIcon className="h-4 w-4 text-neutral-400" />
                    <a 
                      href={partner.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {partner.website}
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Contact principal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 mb-6">
                <Avatar 
                  fallback={`${partner.contactFirstName[0]}${partner.contactLastName[0]}`}
                  size="lg"
                />
                <div>
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                    {partner.contactFirstName} {partner.contactLastName}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {partner.contactPosition}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <EnvelopeIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">{partner.contactEmail}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <PhoneIcon className="h-4 w-4 text-neutral-400" />
                  <span className="text-neutral-900 dark:text-neutral-100">{partner.contactPhone}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Adresse</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.address}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Ville</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {partner.city}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Région</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getRegionLabel(partner.region)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400">Pays</p>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {getCountryLabel(partner.country)}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration partenaire</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Nombre max de chauffeurs</p>
                    <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                      {partner.maxDrivers}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-neutral-600 dark:text-neutral-400">Utilisé</p>
                    <p className="text-lg font-semibold text-primary-600">
                      {partner.driversCount}/{partner.maxDrivers}
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="w-full bg-neutral-200 dark:bg-neutral-700 rounded-full h-2">
                    <div 
                      className="bg-primary-600 h-2 rounded-full" 
                      style={{ width: `${(partner.driversCount / partner.maxDrivers) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">Taux de commission</p>
                <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  {partner.commission}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chauffeurs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <UsersIcon className="h-5 w-5 mr-2" />
                Chauffeurs ({partner.drivers.length})
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
              {partner.drivers.map((driver) => (
                <div 
                  key={driver.id}
                  className="flex items-center justify-between p-3 border border-neutral-200 dark:border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                  onClick={() => router.push(`/drivers/${driver.id}`)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar 
                      fallback={driver.name.split(' ').map(n => n[0]).join('')}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {driver.name}
                      </h4>
                      <p className="text-sm text-neutral-600 dark:text-neutral-400">
                        {driver.totalRides} courses • Note: {driver.rating}/5
                      </p>
                    </div>
                  </div>
                  <Badge variant={driver.status === 'active' ? 'success' : 'warning'} size="sm">
                    {driver.status === 'active' ? 'Actif' : 'Suspendu'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description et notes */}
        <div className="grid gap-6 lg:grid-cols-2">
          {partner.description && (
            <Card>
              <CardHeader>
                <CardTitle>Description de l'activité</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {partner.description}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {partner.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes internes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-lg">
                  <p className="text-neutral-700 dark:text-neutral-300">
                    {partner.notes}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

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
              onClick={() => router.push(`/drivers/new?partner=${partner.id}`)}
            >
              Ajouter un chauffeur
            </Button>
            <Button
              onClick={() => router.push(`/partners/${params.id}/edit`)}
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