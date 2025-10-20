'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Select } from '@/components/ui'
import { driversService } from '@/services/drivers'
import type { CreateDriverRequest, CreateVehicleInfoRequest, CreateInsuranceRequest } from '@/types'

interface DriverFormData {
  // Informations personnelles
  firstname: string
  lastname: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  countryISO: string
  dob: string
  licenseNumber: string

  // Informations véhicule
  vehicleType: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number | ''
  vehicleColor: string
  plateNumber: string

  // Assurance
  insuranceProvider: string
  insurancePolicyNumber: string
  insuranceExpirationDate: string

  // Partenaire
  partnerId: string

  // Statut
  active: boolean
}

const vehicleTypeOptions = [
  { value: '', label: 'Sélectionner un type de véhicule' },
  { value: 'CAR', label: 'Voiture' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'VAN', label: 'Van' },
  { value: 'TRUCK', label: 'Camion' },
]

const countryOptions = [
  { value: '', label: 'Sélectionner un pays' },
  { value: 'Mali', label: 'Mali' },
  { value: 'Sénégal', label: 'Sénégal' },
  { value: 'Burkina Faso', label: 'Burkina Faso' },
  { value: 'Côte d\'Ivoire', label: 'Côte d\'Ivoire' },
]

const countryISOOptions = [
  { value: '', label: 'Code pays' },
  { value: 'ML', label: 'ML (Mali)' },
  { value: 'SN', label: 'SN (Sénégal)' },
  { value: 'BF', label: 'BF (Burkina Faso)' },
  { value: 'CI', label: 'CI (Côte d\'Ivoire)' },
]

const currentYear = new Date().getFullYear()
const vehicleYearOptions = [
  { value: '', label: 'Année du véhicule' },
  ...Array.from({ length: 30 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }))
]

export default function NewDriverPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<DriverFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    countryISO: '',
    dob: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    plateNumber: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    insuranceExpirationDate: '',
    partnerId: '',
    active: true
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
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Le numéro de permis est requis'
    if (!formData.vehicleType) newErrors.vehicleType = 'Le type de véhicule est requis'
    if (!formData.countryISO) newErrors.countryISO = 'Le code pays est requis'

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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const vehicleInfo: CreateVehicleInfoRequest | undefined =
        formData.vehicleMake || formData.vehicleModel || formData.vehicleYear || formData.vehicleColor || formData.plateNumber
          ? {
              make: formData.vehicleMake,
              model: formData.vehicleModel,
              year: Number(formData.vehicleYear) || new Date().getFullYear(),
              color: formData.vehicleColor,
              plateNumber: formData.plateNumber,
              insurance: formData.insuranceProvider ? {
                provider: formData.insuranceProvider,
                policyNumber: formData.insurancePolicyNumber,
                expirationDate: formData.insuranceExpirationDate
              } : undefined
            }
          : undefined

      const driverData: CreateDriverRequest = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address || undefined,
        city: formData.city || undefined,
        country: formData.country || undefined,
        countryISO: formData.countryISO,
        dob: formData.dob,
        licenseNumber: formData.licenseNumber,
        vehicleType: formData.vehicleType,
        vehicleInfo,
        partnerId: formData.partnerId || undefined,
        active: formData.active
      }

      await driversService.createDriver(driverData)

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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="email@exemple.com"
                    error={errors.email}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Téléphone *
                  </label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="+223 XX XX XX XX"
                    error={errors.phone}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    value={formData.countryISO}
                    onChange={(e) => handleInputChange('countryISO', e.target.value)}
                    options={countryISOOptions}
                    error={errors.countryISO}
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
                    placeholder="Adresse complète"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Ville"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Numéro de permis *
                </label>
                <Input
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  placeholder="Numéro de permis de conduire"
                  error={errors.licenseNumber}
                />
              </div>
            </div>
          </Card>

          {/* Informations véhicule */}
          <Card>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <TruckIcon className="h-5 w-5 text-neutral-500" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Informations véhicule
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Type de véhicule *
                </label>
                <Select
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  options={vehicleTypeOptions}
                  error={errors.vehicleType}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Marque
                  </label>
                  <Input
                    value={formData.vehicleMake}
                    onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                    placeholder="Toyota, Peugeot..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Modèle
                  </label>
                  <Input
                    value={formData.vehicleModel}
                    onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                    placeholder="Corolla, 208..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Année
                  </label>
                  <Select
                    value={formData.vehicleYear.toString()}
                    onChange={(e) => handleInputChange('vehicleYear', e.target.value ? parseInt(e.target.value) : '')}
                    options={vehicleYearOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Couleur
                  </label>
                  <Input
                    value={formData.vehicleColor}
                    onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                    placeholder="Blanc, Noir, Rouge..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Plaque d'immatriculation
                  </label>
                  <Input
                    value={formData.plateNumber}
                    onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                    placeholder="ABC-123-ML"
                  />
                </div>
              </div>

              {/* Assurance */}
              <div className="border-t border-neutral-200 dark:border-neutral-700 pt-4">
                <h4 className="text-md font-medium text-neutral-900 dark:text-neutral-100 mb-3">
                  Assurance (optionnel)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Assureur
                    </label>
                    <Input
                      value={formData.insuranceProvider}
                      onChange={(e) => handleInputChange('insuranceProvider', e.target.value)}
                      placeholder="Nom de l'assureur"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Numéro de police
                    </label>
                    <Input
                      value={formData.insurancePolicyNumber}
                      onChange={(e) => handleInputChange('insurancePolicyNumber', e.target.value)}
                      placeholder="Numéro de police"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Date d'expiration
                    </label>
                    <Input
                      type="date"
                      value={formData.insuranceExpirationDate}
                      onChange={(e) => handleInputChange('insuranceExpirationDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Paramètres */}
          <Card>
            <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-neutral-500" />
                <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
                  Paramètres
                </h3>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.active}
                    onChange={(e) => handleInputChange('active', e.target.checked)}
                    className="rounded border-neutral-300 dark:border-neutral-600"
                  />
                  <span className="text-sm text-neutral-700 dark:text-neutral-300">
                    Chauffeur actif
                  </span>
                </label>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                  Les chauffeurs actifs peuvent recevoir des courses
                </p>
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