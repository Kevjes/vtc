'use client'

import React, { useState } from 'react'
import { 
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  PlusIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button,
  Badge,
  Modal,
  Input,
  Textarea,
  Select
} from '@/components/ui'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  recipients: 'all' | 'drivers' | 'partners'
  channel: 'email' | 'sms' | 'app'
  status: 'draft' | 'sent' | 'scheduled'
  createdAt: string
  sentAt?: string
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    title: 'Mise à jour de la plateforme',
    message: 'Une nouvelle mise à jour de la plateforme sera déployée ce weekend.',
    type: 'info',
    recipients: 'all',
    channel: 'app',
    status: 'sent',
    createdAt: '2024-09-07T10:00:00Z',
    sentAt: '2024-09-07T10:05:00Z'
  },
  {
    id: '2',
    title: 'Nouvelle politique de commission',
    message: 'Les nouvelles commissions entreront en vigueur le 1er octobre.',
    type: 'warning',
    recipients: 'partners',
    channel: 'email',
    status: 'sent',
    createdAt: '2024-09-06T14:30:00Z',
    sentAt: '2024-09-06T14:35:00Z'
  },
  {
    id: '3',
    title: 'Formation sécurité routière',
    message: 'Formation obligatoire prévue pour tous les chauffeurs.',
    type: 'info',
    recipients: 'drivers',
    channel: 'sms',
    status: 'scheduled',
    createdAt: '2024-09-08T09:00:00Z'
  }
]

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)

  const getStatusBadge = (status: Notification['status']) => {
    switch (status) {
      case 'sent':
        return <Badge variant="success" size="sm">Envoyée</Badge>
      case 'scheduled':
        return <Badge variant="info" size="sm">Programmée</Badge>
      case 'draft':
        return <Badge variant="default" size="sm">Brouillon</Badge>
    }
  }

  const getTypeBadge = (type: Notification['type']) => {
    switch (type) {
      case 'info':
        return <Badge variant="info" size="sm">Info</Badge>
      case 'success':
        return <Badge variant="success" size="sm">Succès</Badge>
      case 'warning':
        return <Badge variant="warning" size="sm">Attention</Badge>
      case 'error':
        return <Badge variant="danger" size="sm">Erreur</Badge>
    }
  }

  const getChannelIcon = (channel: Notification['channel']) => {
    switch (channel) {
      case 'email':
        return <EnvelopeIcon className="h-4 w-4" />
      case 'sms':
        return <DevicePhoneMobileIcon className="h-4 w-4" />
      case 'app':
        return <BellIcon className="h-4 w-4" />
    }
  }

  const recipientOptions = [
    { value: '', label: 'Sélectionner les destinataires' },
    { value: 'all', label: 'Tous les utilisateurs' },
    { value: 'drivers', label: 'Chauffeurs uniquement' },
    { value: 'partners', label: 'Partenaires uniquement' }
  ]

  const channelOptions = [
    { value: '', label: 'Sélectionner le canal' },
    { value: 'email', label: 'Email' },
    { value: 'sms', label: 'SMS' },
    { value: 'app', label: 'Notification app' }
  ]

  const typeOptions = [
    { value: '', label: 'Sélectionner le type' },
    { value: 'info', label: 'Information' },
    { value: 'success', label: 'Succès' },
    { value: 'warning', label: 'Attention' },
    { value: 'error', label: 'Erreur' }
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
              Notifications
            </h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">
              Gérez et envoyez des notifications à vos utilisateurs
            </p>
          </div>
          <Button onClick={() => setShowCreateModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Nouvelle notification
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">24</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Total envoyées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary-600">3</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Programmées</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-green-600">89%</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Taux d'ouverture</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">1</p>
              <p className="text-sm text-neutral-600 dark:text-neutral-400">Brouillons</p>
            </CardContent>
          </Card>
        </div>

        {/* Liste des notifications */}
        <Card>
          <CardHeader>
            <CardTitle>Historique des notifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className="border border-neutral-200 dark:border-neutral-800 rounded-lg p-4 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        {getChannelIcon(notification.channel)}
                      </div>
                      <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                        {notification.title}
                      </h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getTypeBadge(notification.type)}
                      {getStatusBadge(notification.status)}
                    </div>
                  </div>
                  
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    {notification.message}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center space-x-4">
                      <span>
                        Destinataires: {notification.recipients === 'all' ? 'Tous' : 
                        notification.recipients === 'drivers' ? 'Chauffeurs' : 'Partenaires'}
                      </span>
                      <span>
                        Créée le {new Date(notification.createdAt).toLocaleDateString('fr-FR')}
                      </span>
                      {notification.sentAt && (
                        <span>
                          Envoyée le {new Date(notification.sentAt).toLocaleDateString('fr-FR')}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setSelectedNotification(notification)}
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Modifier"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        title="Supprimer"
                      >
                        <TrashIcon className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Modal de création */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Nouvelle notification"
          size="lg"
        >
          <form className="space-y-4">
            <Input
              label="Titre de la notification"
              placeholder="Entrez le titre..."
            />
            
            <Textarea
              label="Message"
              placeholder="Rédigez votre message..."
              rows={4}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Select
                label="Destinataires"
                options={recipientOptions}
              />
              <Select
                label="Canal d'envoi"
                options={channelOptions}
              />
              <Select
                label="Type"
                options={typeOptions}
              />
            </div>
            
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateModal(false)}
              >
                Annuler
              </Button>
              <Button
                type="button"
                variant="outline"
              >
                Enregistrer comme brouillon
              </Button>
              <Button type="submit">
                Envoyer maintenant
              </Button>
            </div>
          </form>
        </Modal>

        {/* Modal de détails */}
        <Modal
          isOpen={!!selectedNotification}
          onClose={() => setSelectedNotification(null)}
          title="Détails de la notification"
        >
          {selectedNotification && (
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  {selectedNotification.title}
                </h3>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  {selectedNotification.message}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Type:</span>
                  <div className="mt-1">{getTypeBadge(selectedNotification.type)}</div>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Statut:</span>
                  <div className="mt-1">{getStatusBadge(selectedNotification.status)}</div>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Destinataires:</span>
                  <p className="font-medium text-neutral-900 dark:text-neutral-100">
                    {selectedNotification.recipients === 'all' ? 'Tous les utilisateurs' : 
                     selectedNotification.recipients === 'drivers' ? 'Chauffeurs' : 'Partenaires'}
                  </p>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Canal:</span>
                  <div className="flex items-center space-x-2 mt-1">
                    {getChannelIcon(selectedNotification.channel)}
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {selectedNotification.channel.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  )
}