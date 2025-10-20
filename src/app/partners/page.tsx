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
  BuildingOfficeIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button, Input, Badge, Avatar, Modal } from '@/components/ui'
import { partnersService } from '@/services/partners'
import type { ApiPartner } from '@/types'

const getStatusBadge = (status: string) => {
  switch (status?.toUpperCase()) {
    case 'ACTIVE':
      return <Badge variant="success" size="sm">Actif</Badge>
    case 'SUSPENDED':
      return <Badge variant="warning" size="sm">Suspendu</Badge>
    case 'PENDING':
      return <Badge variant="info" size="sm">En attente</Badge>
    default:
      return <Badge variant="default" size="sm">{status}</Badge>
  }
}

export default function PartnersPage() {
  const router = useRouter()
  const [partners, setPartners] = useState<ApiPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'SUSPENDED' | 'PENDING'>('all')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<ApiPartner | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const pageSize = 10

  useEffect(() => {
    loadPartners()
  }, [currentPage, searchTerm, filterStatus])

  const loadPartners = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await partnersService.getPartners({
        page: currentPage,
        size: pageSize,
        filter: searchTerm || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      setPartners(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Erreur lors du chargement des partenaires:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  // Filter partners based on search and status (client-side for additional filtering)
  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.address.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus

    return matchesSearch && matchesStatus
  })

  const handleViewPartner = (partnerUuid: string) => {
    router.push(`/partners/${partnerUuid}`)
  }

  const handleEditPartner = (partnerUuid: string) => {
    router.push(`/partners/${partnerUuid}/edit`)
  }

  const handleDeletePartner = (partner: ApiPartner) => {
    setSelectedPartner(partner)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!selectedPartner) return
    try {
      setLoading(true)
      await partnersService.deletePartner(selectedPartner.uuid)
      setShowDeleteModal(false)
      setSelectedPartner(null)
      await loadPartners()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const activePartnersCount = filteredPartners.filter(p => p.status === 'ACTIVE').length
  const pendingPartnersCount = filteredPartners.filter(p => p.status === 'PENDING').length
  const suspendedPartnersCount = filteredPartners.filter(p => p.status === 'SUSPENDED').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Partenaires
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Gérez les partenaires de votre réseau VTC
            </p>
          </div>
          <Button onClick={() => router.push('/partners/new')}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouveau partenaire
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-primary-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Total</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{totalElements}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-green-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Actifs</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{activePartnersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-blue-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">En attente</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{pendingPartnersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                  <div className="h-4 w-4 bg-yellow-600 rounded-full"></div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">Suspendus</p>
                  <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">{suspendedPartnersCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher un partenaire..."
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
                    variant={filterStatus === 'ACTIVE' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('ACTIVE')}
                  >
                    Actifs ({activePartnersCount})
                  </Button>
                  <Button
                    variant={filterStatus === 'PENDING' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('PENDING')}
                  >
                    En attente ({pendingPartnersCount})
                  </Button>
                  <Button
                    variant={filterStatus === 'SUSPENDED' ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setFilterStatus('SUSPENDED')}
                  >
                    Suspendus ({suspendedPartnersCount})
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Partners Table */}
        <Card>
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">
              Liste des partenaires ({totalElements})
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Partenaire
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Identifiant
                  </th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Adresse
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
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredPartners.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      {searchTerm || filterStatus !== 'all'
                        ? 'Aucun partenaire trouvé avec ces critères'
                        : 'Aucun partenaire trouvé'
                      }
                    </td>
                  </tr>
                ) : (
                  filteredPartners.map((partner) => (
                    <tr
                      key={partner.uuid}
                      className="hover:bg-neutral-50 dark:hover:bg-neutral-800 cursor-pointer"
                      onClick={() => handleViewPartner(partner.uuid)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Avatar
                            fallback={partner.shortName}
                            size="md"
                            className="mr-3"
                          />
                          <div>
                            <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                              {partner.name}
                            </div>
                            <div className="text-sm text-neutral-500 dark:text-neutral-400">
                              {partner.shortName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {partner.email}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {partner.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {partner.companyIdentifier}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          Code: {partner.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {partner.address}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(partner.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleViewPartner(partner.uuid)
                            }}
                            title="Voir les détails"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEditPartner(partner.uuid)
                            }}
                            title="Modifier (Non disponible)"
                            disabled={true}
                            className="opacity-50 cursor-not-allowed"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeletePartner(partner)
                            }}
                            title="Supprimer (Non disponible)"
                            disabled={true}
                            className="text-red-600 hover:text-red-700 opacity-50 cursor-not-allowed"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
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
                  Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} partenaires
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
              Êtes-vous sûr de vouloir supprimer le partenaire{' '}
              <span className="font-medium">
                {selectedPartner?.name}
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