'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  CheckCircleIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Select,
  Textarea
} from '@/components/ui'
import { PartnerPermissions } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'

interface PartnerFormData {
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
  maxDrivers: string
  commission: string
}

const businessTypeOptions = [
  { value: '', label: 'Sélectionner un type d\'entreprise' },
  { value: 'individual', label: 'Entrepreneur individuel' },
  { value: 'sarl', label: 'SARL' },
  { value: 'sa', label: 'SA' },
  { value: 'association', label: 'Association' },
  { value: 'cooperative', label: 'Coopérative' },
  { value: 'other', label: 'Autre' }
]

const regionOptions = [
  { value: '', label: 'Sélectionner une région' },
  { value: 'bamako', label: 'Bamako (Mali)' },
  { value: 'dakar', label: 'Dakar (Sénégal)' },
  { value: 'accra', label: 'Accra (Ghana)' },
  { value: 'abidjan', label: 'Abidjan (Côte d\'Ivoire)' },
  { value: 'ouagadougou', label: 'Ouagadougou (Burkina Faso)' },
  { value: 'conakry', label: 'Conakry (Guinée)' },
  { value: 'niamey', label: 'Niamey (Niger)' }
]

const countryOptions = [
  { value: '', label: 'Sélectionner un pays' },
  { value: 'ML', label: 'Mali' },
  { value: 'SN', label: 'Sénégal' },
  { value: 'GH', label: 'Ghana' },
  { value: 'CI', label: 'Côte d\'Ivoire' },
  { value: 'BF', label: 'Burkina Faso' },
  { value: 'GN', label: 'Guinée' },
  { value: 'NE', label: 'Niger' }
]

// Mock data - à remplacer par un appel API
const mockPartner = {
  id: '1',
  uuid: 'partner-uuid-1',
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
  maxDrivers: '50',
  commission: '15.0'
}

export default function EditPartnerPage() {
  const router = useRouter()
  const params = useParams()
  const partnerId = typeof params?.id === 'string' ? params.id : ''
  const { user } = useAuth()
  const { hasPermission, hasAllAccess } = usePermissions()

  const [partner, setPartner] = useState<typeof mockPartner | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>({
    companyName: '',
    businessType: '',
    registrationNumber: '',
    taxNumber: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contactPhone: '',
    contactPosition: '',
    address: '',
    city: '',
    region: '',
    country: '',
    postalCode: '',
    website: '',
    description: '',
    notes: '',
    maxDrivers: '',
    commission: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Permission helpers
  const isOwnPartner = (partnerData: typeof mockPartner) => {
    return user?.partnerId === partnerData.uuid
  }

  const canUpdateThisPartner = (partnerData: typeof mockPartner) => {
    if (hasAllAccess()) return true
    if (hasPermission(PartnerPermissions.UPDATE_PARTNER)) return true
    if (hasPermission(PartnerPermissions.UPDATE_OWN_PARTNER) && isOwnPartner(partnerData)) return true
    return false
  }

  useEffect(() => {
    const loadPartner = async () => {
      setIsLoading(true)
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setPartner(mockPartner)
        setFormData(mockPartner)
      } catch (error) {
        console.error('Erreur lors du chargement du partenaire:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadPartner()
  }, [partnerId])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartnerFormData, string>> = {}

    if (!formData.companyName.trim()) newErrors.companyName = 'Le nom de l\'entreprise est requis'
    if (!formData.businessType) newErrors.businessType = 'Le type d\'entreprise est requis'
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Le numéro d\'enregistrement est requis'
    if (!formData.contactFirstName.trim()) newErrors.contactFirstName = 'Le prénom du contact est requis'
    if (!formData.contactLastName.trim()) newErrors.contactLastName = 'Le nom du contact est requis'
    if (!formData.contactEmail.trim()) newErrors.contactEmail = 'L\'email du contact est requis'
    if (!formData.contactPhone.trim()) newErrors.contactPhone = 'Le téléphone du contact est requis'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'
    if (!formData.city.trim()) newErrors.city = 'La ville est requise'
    if (!formData.region) newErrors.region = 'La région est requise'
    if (!formData.country) newErrors.country = 'Le pays est requis'
    
    if (!formData.maxDrivers.trim()) {
      newErrors.maxDrivers = 'Le nombre maximum de chauffeurs est requis'
    } else if (isNaN(Number(formData.maxDrivers)) || Number(formData.maxDrivers) <= 0) {
      newErrors.maxDrivers = 'Veuillez entrer un nombre valide'
    }
    
    if (!formData.commission.trim()) {
      newErrors.commission = 'Le taux de commission est requis'
    } else if (isNaN(Number(formData.commission)) || Number(formData.commission) < 0 || Number(formData.commission) > 100) {
      newErrors.commission = 'Veuillez entrer un pourcentage entre 0 et 100'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.contactEmail && !emailRegex.test(formData.contactEmail)) {
      newErrors.contactEmail = 'Format d\'email invalide'
    }

    if (formData.website && formData.website.trim()) {
      const urlRegex = /^https?:\/\/.+/
      if (!urlRegex.test(formData.website)) {
        newErrors.website = 'L\'URL doit commencer par http:// ou https://'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check permission before updating
    if (!partner || !canUpdateThisPartner(partner)) {
      alert("Vous n'avez pas la permission de modifier ce partenaire")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Simulation d'appel API
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Succès - rediriger vers le profil du partenaire
      router.push(`/partners/${partnerId}?success=partner-updated`)
    } catch (error) {
      console.error('Erreur lors de la modification du partenaire:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
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

  // Check if user has permission to edit this partner
  if (partner && !canUpdateThisPartner(partner)) {
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
              Vous n'avez pas les permissions nécessaires pour modifier ce partenaire.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Permission requise: CAN_UPDATE_PARTNER ou CAN_UPDATE_OWN_PARTNER
            </p>
            <div className="mt-6">
              <Button onClick={() => router.back()}>
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour
              </Button>
            </div>
          </Card>
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
                Modifier le partenaire
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {formData.companyName}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations entreprise */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Informations entreprise
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom de l'entreprise *"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  error={errors.companyName}
                />
                <Select
                  label="Type d'entreprise *"
                  value={formData.businessType}
                  onChange={(e) => handleInputChange('businessType', e.target.value)}
                  options={businessTypeOptions}
                  error={errors.businessType}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Numéro d'enregistrement *"
                  value={formData.registrationNumber}
                  onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
                  error={errors.registrationNumber}
                />
                <Input
                  label="Numéro fiscal"
                  value={formData.taxNumber}
                  onChange={(e) => handleInputChange('taxNumber', e.target.value)}
                  error={errors.taxNumber}
                />
              </div>
              <Input
                label="Site web"
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                error={errors.website}
              />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  value={formData.contactFirstName}
                  onChange={(e) => handleInputChange('contactFirstName', e.target.value)}
                  error={errors.contactFirstName}
                />
                <Input
                  label="Nom *"
                  value={formData.contactLastName}
                  onChange={(e) => handleInputChange('contactLastName', e.target.value)}
                  error={errors.contactLastName}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                  error={errors.contactEmail}
                />
                <Input
                  label="Téléphone *"
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  error={errors.contactPhone}
                />
              </div>
              <Input
                label="Poste/Fonction"
                value={formData.contactPosition}
                onChange={(e) => handleInputChange('contactPosition', e.target.value)}
                error={errors.contactPosition}
              />
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
            <CardContent className="space-y-4">
              <Input
                label="Adresse *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ville *"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                />
                <Input
                  label="Code postal"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  error={errors.postalCode}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Région *"
                  value={formData.region}
                  onChange={(e) => handleInputChange('region', e.target.value)}
                  options={regionOptions}
                  error={errors.region}
                />
                <Select
                  label="Pays *"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  options={countryOptions}
                  error={errors.country}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Configuration partenaire</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nombre maximum de chauffeurs *"
                  type="number"
                  min="1"
                  value={formData.maxDrivers}
                  onChange={(e) => handleInputChange('maxDrivers', e.target.value)}
                  error={errors.maxDrivers}
                />
                <Input
                  label="Taux de commission (%) *"
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={formData.commission}
                  onChange={(e) => handleInputChange('commission', e.target.value)}
                  error={errors.commission}
                />
              </div>
            </CardContent>
          </Card>

          {/* Description et notes */}
          <Card>
            <CardHeader>
              <CardTitle>Informations complémentaires</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                label="Description de l'activité"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
              <Textarea
                label="Notes internes"
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6">
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
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                'Modification...'
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Enregistrer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}