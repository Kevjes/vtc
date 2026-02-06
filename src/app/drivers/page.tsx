'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  ShieldCheckIcon
} from '@heroicons/react/24/outline'
import { StarIcon } from '@heroicons/react/24/solid'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Badge, Avatar, Modal } from '@/components/ui'
import { driversService } from '@/services/drivers'
import { DriverPermissions } from '@/types'
import type { ApiDriver } from '@/types'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'

const getStatusBadge = (active: boolean) => {
  return active
    ? <Badge variant="success" size="sm">Actif</Badge>
    : <Badge variant="warning" size="sm">Inactif</Badge>
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

export default function DriversPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllAccess } = usePermissions()

  const [drivers, setDrivers] = useState<ApiDriver[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<ApiDriver | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Permission checks
  const canViewDrivers = hasAllAccess() || hasAnyPermission([
    DriverPermissions.READ_ANY_DRIVER,
    DriverPermissions.READ_DRIVER,
    DriverPermissions.READ_OWN_DRIVER
  ])
  const canCreateDriver = hasAllAccess() || hasPermission(DriverPermissions.CREATE_DRIVER)
  const canUpdateDriver = hasAllAccess() || hasPermission(DriverPermissions.UPDATE_DRIVER)
  const canUpdateOwnDriver = hasAllAccess() || hasPermission(DriverPermissions.UPDATE_OWN_DRIVER)
  const canDeleteDriver = hasAllAccess() || hasPermission(DriverPermissions.DELETE_DRIVER)
  const canDeleteOwnDriver = hasAllAccess() || hasPermission(DriverPermissions.DELETE_OWN_DRIVER)

  // Helper to check if driver belongs to current user
  const isOwnDriver = (targetDriver: ApiDriver) => {
    return user?.uuid === targetDriver.user?.uuid
  }

  // Helper to check if user can update a specific driver
  const canUpdateThisDriver = (targetDriver: ApiDriver) => {
    if (hasAllAccess() || canUpdateDriver) return true
    if (canUpdateOwnDriver && isOwnDriver(targetDriver)) return true
    return false
  }

  // Helper to check if user can delete a specific driver
  const canDeleteThisDriver = (targetDriver: ApiDriver) => {
    if (hasAllAccess() || canDeleteDriver) return true
    if (canDeleteOwnDriver && isOwnDriver(targetDriver)) return true
    return false
  }

  const pageSize = 10

  useEffect(() => {
    // Wait for user to be loaded before fetching drivers
    if (user) {
      loadDrivers()
    }
  }, [currentPage, searchTerm, filterStatus, user])

  const loadDrivers = async () => {
    try {
      setLoading(true)
      setError(null)

      // Build SpringFilter query based on permissions
      let springFilter = searchTerm || ''

      // If user only has READ_OWN_DRIVER permission, filter by their UUID
      const hasReadAny = hasAllAccess() || hasPermission(DriverPermissions.READ_ANY_DRIVER)
      const hasReadGeneral = hasAllAccess() || hasPermission(DriverPermissions.READ_DRIVER)
      const hasReadOwn = hasPermission(DriverPermissions.READ_OWN_DRIVER)

      if (!hasReadAny && !hasReadGeneral && hasReadOwn && user?.uuid) {
        // User can only see their own driver profile
        const ownDriverFilter = `user.uuid : '${user.uuid}'`
        if (springFilter) {
          springFilter = `(${springFilter}) and ${ownDriverFilter}`
        } else {
          springFilter = ownDriverFilter
        }
      }

      const response = await driversService.getDrivers({
        page: currentPage,
        size: pageSize,
        filter: springFilter || undefined,
        active: filterStatus === 'all' ? undefined : filterStatus === 'active'
      })
      setDrivers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Erreur lors du chargement des chauffeurs:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleViewDriver = (driverUuid: string) => {
    router.push(`/drivers/${driverUuid}`)
  }

  const handleEditDriver = (driverUuid: string) => {
    router.push(`/drivers/${driverUuid}/edit`)
  }

  const handleDeleteDriver = (driver: ApiDriver) => {
    // Check permission before showing delete modal
    if (!canDeleteThisDriver(driver)) {
      setError("Vous n'avez pas la permission de supprimer ce chauffeur")
      return
    }
    setSelectedDriver(driver)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedDriver) return

    // Double check permission before deletion
    if (!canDeleteThisDriver(selectedDriver)) {
      setError("Vous n'avez pas la permission de supprimer ce chauffeur")
      setShowDeleteModal(false)
      return
    }

    try {
      setLoading(true)
      await driversService.deleteDriver(selectedDriver.uuid)
      setShowDeleteModal(false)
      setSelectedDriver(null)
      await loadDrivers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const toggleDriverStatus = async (driver: ApiDriver) => {
    try {
      setLoading(true)
      await driversService.updateDriverStatus(driver.uuid, !driver.user.active)
      await loadDrivers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour')
    } finally {
      setLoading(false)
    }
  }

  const activeDriversCount = drivers.filter(d => d.user.active).length
  const inactiveDriversCount = drivers.filter(d => !d.user.active).length

  // Check if user has permission to view this page
  if (!canViewDrivers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <div className="mb-4">
              <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Accès non autorisé</h2>
            <p className="text-neutral-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à la gestion des chauffeurs.
            </p>
            <p className="text-sm text-neutral-500">
              Permissions requises: CAN_READ_ANY_DRIVER, CAN_READ_DRIVER ou CAN_READ_OWN_DRIVER
            </p>
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
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Chauffeurs
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Gérez les chauffeurs de votre plateforme
            </p>
          </div>
          {canCreateDriver && (
            <Button onClick={() => router.push('/drivers/new')}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouveau chauffeur
            </Button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un chauffeur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </Button>
            </div>

            {showFilters && (
              <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={filterStatus === 'all' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('all')}
                  >
                    Tous ({totalElements})
                  </Button>
                  <Button
                    variant={filterStatus === 'active' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('active')}
                  >
                    Actifs ({activeDriversCount})
                  </Button>
                  <Button
                    variant={filterStatus === 'inactive' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('inactive')}
                  >
                    Inactifs ({inactiveDriversCount})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Drivers Table */}
        <Card>
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Liste des chauffeurs ({totalElements})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Chauffeur
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Véhicule
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Note
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Partenaire
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="text-right py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Chargement...
                    </td>
                  </tr>
                ) : drivers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Aucun chauffeur trouvé avec ces critères'
                        : 'Aucun chauffeur trouvé'
                      }
                    </td>
                  </tr>
                ) : (
                  drivers.map((driver) => (
                    <tr
                      key={driver.uuid}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                      onClick={() => handleViewDriver(driver.uuid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            src={driver.user.profileImage}
                            fallback={`${driver.user.firstname[0]}${driver.user.lastname[0]}`}
                            size="md"
                            className="mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {driver.user.firstname} {driver.user.lastname}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {driver.licenseID}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {driver.user.email}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {driver.user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {driver.status}
                        </div>
                        {driver.vehicleInfo && (
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {driver.vehicleInfo.make} {driver.vehicleInfo.model}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {driver.rating ? (
                          <div className="flex items-center">
                            <StarIcon className="h-4 w-4 text-yellow-500 mr-1" />
                            <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {driver.rating.toFixed(1)}
                            </span>
                            {driver.totalRides && (
                              <span className="text-sm text-neutral-500 dark:text-neutral-400 ml-1">
                                ({driver.totalRides})
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pas encore noté
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {driver.partner?.name || 'Indépendant'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(driver.user.active)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewDriver(driver.uuid)
                            }}
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          {canUpdateThisDriver(driver) && (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEditDriver(driver.uuid)
                                }}
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  toggleDriverStatus(driver)
                                }}
                                title={driver.user.active ? "Désactiver" : "Activer"}
                              >
                                <span className="text-sm">
                                  {driver.user.active ? "Désactiver" : "Activer"}
                                </span>
                              </Button>
                            </>
                          )}
                          {canDeleteThisDriver(driver) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteDriver(driver)
                              }}
                              title="Supprimer"
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-6 py-3 border-t border-neutral-200 dark:border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-neutral-500 dark:text-neutral-400">
                  Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} chauffeurs
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                    disabled={currentPage === 0}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                    disabled={currentPage === totalPages - 1}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              Êtes-vous sûr de vouloir supprimer le chauffeur{' '}
              <span className="font-medium">
                {selectedDriver?.user.firstname} {selectedDriver?.user.lastname}
              </span> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible et supprimera toutes les données associées.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? 'Suppression...' : 'Supprimer'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}