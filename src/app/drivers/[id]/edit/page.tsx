'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  UserIcon,
  TruckIcon,
  CheckCircleIcon
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
import { ApiDriver, UpdateDriverRequest, UpdateVehicleInfoRequest } from '@/types'
import { driversService } from '@/services/drivers'

interface DriverFormData {
  firstname: string
  lastname: string
  email: string
  phone: string
  address?: string
  city?: string
  country?: string
  dob: string
  licenseNumber: string
  vehicleType: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: string
  vehicleColor: string
  plateNumber: string
  partnerId?: string
  active: boolean
}

const vehicleTypeOptions = [
  { value: '', label: 'Sélectionner un type de véhicule' },
  { value: 'CAR', label: 'Voiture' },
  { value: 'MOTORCYCLE', label: 'Moto' },
  { value: 'VAN', label: 'Van' },
  { value: 'TRUCK', label: 'Camion' },
]

const partnerOptions = [
  { value: '', label: 'Sélectionner un partenaire' },
  { value: '1', label: 'VTC Plus' },
  { value: '2', label: 'TransAfrica' },
  { value: '3', label: 'CityRide' },
]

const currentYear = new Date().getFullYear()
const vehicleYearOptions = [
  { value: '', label: 'Année du véhicule' },
  ...Array.from({ length: 30 }, (_, i) => ({
    value: String(currentYear - i),
    label: String(currentYear - i)
  }))
]


export default function EditDriverPage() {
  const router = useRouter()
  const params = useParams()
  const [formData, setFormData] = useState<DriverFormData>({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dob: '',
    licenseNumber: '',
    vehicleType: '',
    vehicleMake: '',
    vehicleModel: '',
    vehicleYear: '',
    vehicleColor: '',
    plateNumber: '',
    partnerId: '',
    active: true
  })

  const [errors, setErrors] = useState<Partial<Record<keyof DriverFormData, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadDriver = async () => {
      if (!params.id || typeof params.id !== 'string') return

      setIsLoading(true)
      setError(null)
      try {
        const driver = await driversService.getDriver(params.id)
        setFormData({
          firstname: driver.user.firstname,
          lastname: driver.user.lastname,
          email: driver.user.email,
          phone: driver.user.phone,
          address: driver.user.address || '',
          city: driver.user.city || '',
          country: driver.user.country || '',
          dob: driver.user.dob,
          licenseNumber: driver.licenseNumber || driver.licenseID,
          vehicleType: driver.vehicleType || '',
          vehicleMake: driver.vehicleInfo?.make || '',
          vehicleModel: driver.vehicleInfo?.model || '',
          vehicleYear: driver.vehicleInfo?.year?.toString() || '',
          vehicleColor: driver.vehicleInfo?.color || '',
          plateNumber: driver.vehicleInfo?.plateNumber || '',
          partnerId: driver.partnerId || '',
          active: driver.user.active
        })
      } catch (error) {
        console.error('Erreur lors du chargement du chauffeur:', error)
        setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
      } finally {
        setIsLoading(false)
      }
    }

    loadDriver()
  }, [params.id])

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof DriverFormData, string>> = {}

    if (!formData.firstname.trim()) newErrors.firstname = 'Le prénom est requis'
    if (!formData.lastname.trim()) newErrors.lastname = 'Le nom est requis'
    if (!formData.email.trim()) newErrors.email = 'L\'email est requis'
    if (!formData.phone.trim()) newErrors.phone = 'Le téléphone est requis'
    if (!formData.dob) newErrors.dob = 'La date de naissance est requise'
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'Le numéro de permis est requis'
    if (!formData.vehicleType) newErrors.vehicleType = 'Le type de véhicule est requis'

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !params.id || typeof params.id !== 'string') {
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const updateData: UpdateDriverRequest = {
        firstname: formData.firstname,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        dob: formData.dob,
        licenseNumber: formData.licenseNumber,
        vehicleType: formData.vehicleType,
        active: formData.active
      }

      if (formData.vehicleMake || formData.vehicleModel || formData.vehicleYear || formData.vehicleColor || formData.plateNumber) {
        const vehicleInfo: UpdateVehicleInfoRequest = {}
        if (formData.vehicleMake) vehicleInfo.make = formData.vehicleMake
        if (formData.vehicleModel) vehicleInfo.model = formData.vehicleModel
        if (formData.vehicleYear) vehicleInfo.year = parseInt(formData.vehicleYear)
        if (formData.vehicleColor) vehicleInfo.color = formData.vehicleColor
        if (formData.plateNumber) vehicleInfo.plateNumber = formData.plateNumber
        updateData.vehicleInfo = vehicleInfo
      }

      if (formData.partnerId) {
        updateData.partnerId = formData.partnerId
      }

      await driversService.updateDriver(params.id, updateData)
      router.push(`/drivers/${params.id}?success=driver-updated`)
    } catch (error) {
      console.error('Erreur lors de la modification du chauffeur:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof DriverFormData, value: string) => {
    if (field === 'active') {
      setFormData(prev => ({ ...prev, [field]: value === 'true' }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
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
                Modifier le chauffeur
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400 mt-2">
                {formData.firstname} {formData.lastname}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Informations personnelles */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Prénom *"
                  value={formData.firstname}
                  onChange={(e) => handleInputChange('firstname', e.target.value)}
                  error={errors.firstname}
                />
                <Input
                  label="Nom *"
                  value={formData.lastname}
                  onChange={(e) => handleInputChange('lastname', e.target.value)}
                  error={errors.lastname}
                />
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Date de naissance *"
                  type="date"
                  value={formData.dob}
                  onChange={(e) => handleInputChange('dob', e.target.value)}
                  error={errors.dob}
                />
                <Input
                  label="Numéro de permis *"
                  value={formData.licenseNumber}
                  onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                  error={errors.licenseNumber}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Adresse"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  error={errors.address}
                />
                <Input
                  label="Ville"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  error={errors.city}
                />
                <Input
                  label="Pays"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  error={errors.country}
                />
              </div>
            </CardContent>
          </Card>

          {/* Informations véhicule */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TruckIcon className="h-5 w-5 mr-2" />
                Informations véhicule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Type de véhicule *"
                  value={formData.vehicleType}
                  onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                  options={vehicleTypeOptions}
                  error={errors.vehicleType}
                />
                <Input
                  label="Marque *"
                  value={formData.vehicleMake}
                  onChange={(e) => handleInputChange('vehicleMake', e.target.value)}
                  error={errors.vehicleMake}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Modèle *"
                  value={formData.vehicleModel}
                  onChange={(e) => handleInputChange('vehicleModel', e.target.value)}
                  error={errors.vehicleModel}
                />
                <Select
                  label="Année *"
                  value={formData.vehicleYear}
                  onChange={(e) => handleInputChange('vehicleYear', e.target.value)}
                  options={vehicleYearOptions}
                  error={errors.vehicleYear}
                />
                <Input
                  label="Couleur"
                  value={formData.vehicleColor}
                  onChange={(e) => handleInputChange('vehicleColor', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Plaque d'immatriculation *"
                  value={formData.plateNumber}
                  onChange={(e) => handleInputChange('plateNumber', e.target.value)}
                  error={errors.plateNumber}
                />
                <Select
                  label="Partenaire"
                  value={formData.partnerId}
                  onChange={(e) => handleInputChange('partnerId', e.target.value)}
                  options={partnerOptions}
                  error={errors.partnerId}
                />
              </div>
            </CardContent>
          </Card>

          {/* Statut */}
          <Card>
            <CardHeader>
              <CardTitle>Statut du chauffeur</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                label="Statut *"
                value={formData.active ? 'true' : 'false'}
                onChange={(e) => handleInputChange('active', e.target.value === 'true' ? 'true' : 'false')}
                options={[
                  { value: 'true', label: 'Actif' },
                  { value: 'false', label: 'Inactif' }
                ]}
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