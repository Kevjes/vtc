'use client'

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Badge } from '@/components/ui'
import { agentsService } from '@/services/agents'
import { usePermissions } from '@/hooks/usePermissions'
import { useAuth } from '@/contexts/AuthContext'
import type { ApiAgent } from '@/types'
import { AgentPermissions } from '@/types'

export default function AgentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { hasPermission, hasAnyPermission, hasAllAccess } = usePermissions()
  const uuid = typeof params?.uuid === 'string' ? params.uuid : ''
  const [agent, setAgent] = useState<ApiAgent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Permission checks
  const canReadAgent = hasAllAccess() || hasAnyPermission([
    AgentPermissions.READ_ANY_AGENT,
    AgentPermissions.READ_AGENT,
    AgentPermissions.READ_OWN_AGENT
  ])
  const canUpdateAgent = hasAllAccess() || hasPermission(AgentPermissions.UPDATE_AGENT)
  const canUpdateOwnAgent = hasAllAccess() || hasPermission(AgentPermissions.UPDATE_OWN_AGENT)
  const canDeleteAgent = hasAllAccess() || hasPermission(AgentPermissions.DELETE_AGENT)
  const canDeleteOwnAgent = hasAllAccess() || hasPermission(AgentPermissions.DELETE_OWN_AGENT)

  // Permission helpers
  const isOwnAgent = (agentData: ApiAgent) => {
    // Own agent if user is the agent's user OR if user's partner is the agent's partner
    return user?.uuid === agentData.user?.uuid || user?.partnerId === agentData.partner?.uuid
  }

  const canUpdateThisAgent = (agentData: ApiAgent) => {
    if (hasAllAccess()) return true
    if (canUpdateAgent) return true
    if (canUpdateOwnAgent && isOwnAgent(agentData)) return true
    return false
  }

  const canDeleteThisAgent = (agentData: ApiAgent) => {
    if (hasAllAccess()) return true
    if (canDeleteAgent) return true
    if (canDeleteOwnAgent && isOwnAgent(agentData)) return true
    return false
  }

  // Determine actual permissions based on ownership
  const canEdit = agent ? canUpdateThisAgent(agent) : false
  const canDelete = agent ? canDeleteThisAgent(agent) : false

  useEffect(() => {
    if (!uuid) return
    loadAgent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uuid])

  const loadAgent = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await agentsService.getAgent(uuid)
      setAgent(data)
    } catch (err) {
      console.error('Erreur lors du chargement de l\'agent:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  // Show access denied if user doesn't have permission
  if (!canReadAgent) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Accès refusé</h2>
            <p className="text-red-700 dark:text-red-300">
              Vous n'avez pas la permission de consulter les détails de cet agent.
            </p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6">Chargement...</div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6">{error}</div>
      </DashboardLayout>
    )
  }

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="p-6">Agent introuvable</div>
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
              {agent.user.firstname} {agent.user.lastname}
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Détails de l'agent</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push('/agents')}>Retour</Button>
            {canEdit && (
              <Button onClick={() => router.push(`/agents/${uuid}/edit`)}>Modifier</Button>
            )}
            {canDelete && (
              <Button variant="danger" onClick={() => {
                if (confirm('Êtes-vous sûr de vouloir supprimer cet agent ?')) {
                  // TODO: Implement delete functionality
                  console.log('Delete agent:', uuid)
                }
              }}>Supprimer</Button>
            )}
          </div>
        </div>

        {/* Info */}
        <Card>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Informations utilisateur</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div>Email: {agent.user.email}</div>
                <div>Téléphone: {agent.user.phone}</div>
                <div>Nom d'utilisateur: {agent.user.username}</div>
                <div>Date de naissance: {agent.user.dob}</div>
                <div>Adresse: {agent.user.address}</div>
                <div>Ville: {agent.user.city}</div>
                <div>Pays: {agent.user.country}</div>
                <div>Code pays: {agent.user.countryISO}</div>
                <div>Actif: {agent.user.active ? 'Oui' : 'Non'}</div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Partenaire</h3>
              <div className="mt-4 space-y-2 text-sm">
                <div>Nom: {agent.partner.name}</div>
                <div>Abrégé: {agent.partner.shortName}</div>
                <div>Email: {agent.partner.email}</div>
                <div>Téléphone: {agent.partner.phone}</div>
                <div>Identifiant: {agent.partner.companyIdentifier}</div>
                <div>Adresse: {agent.partner.address}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-neutral-900 dark:text-neutral-100">Statut</h3>
            <div className="mt-4">
              {agent.status === 'ACTIVE' ? (
                <Badge variant="success" size="sm">Actif</Badge>
              ) : (
                <Badge variant="warning" size="sm">Inactif</Badge>
              )}
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}