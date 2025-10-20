'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Select, Modal } from '@/components/ui'
import { usersService } from '@/services/users'
import { rolesService } from '@/services/roles'
import { ApiUser, ApiRole, CreateUserRequest, UpdateUserRequest, UserType } from '@/types'
import { PlusIcon, PencilIcon, TrashIcon, EyeIcon } from '@heroicons/react/24/outline'

export default function UsersPage() {
  const [users, setUsers] = useState<ApiUser[]>([])
  const [roles, setRoles] = useState<ApiRole[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const [searchFilter, setSearchFilter] = useState('')

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null)

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
      setError(null)
      const response = await usersService.getUsers({
        page: currentPage,
        size: 10,
        filter: searchFilter || undefined
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900">Gestion des Utilisateurs</h1>
            <p className="text-neutral-600">Gérez les utilisateurs de la plateforme</p>
          </div>
          <Button onClick={openCreateModal} className="flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Nouveau Utilisateur</span>
          </Button>
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
                              <span className="text-sm text-neutral-400">Aucun rôle</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 text-xs rounded ${
                            user.active
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
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => openEditModal(user)}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
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
                  <span className={`px-2 py-1 text-xs rounded ${
                    selectedUser.active
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
      </div>
    </DashboardLayout>
  )
}