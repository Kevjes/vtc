'use client'

import React, { useState } from 'react'
import { 
  ShieldCheckIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  FunnelIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button,
  Input,
  Badge,
  Select
} from '@/components/ui'

interface AuditLog {
  id: string
  action: string
  resource: string
  resourceId: string
  userId: string
  userName: string
  timestamp: string
  ip: string
  userAgent: string
  details: {
    before?: any
    after?: any
    method?: string
    endpoint?: string
  }
  severity: 'info' | 'warning' | 'error' | 'critical'
}

const mockAuditLogs: AuditLog[] = [
  {
    id: '1',
    action: 'LOGIN',
    resource: 'auth',
    resourceId: 'admin',
    userId: 'admin',
    userName: 'Administrateur',
    timestamp: '2024-09-09T14:30:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { method: 'POST', endpoint: '/api/auth/login' },
    severity: 'info'
  },
  {
    id: '2',
    action: 'UPDATE',
    resource: 'driver',
    resourceId: '1',
    userId: 'admin',
    userName: 'Administrateur',
    timestamp: '2024-09-09T14:25:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: {
      before: { status: 'active', rating: 4.8 },
      after: { status: 'suspended', rating: 4.8 },
      method: 'PUT'
    },
    severity: 'warning'
  },
  {
    id: '3',
    action: 'CREATE',
    resource: 'partner',
    resourceId: '4',
    userId: 'admin',
    userName: 'Administrateur',
    timestamp: '2024-09-09T14:20:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { method: 'POST', endpoint: '/api/partners' },
    severity: 'info'
  },
  {
    id: '4',
    action: 'DELETE',
    resource: 'evaluation',
    resourceId: '12',
    userId: 'admin',
    userName: 'Administrateur',
    timestamp: '2024-09-09T14:15:00Z',
    ip: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    details: { method: 'DELETE', endpoint: '/api/evaluations/12' },
    severity: 'error'
  },
  {
    id: '5',
    action: 'FAILED_LOGIN',
    resource: 'auth',
    resourceId: 'unknown',
    userId: 'unknown',
    userName: 'Tentative non autorisée',
    timestamp: '2024-09-09T14:10:00Z',
    ip: '192.168.1.200',
    userAgent: 'curl/7.68.0',
    details: { method: 'POST', endpoint: '/api/auth/login' },
    severity: 'critical'
  }
]

export default function AuditPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(mockAuditLogs)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterAction, setFilterAction] = useState<'all' | string>('all')
  const [filterSeverity, setFilterSeverity] = useState<'all' | string>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  // Filtrage des logs
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.ip.includes(searchTerm)
    
    const matchesAction = filterAction === 'all' || log.action === filterAction
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity
    
    return matchesSearch && matchesAction && matchesSeverity
  })

  const getSeverityBadge = (severity: AuditLog['severity']) => {
    switch (severity) {
      case 'info':
        return <Badge variant="info" size="sm">Info</Badge>
      case 'warning':
        return <Badge variant="warning" size="sm">Attention</Badge>
      case 'error':
        return <Badge variant="danger" size="sm">Erreur</Badge>
      case 'critical':
        return <Badge variant="danger" size="sm">Critique</Badge>
    }
  }

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'LOGIN':
      case 'LOGOUT':
        return <UserIcon className="h-4 w-4" />
      case 'CREATE':
      case 'UPDATE':
      case 'DELETE':
        return <ShieldCheckIcon className="h-4 w-4" />
      default:
        return <ClockIcon className="h-4 w-4" />
    }
  }

  const actionOptions = [
    { value: 'all', label: 'Toutes les actions' },
    { value: 'LOGIN', label: 'Connexion' },
    { value: 'LOGOUT', label: 'Déconnexion' },
    { value: 'CREATE', label: 'Création' },
    { value: 'UPDATE', label: 'Modification' },
    { value: 'DELETE', label: 'Suppression' },
    { value: 'FAILED_LOGIN', label: 'Connexion échouée' }
  ]

  const severityOptions = [
    { value: 'all', label: 'Tous les niveaux' },
    { value: 'info', label: 'Information' },
    { value: 'warning', label: 'Attention' },
    { value: 'error', label: 'Erreur' },
    { value: 'critical', label: 'Critique' }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Journal d'audit
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Suivez toutes les activités et actions effectuées sur la plateforme
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                {filteredLogs.length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Événements aujourd'hui
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-red-600">
                {filteredLogs.filter(log => log.severity === 'critical').length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Alertes critiques
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {filteredLogs.filter(log => log.severity === 'warning').length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Avertissements
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">
                {filteredLogs.filter(log => log.action === 'LOGIN').length}
              </p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Connexions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filtres */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Rechercher dans les logs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  icon={<MagnifyingGlassIcon className="h-4 w-4" />}
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Select
                    label="Action"
                    value={filterAction}
                    onChange={(e) => setFilterAction(e.target.value)}
                    options={actionOptions}
                  />
                  <Select
                    label="Niveau de sévérité"
                    value={filterSeverity}
                    onChange={(e) => setFilterSeverity(e.target.value)}
                    options={severityOptions}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Liste des logs */}
        <Card>
          <CardHeader>
            <CardTitle>Activités récentes ({filteredLogs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50 cursor-pointer"
                  onClick={() => setSelectedLog(log)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        {getActionIcon(log.action)}
                        <span className="font-medium text-neutral-900 dark:text-neutral-100">
                          {log.action}
                        </span>
                      </div>
                      <span className="text-neutral-600 dark:text-neutral-400">
                        sur {log.resource}#{log.resourceId}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getSeverityBadge(log.severity)}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center space-x-1">
                        <UserIcon className="h-4 w-4" />
                        <span>{log.userName}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{new Date(log.timestamp).toLocaleString('fr-FR')}</span>
                      </span>
                      <span>IP: {log.ip}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedLog(log)
                      }}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredLogs.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Aucun événement trouvé avec ces critères
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal de détails */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-neutral-900 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                  Détails de l'événement
                </h2>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setSelectedLog(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Action
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {selectedLog.action}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Ressource
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {selectedLog.resource}#{selectedLog.resourceId}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Utilisateur
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {selectedLog.userName}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Date/Heure
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {new Date(selectedLog.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Adresse IP
                    </label>
                    <p className="text-neutral-900 dark:text-neutral-100">
                      {selectedLog.ip}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Sévérité
                    </label>
                    <div className="mt-1">
                      {getSeverityBadge(selectedLog.severity)}
                    </div>
                  </div>
                </div>
                
                {selectedLog.details && (
                  <div>
                    <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                      Détails techniques
                    </label>
                    <pre className="mt-2 p-3 bg-neutral-100 dark:bg-neutral-800 rounded text-sm overflow-auto">
                      {JSON.stringify(selectedLog.details, null, 2)}
                    </pre>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
                    User Agent
                  </label>
                  <p className="text-sm text-neutral-900 dark:text-neutral-100 break-all">
                    {selectedLog.userAgent}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}