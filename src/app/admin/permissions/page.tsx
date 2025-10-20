'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Modal, Badge } from '@/components/ui'
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { permissionsService } from '@/services/permissions'
import type { ApiPermission } from '@/types'

export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<ApiPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedPermission, setSelectedPermission] = useState<ApiPermission | null>(null)

  const pageSize = 10

  useEffect(() => {
    loadPermissions()
  }, [currentPage, searchTerm])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await permissionsService.getPermissions({
        page: currentPage,
        size: pageSize,
        filter: searchTerm || undefined
      })
      setPermissions(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const openViewModal = (permission: ApiPermission) => {
    setSelectedPermission(permission)
    setShowViewModal(true)
  }

  const filteredPermissions = permissions.filter(permission =>
    permission.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Gestion des Permissions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Consultez les permissions disponibles dans le système
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <Card>
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <Input
                    placeholder="Rechercher une permission..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Nom
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Guard Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Créé le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Aucune permission trouvée
                    </td>
                  </tr>
                ) : (
                  filteredPermissions.map((permission) => (
                    <tr key={permission.uuid} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {permission.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {permission.code}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {permission.guardName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={permission.deleted ? 'danger' : 'success'}>
                          {permission.deleted ? 'Supprimé' : 'Actif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(permission.createdDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(permission)}
                          >
                            <EyeIcon className="h-4 w-4" />
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
                  Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} permissions
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

        {/* View Modal */}
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Détails de la Permission">
          {selectedPermission && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  UUID
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-mono text-sm break-all">
                  {selectedPermission.uuid}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">{selectedPermission.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Code
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-mono">{selectedPermission.code}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Guard Name
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">{selectedPermission.guardName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Statut
                </label>
                <Badge variant={selectedPermission.deleted ? 'danger' : 'success'}>
                  {selectedPermission.deleted ? 'Supprimé' : 'Actif'}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Supprimable
                </label>
                <Badge variant={selectedPermission.isDeletable ? 'warning' : 'info'}>
                  {selectedPermission.isDeletable ? 'Oui' : 'Non'}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Version
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">{selectedPermission.version}</p>
                </div>

                {selectedPermission.slug && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Slug
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{selectedPermission.slug}</p>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Créé le
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {new Date(selectedPermission.createdDate).toLocaleString()}
                  </p>
                  {selectedPermission.createdBy && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Par: {selectedPermission.createdBy}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Modifié le
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {new Date(selectedPermission.lastModifiedDate).toLocaleString()}
                  </p>
                  {selectedPermission.lastModifiedBy && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Par: {selectedPermission.lastModifiedBy}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <Button variant="outline" onClick={() => setShowViewModal(false)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}