'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  BuildingOfficeIcon,
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
import { PartnerPermissions } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
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
  { value: 'PENDING', label: 'En attente' },
  { value: 'SUSPENDED', label: 'Suspendu' },
]

export default function NewPartnerPage() {
  const router = useRouter()
  const { hasPermission, hasAllAccess } = usePermissions()

  // Permission check
  const canCreatePartner = hasAllAccess() || hasPermission(PartnerPermissions.CREATE_PARTNER)

  const [formData, setFormData] = useState<PartnerFormData>({
    name: '',
    shortName: '',
    status: 'ACTIVE',
    email: '',
    phone: '',
    companyIdentifier: '',
    address: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof PartnerFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof PartnerFormData, string>> = {}

    if (!formData.name.trim()) newErrors.name = 'Le nom est requis'
    if (!formData.shortName.trim()) newErrors.shortName = 'Le nom court est requis'
    if (!formData.status) newErrors.status = 'Le statut est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.companyIdentifier.trim()) newErrors.companyIdentifier = 'L\'identifiant entreprise est requis'
    if (!formData.address.trim()) newErrors.address = 'L\'adresse est requise'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check permission before creating
    if (!canCreatePartner) {
      alert("Vous n'avez pas la permission de créer un partenaire")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const partnerData = {
        name: formData.name,
        shortName: formData.shortName,
        status: formData.status,
        email: formData.email,
        phone: formData.phone,
        companyIdentifier: formData.companyIdentifier,
        address: formData.address
      }

      await partnersService.createPartner(partnerData)
      
      // Succès - rediriger vers la liste des partenaires
      router.push('/partners?success=partner-created')
    } catch (error) {
      console.error('Erreur lors de la création du partenaire:', error)
      alert(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof PartnerFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // Check if user has permission to access this page
  if (!canCreatePartner) {
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
              Vous n'avez pas les permissions nécessaires pour créer un partenaire.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Permission requise: CAN_CREATE_PARTNER
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
                Nouveau partenaire
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                Ajouter un nouveau partenaire au réseau VTC
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
                Informations partenaire
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Nom complet *"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  error={errors.name}
                  placeholder="Express Voyages Cameroun"
                />
                <Input
                  label="Nom court *"
                  value={formData.shortName}
                  onChange={(e) => handleInputChange('shortName', e.target.value)}
                  error={errors.shortName}
                  placeholder="EVC"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Statut *"
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={statusOptions}
                  error={errors.status}
                />
                <Input
                  label="Identifiant entreprise *"
                  value={formData.companyIdentifier}
                  onChange={(e) => handleInputChange('companyIdentifier', e.target.value)}
                  error={errors.companyIdentifier}
                  placeholder="EVC-CMR-2025"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Email *"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  error={errors.email}
                  placeholder="contact@expressvoyages.cm"
                />
                <Input
                  label="Téléphone *"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  error={errors.phone}
                  placeholder="+237699112233"
                />
              </div>
              <Input
                label="Adresse *"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                error={errors.address}
                placeholder="Avenue Kennedy, Yaoundé, Cameroun"
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
                'Création...'
              ) : (
                <>
                  <CheckCircleIcon className="h-4 w-4 mr-2" />
                  Créer le partenaire
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}