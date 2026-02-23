'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Select } from '@/components/ui'
import { driversService } from '@/services/drivers'
import { DriverPermissions } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'

interface DriverFormData {
  // Informations personnelles
  firstname: string
  lastname: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  countryCode: string
  dob: string
  
  // Informations permis
  licenseID: string
  issueDate: string
  expiryDate: string
  issuedAt: string
  status: string
}

const countryOptions = [
  { value: '', label: 'Sélectionner un pays' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Cameroon', label: 'Cameroun' },
  { value: 'Sénégal', label: 'Sénégal' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Côte d\'Ivoire', label: 'Côte d\'Ivoire' },
]

const countryCodeOptions = [
  { value: '', label: 'Code pays' },
  { value: 'ML', label: 'ML (Mali)' },
  { value: 'CM', label: 'CM (Cameroun)' },
  { value: 'SN', label: 'SN (Sénégal)' },
  { value: 'BF', label: 'BF (Burkina Faso)' },
  { value: 'CI', label: 'CI (Côte d\'Ivoire)' },
]

const statusOptions = [
  { value: '', label: 'Sélectionner un statut' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'APPROVED', label: 'Approuvé' },
  { value: 'REJECTED', label: 'Rejeté' },
  { value: 'EXPIRED', label: 'Expiré' },
]

export default function NewDriverPage() {
  const router = useRouter()
  const { hasPermission, hasAllAccess } = usePermissions()

  // Permission check
  const canCreateDriver = hasAllAccess() || hasPermission(DriverPermissions.CREATE_DRIVER)

  const [formData, setFormData] = useState<DriverFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    countryCode: '',
    dob: '',
    licenseID: '',
    issueDate: '',
    expiryDate: '',
    issuedAt: '',
    status: 'PENDING'
  })

  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DriverFormData, string>> = {}

    if (!formData.firstname.trim()) newErrors.firstname = 'Le prénom est requis'
    if (!formData.lastname.trim()) newErrors.lastname = 'Le nom est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.dob) newErrors.dob = 'La date de naissance est requise'
    if (!formData.licenseID.trim()) newErrors.licenseID = 'Le numéro de permis est requis'
    if (!formData.issueDate) newErrors.issueDate = 'La date d\'émission est requise'
    if (!formData.expiryDate) newErrors.expiryDate = 'La date d\'expiration est requise'
    if (!formData.issuedAt.trim()) newErrors.issuedAt = 'Le lieu d\'émission est requis'
    if (!formData.countryCode) newErrors.countryCode = 'Le code pays est requis'

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    // Date validation
    if (formData.dob) {
      const birthDate = new Date(formData.dob)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      if (age < 18) {
        newErrors.dob = 'Le chauffeur doit être majeur (18 ans minimum)'
      }
    }

    // License dates validation
    if (formData.issueDate && formData.expiryDate) {
      const issue = new Date(formData.issueDate)
      const expiry = new Date(formData.expiryDate)
      if (expiry <= issue) {
        newErrors.expiryDate = 'La date d\'expiration doit être après la date d\'émission'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check permission before creating
    if (!canCreateDriver) {
      setError("Vous n'avez pas la permission de créer un chauffeur")
      return
    }

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const driverData = {
        phone: formData.phone,
        lastname: formData.lastname,
        firstname: formData.firstname,
        dob: formData.dob,
        email: formData.email,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        countryCode: formData.countryCode,
        licenseID: formData.licenseID,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        issuedAt: formData.issuedAt,
        status: formData.status
      }

      await driversService.createDriver(driverData as any)

      // Succès - rediriger vers la liste des chauffeurs
      router.push('/drivers?success=driver-created')
    } catch (error) {
      console.error('Erreur lors de la création du chauffeur:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof DriverFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }))
    }
  }

  // Check if user has permission to access this page
  if (!canCreateDriver) {
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
              Vous n'avez pas les permissions nécessaires pour créer un chauffeur.
            </p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
              Permission requise: CAN_CREATE_DRIVER
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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Nouveau chauffeur
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Ajoutez un nouveau chauffeur à la plateforme
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informations personnelles */}
          <Card>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <UserIcon className="h-5 w-5 text-neutral-500" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Informations personnelles
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Prénom *
                  </label>
                  <Input
                    value={formData.firstname}
                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                    placeholder="Prénom du chauffeur"
                    error={errors.firstname}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom *
                  </label>
                  <Input
                    value={formData.lastname}
                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                    placeholder="Nom du chauffeur"
                    error={errors.lastname}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="landryjohn2000@gmail.com"
                  error={errors.email}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date de naissance *
                  </label>
                  <Input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => handleInputChange('dob', e.target.value)}
                    error={errors.dob}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Téléphone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+221926564286"
                    error={errors.phone}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Pays
                  </label>
                  <Select
                    value={formData.country}
                    onChange={(e) => handleInputChange('country', e.target.value)}
                    options={countryOptions}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Code pays *
                  </label>
                  <Select
                    value={formData.countryCode}
                    onChange={(e) => handleInputChange('countryCode', e.target.value)}
                    options={countryCodeOptions}
                    error={errors.countryCode}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Adresse
                  </label>
                  <Input
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder="123 Avenue de la Liberté"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Douala"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Informations permis de conduire */}
          <Card>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-neutral-500" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Informations permis de conduire
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Numéro de permis *
                </label>
                <Input
                  value={formData.licenseID}
                  onChange={(e) => handleInputChange('licenseID', e.target.value)}
                  placeholder="CM-DRV-123458"
                  error={errors.licenseID}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date d'émission *
                  </label>
                  <Input
                    type="date"
                    value={formData.issueDate}
                    onChange={(e) => handleInputChange('issueDate', e.target.value)}
                    error={errors.issueDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Date d'expiration *
                  </label>
                  <Input
                    type="date"
                    value={formData.expiryDate}
                    onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                    error={errors.expiryDate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Lieu d'émission *
                  </label>
                  <Input
                    value={formData.issuedAt}
                    onChange={(e) => handleInputChange('issuedAt', e.target.value)}
                    placeholder="Douala"
                    error={errors.issuedAt}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Statut du permis *
                </label>
                <Select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  options={statusOptions}
                />
              </div>
            </div>
          </Card>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
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
              {isSubmitting ? 'Création...' : 'Créer le chauffeur'}
            </Button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}