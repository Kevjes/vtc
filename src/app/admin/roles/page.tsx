'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Modal, Badge } from '@/components/ui'
import { PlusIcon, PencilIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline'
import { rolesService } from '@/services/roles'
import { permissionsService } from '@/services/permissions'
import type { ApiRole, ApiPermission, CreateRoleRequest, UpdateRoleRequest } from '@/types'

export default function RolesPage() {
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [permissions, setPermissions] = useState<ApiPermission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(null)

  // Form data
  const [formData, setFormData] = useState<CreateRoleRequest>({
    name: '',
    isActive: true,
    permissions: []
  })

  const pageSize = 10

  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [currentPage, searchTerm])

  const loadRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await rolesService.getRoles({
        page: currentPage,
        size: pageSize,
        filter: searchTerm || undefined
      })
      setRoles(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadPermissions = async () => {
    try {
      const response = await permissionsService.getPermissions({
        page: 0,
        size: 1000
      })
      setPermissions(response.content)
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
    }
  }

  const handleCreate = async () => {
    try {
      setLoading(true)
      await rolesService.createRole(formData)
      setShowCreateModal(false)
      resetForm()
      await loadRoles()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedRole) return
    try {
      setLoading(true)
      const updateData: UpdateRoleRequest = {
        name: formData.name,
        isActive: formData.isActive,
        permissions: formData.permissions
      }
      await rolesService.updateRole(selectedRole.uuid, updateData)
      setShowEditModal(false)
      resetForm()
      await loadRoles()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (role: ApiRole) => {
    if (!confirm(`Êtes-vous sûr de vouloir supprimer le rôle "${role.name}" ?`)) return
    try {
      setLoading(true)
      await rolesService.deleteRole(role.uuid)
      await loadRoles()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      isActive: true,
      permissions: []
    })
    setSelectedRole(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (role: ApiRole) => {
    setSelectedRole(role)
    setFormData({
      name: role.name,
      isActive: role.isActive,
      permissions: role.permissions.map(p => ({ uuid: p.uuid }))
    })
    setShowEditModal(true)
  }

  const openViewModal = (role: ApiRole) => {
    setSelectedRole(role)
    setShowViewModal(true)
  }

  const handlePermissionToggle = (permissionUuid: string) => {
    setFormData(prev => {
      const exists = prev.permissions.some(p => p.uuid === permissionUuid)
      if (exists) {
        return {
          ...prev,
          permissions: prev.permissions.filter(p => p.uuid !== permissionUuid)
        }
      } else {
        return {
          ...prev,
          permissions: [...prev.permissions, { uuid: permissionUuid }]
        }
      }
    })
  }

  const isPermissionSelected = (permissionUuid: string) => {
    return formData.permissions.some(p => p.uuid === permissionUuid)
  }

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Gestion des Rôles
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Gérez les rôles et leurs permissions
            </p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center gap-2">
            <PlusIcon className="h-4 w-4" />
            Nouveau Rôle
          </Button>
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
                <Input
                  placeholder="Rechercher un rôle..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
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
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Permissions
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
                ) : filteredRoles.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Aucun rôle trouvé
                    </td>
                  </tr>
                ) : (
                  filteredRoles.map((role) => (
                    <tr key={role.uuid} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {role.name}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {role.guardName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={role.isActive ? 'success' : 'warning'}>
                          {role.isActive ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {role.permissions.length} permission(s)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                        {new Date(role.createdDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(role)}
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEditModal(role)}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(role)}
                            className="text-red-600 hover:text-red-700"
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
                  Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} rôles
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

        {/* Create Modal */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Créer un Rôle">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nom du rôle *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du rôle"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-neutral-300 dark:border-neutral-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Rôle actif</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Permissions
              </label>
              <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 space-y-2">
                {permissions.map((permission) => (
                  <label key={permission.uuid} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPermissionSelected(permission.uuid)}
                      onChange={() => handlePermissionToggle(permission.uuid)}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={loading || !formData.name.trim()}>
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Modifier le Rôle">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                Nom du rôle *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Nom du rôle"
                required
              />
            </div>

            <div>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  className="rounded border-neutral-300 dark:border-neutral-600"
                />
                <span className="text-sm text-neutral-700 dark:text-neutral-300">Rôle actif</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Permissions
              </label>
              <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-3 space-y-2">
                {permissions.map((permission) => (
                  <label key={permission.uuid} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isPermissionSelected(permission.uuid)}
                      onChange={() => handlePermissionToggle(permission.uuid)}
                      className="rounded border-neutral-300 dark:border-neutral-600"
                    />
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">
                      {permission.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={loading || !formData.name.trim()}>
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Détails du Rôle">
          {selectedRole && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Nom
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">{selectedRole.name}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Guard Name
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">{selectedRole.guardName}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Statut
                </label>
                <Badge variant={selectedRole.isActive ? 'success' : 'warning'}>
                  {selectedRole.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Permissions ({selectedRole.permissions.length})
                </label>
                <div className="max-h-48 overflow-y-auto border border-neutral-200 dark:border-neutral-700 rounded-lg p-3">
                  {selectedRole.permissions.length === 0 ? (
                    <p className="text-neutral-500 dark:text-neutral-400 text-sm">Aucune permission assignée</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRole.permissions.map((permission) => (
                        <div key={permission.uuid} className="text-sm text-neutral-700 dark:text-neutral-300">
                          {permission.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Créé le
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {new Date(selectedRole.createdDate).toLocaleString()}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Modifié le
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {new Date(selectedRole.lastModifiedDate).toLocaleString()}
                </p>
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