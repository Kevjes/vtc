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
  Select
} from '@/components/ui'
import { PartnerPermissions, ApiPartner, UpdatePartnerRequest } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import { partnersService } from '@/services/partners'

interface PartnerFormData {
  name: string
  shortName: string
  status: string
  email: string
  phone: string
  companyIdentifier: string
  address: string
}

const statusOptions = [
  { value: '', label: 'Sélectionner un statut' },
  { value: 'ACTIVE', label: 'Actif' },
  { value: 'INACTIVE', label: 'Inactif' },
  { value: 'SUSPENDED', label: 'Suspendu' },
  { value: 'PENDING', label: 'En attente' }
]

export default function EditPartnerPage() {
  const router = useRouter()
  const params = useParams()
  const partnerId = typeof params?.id === 'string' ? params.id : ''
  const { user } = useAuth()
  const { hasPermission, hasAllAccess } = usePermissions()

  const [partner, setPartner] = useState<ApiPartner | null>(null)
  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    shortName: '',
    status: '',
    email: '',
    phone: '',
    companyIdentifier: '',
    address: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  // Permission helpers
  const isOwnPartner = (partnerData: ApiPartner) => {
    return user?.partnerId === partnerData.uuid
  }

  const canUpdateThisPartner = (partnerData: ApiPartner) => {
    if (hasAllAccess()) return true
    if (hasPermission(PartnerPermissions.UPDATE_PARTNER)) return true
    if (hasPermission(PartnerPermissions.UPDATE_OWN_PARTNER) && isOwnPartner(partnerData)) return true
    return false
  }

  useEffect(() => {
    const loadPartner = async () => {
      if (!partnerId) {
        setLoadError('ID du partenaire manquant')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError(null)
      
      try {
        const data = await partnersService.getPartner(partnerId)
        setPartner(data)
        setFormData({
          name: data.name || '',
          shortName: data.shortName || '',
          status: data.status || '',
          email: data.email || '',
          phone: data.phone || '',
          companyIdentifier: data.companyIdentifier || '',
          address: data.address || ''
        })
      } catch (error) {
        console.error('Erreur lors du chargement du partenaire:', error)
        setLoadError(error instanceof Error ? error.message : 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    loadPartner()
  }, [partnerId])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartnerFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.shortName.trim()) newErrors.shortName = 'Le nom court est requis'
    if (!formData.status) newErrors.status = 'Le statut est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.companyIdentifier.trim()) newErrors.companyIdentifier = 'L\'identifiant entreprise est requis'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
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
      const updateData: UpdatePartnerRequest = {
        name: formData.name,
        shortName: formData.shortName,
        status: formData.status as any,
        email: formData.email,
        phone: formData.phone,
        companyIdentifier: formData.companyIdentifier,
        address: formData.address
      }

      await partnersService.updatePartner(partnerId, updateData)

      // Succès - rediriger vers le profil du partenaire
      router.push(`/partners/${partnerId}`)
    } catch (error) {
      console.error('Erreur lors de la modification du partenaire:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la modification')
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

  if (loadError) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-2">
              Erreur
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-4">
              {loadError}
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
                {formData.name}
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
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                />
                <Input
                  label="Nom court *"
                  value={formData.shortName}
                  onChange={(e) => handleInputChange('shortName', e.target.value)}
                  error={errors.shortName}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Identifiant entreprise *"
                  value={formData.companyIdentifier}
                  onChange={(e) => handleInputChange('companyIdentifier', e.target.value)}
                  error={errors.companyIdentifier}
                />
                <Select
                  label="Statut *"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={statusOptions}
                  error={errors.status}
                />
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                />
                <Input
                  label="Téléphone *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                />
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
            <CardContent className="space-y-4">
              <Input
                label="Adresse *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
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
