'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Select, Modal } from '@/components/ui'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { ApiUser, ApiRole, CreateUserRequest, UpdateUserRequest, UserType, UserPermissions } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'

export default function UsersPage() {
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllAccess } = usePermissions()

  const [users, setUsers] = useState<ApiUser[]>([])
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')

  // Permission checks
  const canViewUsers = hasAllAccess() || hasAnyPermission([
    UserPermissions.READ_ANY_USER,
    UserPermissions.READ_USER,
    UserPermissions.READ_OWN_USER
  ])
  const canCreateUser = hasAllAccess() || hasPermission(UserPermissions.CREATE_USER)
  const canUpdateUser = hasAllAccess() || hasPermission(UserPermissions.UPDATE_USER)
  const canUpdateOwnUser = hasAllAccess() || hasPermission(UserPermissions.UPDATE_OWN_USER)
  const canDeleteUser = hasAllAccess() || hasPermission(UserPermissions.DELETE_USER)
  const canDeleteOwnUser = hasAllAccess() || hasPermission(UserPermissions.DELETE_OWN_USER)

  // Helper to check if user is viewing their own profile
  const isOwnUser = (targetUser: ApiUser) => {
    return user?.uuid === targetUser.uuid
  }

  // Helper to check if user can update a specific user
  const canUpdateThisUser = (targetUser: ApiUser) => {
    if (hasAllAccess() || canUpdateUser) return true
    if (canUpdateOwnUser && isOwnUser(targetUser)) return true
    return false
  }

  // Helper to check if user can delete a specific user
  const canDeleteThisUser = (targetUser: ApiUser) => {
    if (hasAllAccess() || canDeleteUser) return true
    if (canDeleteOwnUser && isOwnUser(targetUser)) return true
    return false
  }

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showRolesModal, setShowRolesModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)
  const [selectedRoles, setSelectedRoles] = useState<Array<{ uuid: string; name: string }>>([])

  // Form states
  const [formData, setFormData] = useState<CreateUserRequest>({
    username: '',
    lastname: '',
    firstname: '',
    dob: '',
    roles: [],
    email: '',
    type: UserType.DRIVER,
    password: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    countryISO: 'CM',
    active: true
  })

  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [currentPage, searchFilter])

  const loadUsers = async () => {
    try {
      setLoading(true)
      let springFilter = ''
      if (searchFilter) {
        springFilter = `(firstname~~'*${searchFilter}*' or lastname~~'*${searchFilter}*' or email~~'*${searchFilter}*' or phone~~'*${searchFilter}*' or username~~'*${searchFilter}*')`
      }

      const response = await usersService.getUsers({
        page: currentPage,
        size: 10,
        filter: springFilter || undefined
      })
      setUsers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs')
    } finally {
      setLoading(false)
    }
  }

  const loadRoles = async () => {
    try {
      const response = await rolesService.getRoles({ page: 0, size: 100 })
      setRoles(response.content)
    } catch (error) {
      console.error('Erreur chargement rôles:', error)
    }
  }

  const handleCreate = async () => {
    // Check permission before creation
    if (!canCreateUser) {
      setError("Vous n'avez pas la permission de créer un utilisateur")
      return
    }

    try {
      setLoading(true)
      await usersService.createUser(formData)
      setShowCreateModal(false)
      resetForm()
      await loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async () => {
    if (!selectedUser) return

    // Check permission before update
    if (!canUpdateThisUser(selectedUser)) {
      setError("Vous n'avez pas la permission de modifier cet utilisateur")
      return
    }

    try {
      setLoading(true)
      const updateData: UpdateUserRequest = {
        lastname: formData.lastname,
        firstname: formData.firstname,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        city: formData.city,
        country: formData.country,
        active: formData.active
      }
      await usersService.updateUser(selectedUser.uuid, updateData)
      setShowEditModal(false)
      resetForm()
      await loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la modification')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (user: ApiUser) => {
    // Check permission before deletion
    if (!canDeleteThisUser(user)) {
      setError("Vous n'avez pas la permission de supprimer cet utilisateur")
      return
    }

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.firstname} ${user.lastname} ?`)) {
      return
    }

    try {
      setLoading(true)
      await usersService.deleteUser(user.uuid)
      await loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la suppression')
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      username: '',
      lastname: '',
      firstname: '',
      dob: '',
      roles: [],
      email: '',
      type: UserType.DRIVER,
      password: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      countryISO: 'CM',
      active: true
    })
    setSelectedUser(null)
  }

  const openCreateModal = () => {
    resetForm()
    setShowCreateModal(true)
  }

  const openEditModal = (user: ApiUser) => {
    setSelectedUser(user)
    setFormData({
      username: user.username || '',
      lastname: user.lastname,
      firstname: user.firstname,
      dob: user.dob,
      roles: user.roles.map(role => ({ uuid: role.uuid, name: role.name })),
      email: user.email,
      type: UserType.DRIVER, // Default type for editing
      password: '', // Don't pre-fill password
      phone: user.phone,
      address: user.address || '',
      city: user.city || '',
      country: user.country || '',
      countryISO: 'CM',
      active: user.active
    })
    setShowEditModal(true)
  }

  const openViewModal = (user: ApiUser) => {
    setSelectedUser(user)
    setShowViewModal(true)
  }

  const openRolesModal = (user: ApiUser) => {
    setSelectedUser(user)
    // Préparer les rôles sélectionnés avec l'UUID et le nom
    const userRoles = user.roles.map(role => ({
      uuid: role.uuid,
      name: role.name
    }))
    setSelectedRoles(userRoles)
    setShowRolesModal(true)
  }

  const handleRoleToggle = (role: ApiRole) => {
    const roleUuid = role.uuid
    const isSelected = selectedRoles.some(r => r.uuid === roleUuid)

    if (isSelected) {
      // Retirer le rôle
      setSelectedRoles(selectedRoles.filter(r => r.uuid !== roleUuid))
    } else {
      // Ajouter le rôle
      setSelectedRoles([...selectedRoles, { uuid: roleUuid, name: role.name }])
    }
  }

  const handleUpdateRoles = async () => {
    if (!selectedUser) return
    try {
      setLoading(true)
      setError(null)

      // Préparer le payload selon le format API
      await usersService.updateUser(selectedUser.uuid, {
        roles: selectedRoles
      })

      setShowRolesModal(false)
      setSelectedRoles([])
      await loadUsers()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur lors de la mise à jour des rôles')
    } finally {
      setLoading(false)
    }
  }

  // Check if user has permission to view this page
  if (!canViewUsers) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Card className="p-8 max-w-md text-center">
            <div className="mb-4">
              <ShieldCheckIcon className="h-16 w-16 text-red-500 mx-auto" />
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">Accès non autorisé</h2>
            <p className="text-neutral-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à la gestion des utilisateurs.
            </p>
            <p className="text-sm text-neutral-500">
              Permissions requises: CAN_READ_ANY_USER, CAN_READ_USER ou CAN_READ_OWN_USER
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
            <h1 className="text-2xl font-bold text-neutral-900">Gestion des Utilisateurs</h1>
            <p className="text-neutral-600">Gérez les utilisateurs de la plateforme</p>
          </div>
          {canCreateUser && (
            <Button onClick={openCreateModal} className="flex items-center space-x-2">
              <PlusIcon className="h-5 w-5" />
              <span>Nouveau Utilisateur</span>
            </Button>
          )}
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Input
                placeholder="Rechercher par nom, email ou téléphone..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
              />
            </div>
            <Button onClick={loadUsers} disabled={loading}>
              {loading ? 'Recherche...' : 'Rechercher'}
            </Button>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 font-medium">Erreur:</p>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Users Table */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Utilisateurs ({totalElements})</h2>
            </div>

            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-neutral-200">
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Nom</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Email</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Téléphone</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Rôles</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Statut</th>
                      <th className="text-left py-3 px-4 font-medium text-neutral-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.uuid} className="border-b border-neutral-100 hover:bg-neutral-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-neutral-900">{user.firstname} {user.lastname}</p>
                            <p className="text-sm text-neutral-500">{user.username}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-neutral-600">{user.email}</td>
                        <td className="py-3 px-4 text-neutral-600">{user.phone}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="flex flex-wrap gap-1">
                              {user.roles.map((role) => (
                                <span
                                  key={role.uuid}
                                  className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                                >
                                  {role.name}
                                </span>
                              ))}
                              {user.roles.length === 0 && (
                                <span className="text-sm text-red-500 font-medium">Aucun rôle</span>
                              )}
                            </div>
                            {canUpdateThisUser(user) && (
                              <button
                                onClick={() => openRolesModal(user)}
                                className="text-blue-600 hover:text-blue-800 ml-2"
                                title="Gérer les rôles"
                              >
                                <ShieldCheckIcon className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded ${user.active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                            }`}>
                            {user.active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openViewModal(user)}
                              title="Voir les détails"
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            {canUpdateThisUser(user) && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => openEditModal(user)}
                                title="Modifier"
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                            )}
                            {canDeleteThisUser(user) && (
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDelete(user)}
                                title="Supprimer"
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {users.length === 0 && !loading && (
                  <div className="text-center py-8">
                    <p className="text-neutral-500">Aucun utilisateur trouvé</p>
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-neutral-600">
                  Page {currentPage + 1} sur {totalPages} ({totalElements} éléments)
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Précédent
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Suivant
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Create Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Créer un Utilisateur"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nom d'utilisateur"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Mot de passe"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                required
              />
              <Input
                label="Nom"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <Input
              label="Date de naissance"
              type="date"
              value={formData.dob}
              onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Pays"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="active" className="text-sm font-medium text-neutral-700">
                Utilisateur actif
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate} disabled={loading}>
                {loading ? 'Création...' : 'Créer'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Edit Modal */}
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Modifier l'Utilisateur"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={formData.firstname}
                onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                required
              />
              <Input
                label="Nom"
                value={formData.lastname}
                onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                required
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <Input
              label="Téléphone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Ville"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
              <Input
                label="Pays"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
              />
            </div>
            <Input
              label="Adresse"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <div className="flex items-center">
              <input
                type="checkbox"
                id="editActive"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="mr-2"
              />
              <label htmlFor="editActive" className="text-sm font-medium text-neutral-700">
                Utilisateur actif
              </label>
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Annuler
              </Button>
              <Button onClick={handleEdit} disabled={loading}>
                {loading ? 'Modification...' : 'Modifier'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* View Modal */}
        <Modal
          isOpen={showViewModal}
          onClose={() => setShowViewModal(false)}
          title="Détails de l'Utilisateur"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nom d'utilisateur</label>
                  <p className="text-neutral-900">{selectedUser.username || 'Non défini'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Statut</label>
                  <span className={`px-2 py-1 text-xs rounded ${selectedUser.active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    }`}>
                    {selectedUser.active ? 'Actif' : 'Inactif'}
                  </span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Prénom</label>
                  <p className="text-neutral-900">{selectedUser.firstname}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Nom</label>
                  <p className="text-neutral-900">{selectedUser.lastname}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Email</label>
                <p className="text-neutral-900">{selectedUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Téléphone</label>
                <p className="text-neutral-900">{selectedUser.phone}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Ville</label>
                  <p className="text-neutral-900">{selectedUser.city || 'Non renseigné'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Pays</label>
                  <p className="text-neutral-900">{selectedUser.country || 'Non renseigné'}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Adresse</label>
                <p className="text-neutral-900">{selectedUser.address || 'Non renseignée'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Rôles</label>
                <div className="flex flex-wrap gap-1">
                  {selectedUser.roles.map((role) => (
                    <span
                      key={role.uuid}
                      className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded"
                    >
                      {role.name}
                    </span>
                  ))}
                  {selectedUser.roles.length === 0 && (
                    <span className="text-sm text-neutral-400">Aucun rôle assigné</span>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Créé le</label>
                  <p className="text-neutral-900">{new Date(selectedUser.createdDate).toLocaleDateString('fr-FR')}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Dernière connexion</label>
                  <p className="text-neutral-900">{selectedUser.lastLogin ? new Date(selectedUser.lastLogin).toLocaleDateString('fr-FR') : 'Jamais'}</p>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Roles Management Modal */}
        <Modal
          isOpen={showRolesModal}
          onClose={() => setShowRolesModal(false)}
          title="Gérer les rôles"
        >
          {selectedUser && (
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-900">
                  <span className="font-semibold">Utilisateur:</span> {selectedUser.firstname} {selectedUser.lastname}
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Sélectionnez les rôles à assigner à cet utilisateur
                </p>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {roles.map((role) => {
                  const isSelected = selectedRoles.some(r => r.uuid === role.uuid)

                  return (
                    <div
                      key={role.uuid}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-200 hover:border-neutral-300'
                        }`}
                      onClick={() => handleRoleToggle(role)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleRoleToggle(role)}
                            className="mt-1"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div>
                            <h4 className="font-medium text-neutral-900">{role.name}</h4>
                            <p className="text-sm text-neutral-600 mt-1">
                              {role.permissions.length} permission(s)
                            </p>
                            {role.permissions.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {role.permissions.slice(0, 3).map((perm) => (
                                  <span
                                    key={perm.uuid}
                                    className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded"
                                  >
                                    {perm.name}
                                  </span>
                                ))}
                                {role.permissions.length > 3 && (
                                  <span className="px-2 py-0.5 text-xs text-neutral-500">
                                    +{role.permissions.length - 3} autres
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {selectedRoles.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ Attention: Cet utilisateur n'aura aucun rôle et ne pourra accéder à aucune fonctionnalité.
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <Button variant="secondary" onClick={() => setShowRolesModal(false)}>
                  Annuler
                </Button>
                <Button onClick={handleUpdateRoles} disabled={loading}>
                  {loading ? 'Mise à jour...' : 'Enregistrer'}
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}