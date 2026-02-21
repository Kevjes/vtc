'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Modal, Badge } from '@/components/ui'
import { EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import { sessionsService } from '@/services/sessions'
import type { ApiSession } from '@/types'

export default function SessionsPage() {
  const [sessions, setSessions] = useState<ApiSession[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  // Modal states
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedSession, setSelectedSession] = useState<ApiSession | null>(null)

  const pageSize = 10

  useEffect(() => {
    loadSessions()
  }, [currentPage, searchTerm])

  const loadSessions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await sessionsService.getSessions({
        page: currentPage,
        size: pageSize,
        filter: searchTerm || undefined
      })
      setSessions(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error)
      setError(error instanceof Error ? error.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const openViewModal = (session: ApiSession) => {
    setSelectedSession(session)
    setShowViewModal(true)
  }

  const formatDateTime = (dateString?: string): string => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString()
  }

  const filteredSessions = sessions.filter(session =>
    (session.user?.username && session.user.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (session.user?.email && session.user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (session.ipAddress && session.ipAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Gestion des Sessions
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400">
              Surveillez les sessions utilisateurs actives
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
                    placeholder="Rechercher par utilisateur, email ou IP..."
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
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Adresse IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Dernière activité
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Aucune session trouvée
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session, index) => (
                    <tr key={session.user?.uuid || index} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                          {session.user?.username || 'N/A'}
                        </div>
                        <div className="text-sm text-neutral-500 dark:text-neutral-400">
                          {session.user?.firstname} {session.user?.lastname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {session.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {session.ipAddress || 'Non disponible'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={session.user?.active ? 'success' : 'danger'}>
                          {session.user?.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-neutral-900 dark:text-neutral-100">
                          {formatDateTime(session.lastActivityTime)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openViewModal(session)}
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
                  Affichage de {currentPage * pageSize + 1} à {Math.min((currentPage + 1) * pageSize, totalElements)} sur {totalElements} sessions
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
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Détails de la Session">
          {selectedSession && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Utilisateur
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {selectedSession.user?.username || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Prénom
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user?.firstname || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nom
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user?.lastname || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Email
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {selectedSession.user?.email || 'N/A'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Téléphone
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user?.phone || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Statut
                  </label>
                  <Badge variant={selectedSession.user?.active ? 'success' : 'danger'}>
                    {selectedSession.user?.active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Adresse IP
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {selectedSession.ipAddress || 'Non disponible'}
                </p>
              </div>

              {selectedSession.deviceInfo && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Informations de l'appareil
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 text-sm break-all">
                    {selectedSession.deviceInfo}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Dernière activité
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {formatDateTime(selectedSession.lastActivityTime)}
                </p>
              </div>

              {selectedSession.user?.lastLogin && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Dernière connexion
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {formatDateTime(selectedSession.user.lastLogin)}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Ville
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user?.city || 'N/A'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Pays
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user?.country || 'N/A'}
                  </p>
                </div>
              </div>

              {selectedSession.user?.address && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Adresse
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.user.address}
                  </p>
                </div>
              )}

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
