'use client'

import React, { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Button, Card, Input, Modal, Badge } from '@/components/ui'
import { EyeIcon, MagnifyingGlassIcon, TrashIcon } from '@heroicons/react/24/outline'
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

  const isSessionExpired = (expiresAt: string): boolean => {
    return new Date(expiresAt) < new Date()
  }

  const getSessionStatus = (session: ApiSession): 'active' | 'expired' | 'inactive' => {
    if (!session.active) return 'inactive'
    if (isSessionExpired(session.expiresAt)) return 'expired'
    return 'active'
  }

  const formatDuration = (expiresAt: string): string => {
    const now = new Date()
    const expires = new Date(expiresAt)
    const diff = expires.getTime() - now.getTime()

    if (diff <= 0) return 'Expirée'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  const filteredSessions = sessions.filter(session =>
    session.sessionId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    session.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              Surveillez les sessions utilisateurs actives et inactives
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
                    placeholder="Rechercher par session, utilisateur ou IP..."
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
                    Session
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Adresse IP
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Expiration
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                    Créée le
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
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
                ) : filteredSessions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      Aucune session trouvée
                    </td>
                  </tr>
                ) : (
                  filteredSessions.map((session) => {
                    const status = getSessionStatus(session)
                    return (
                      <tr key={session.uuid} className="hover:bg-neutral-50 dark:hover:bg-neutral-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                            {session.sessionId.substring(0, 20)}...
                          </div>
                          <div className="text-sm text-neutral-500 dark:text-neutral-400">
                            {session.code}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            {session.userId}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            {session.ipAddress || 'Non disponible'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Badge
                            variant={
                              status === 'active' ? 'success' :
                              status === 'expired' ? 'warning' : 'danger'
                            }
                          >
                            {status === 'active' ? 'Active' :
                             status === 'expired' ? 'Expirée' : 'Inactive'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-neutral-900 dark:text-neutral-100">
                            {formatDuration(session.expiresAt)}
                          </div>
                          <div className="text-xs text-neutral-500 dark:text-neutral-400">
                            {new Date(session.expiresAt).toLocaleString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500 dark:text-neutral-400">
                          {new Date(session.createdDate).toLocaleDateString()}
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
                    )
                  })
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
                  UUID
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-mono text-sm break-all">
                  {selectedSession.uuid}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Session ID
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-mono text-sm break-all">
                  {selectedSession.sessionId}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Code
                </label>
                <p className="text-neutral-900 dark:text-neutral-100 font-mono">
                  {selectedSession.code}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Utilisateur ID
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">{selectedSession.userId}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Adresse IP
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {selectedSession.ipAddress || 'Non disponible'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Statut
                  </label>
                  <Badge
                    variant={
                      getSessionStatus(selectedSession) === 'active' ? 'success' :
                      getSessionStatus(selectedSession) === 'expired' ? 'warning' : 'danger'
                    }
                  >
                    {getSessionStatus(selectedSession) === 'active' ? 'Active' :
                     getSessionStatus(selectedSession) === 'expired' ? 'Expirée' : 'Inactive'}
                  </Badge>
                </div>
              </div>

              {selectedSession.userAgent && (
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    User Agent
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100 text-sm break-all">
                    {selectedSession.userAgent}
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Version
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">{selectedSession.version}</p>
                </div>

                {selectedSession.slug && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Slug
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">{selectedSession.slug}</p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                  Expire le
                </label>
                <p className="text-neutral-900 dark:text-neutral-100">
                  {new Date(selectedSession.expiresAt).toLocaleString()}
                </p>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                  {formatDuration(selectedSession.expiresAt)}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Créée le
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {new Date(selectedSession.createdDate).toLocaleString()}
                  </p>
                  {selectedSession.createdBy && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Par: {selectedSession.createdBy}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Modifiée le
                  </label>
                  <p className="text-neutral-900 dark:text-neutral-100">
                    {new Date(selectedSession.lastModifiedDate).toLocaleString()}
                  </p>
                  {selectedSession.lastModifiedBy && (
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Par: {selectedSession.lastModifiedBy}
                    </p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Supprimable
                  </label>
                  <Badge variant={selectedSession.isDeletable ? 'warning' : 'info'}>
                    {selectedSession.isDeletable ? 'Oui' : 'Non'}
                  </Badge>
                </div>

                {selectedSession.deleted !== undefined && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Supprimée
                    </label>
                    <Badge variant={selectedSession.deleted ? 'danger' : 'success'}>
                      {selectedSession.deleted ? 'Oui' : 'Non'}
                    </Badge>
                  </div>
                )}
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