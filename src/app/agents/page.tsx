'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Badge } from '@/components/ui'
import { agentsService } from '@/services/agents'
import type { ApiAgent } from '@/types'

export default function AgentsPage() {
  const router = useRouter()
  const [agents, setAgents] = useState<ApiAgent[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'ACTIVE' | 'INACTIVE'>('all')
  const [currentPage, setCurrentPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)
  const pageSize = 10

  useEffect(() => {
    loadAgents()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchTerm, filterStatus])

  const loadAgents = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await agentsService.getAgents({
        page: currentPage,
        size: pageSize,
        filter: searchTerm || undefined,
        status: filterStatus === 'all' ? undefined : filterStatus
      })
      setAgents(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      console.error('Erreur lors du chargement des agents:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleViewAgent = (uuid: string) => {
    router.push(`/agents/${uuid}`)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Agents</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Gérez les agents de votre plateforme</p>
          </div>
          <Button onClick={() => router.push('/agents/new')}>Nouveau agent</Button>
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
                  placeholder="Rechercher un agent..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex items-center gap-2">
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
                  Actifs
                </Button>
                <Button
                  variant={filterStatus === 'INACTIVE' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setFilterStatus('INACTIVE')}
                >
                  Inactifs
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Agents Table */}
        <Card>
          <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Liste des agents ({totalElements})</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-800">
                <tr>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Agent</th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Contact</th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Partenaire</th>
                  <th className="text-left py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Statut</th>
                  <th className="text-right py-3 px-6 font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-neutral-900 divide-y divide-neutral-200 dark:divide-neutral-700">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">Chargement...</td>
                  </tr>
                ) : agents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-neutral-500 dark:text-neutral-400">
                      {searchTerm || filterStatus !== 'all' ? 'Aucun agent trouvé avec ces critères' : 'Aucun agent trouvé'}
                    </td>
                  </tr>
                ) : (
                  agents.map((agent) => (
                    <tr key={agent.uuid}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <div className="text-neutral-900 dark:text-neutral-100 font-medium">
                              {agent.user.firstname} {agent.user.lastname}
                            </div>
                            <div className="text-neutral-500 dark:text-neutral-400 text-sm">{agent.user.username || agent.user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900 dark:text-neutral-100">{agent.user.email}</div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-sm">{agent.user.phone}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-neutral-900 dark:text-neutral-100">{agent.partner.name}</div>
                        <div className="text-neutral-500 dark:text-neutral-400 text-sm">{agent.partner.shortName}</div>
                      </td>
                      <td className="px-6 py-4">
                        {agent.status === 'ACTIVE' ? (
                          <Badge variant="success" size="sm">Actif</Badge>
                        ) : (
                          <Badge variant="warning" size="sm">Inactif</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="outline" size="sm" onClick={() => handleViewAgent(agent.uuid)}>Voir</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 flex items-center justify-between">
            <div className="text-sm text-neutral-600 dark:text-neutral-400">
              Page {currentPage + 1} / {Math.max(totalPages, 1)}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={currentPage === 0}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
              >
                Précédent
              </Button>
              <Button
                variant="outline"
                disabled={currentPage + 1 >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                Suivant
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}