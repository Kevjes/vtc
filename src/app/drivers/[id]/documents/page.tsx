'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeftIcon,
  DocumentTextIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  PlusIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  Badge,
  Avatar,
  Modal,
  FileUpload
} from '@/components/ui'
import { Driver, Document, DocumentStatus, DocumentType } from '@/types'

// Mock data
const mockDriver = {
  id: '1',
  firstName: 'Moussa',
  lastName: 'Traoré',
  email: 'moussa.traore@example.com'
}

const mockDocuments: Document[] = [
  {
    id: '1',
    type: 'driver_license' as DocumentType,
    fileName: 'permis-moussa.pdf',
    url: '/documents/permis-moussa.pdf',
    status: 'approved' as DocumentStatus,
    uploadedAt: new Date('2024-01-15'),
    expirationDate: new Date('2026-01-15')
  },
  {
    id: '2',
    type: 'insurance' as DocumentType,
    fileName: 'assurance-vehicule.pdf',
    url: '/documents/assurance-vehicule.pdf',
    status: 'approved' as DocumentStatus,
    uploadedAt: new Date('2024-01-15'),
    expirationDate: new Date('2025-06-15')
  },
  {
    id: '3',
    type: 'vehicle_registration' as DocumentType,
    fileName: 'carte-grise.pdf',
    url: '/documents/carte-grise.pdf',
    status: 'pending' as DocumentStatus,
    uploadedAt: new Date('2024-09-01')
  },
  {
    id: '4',
    type: 'criminal_record' as DocumentType,
    fileName: 'casier-judiciaire.pdf',
    url: '/documents/casier-judiciaire.pdf',
    status: 'rejected' as DocumentStatus,
    uploadedAt: new Date('2024-08-15')
  },
  {
    id: '5',
    type: 'photo' as DocumentType,
    fileName: 'photo-identite.jpg',
    url: '/documents/photo-identite.jpg',
    status: 'expired' as DocumentStatus,
    uploadedAt: new Date('2023-01-15'),
    expirationDate: new Date('2024-01-15')
  }
]

const documentTypeLabels: Record<DocumentType, string> = {
  driver_license: 'Permis de conduire',
  vehicle_registration: 'Carte grise',
  insurance: 'Assurance véhicule',
  criminal_record: 'Casier judiciaire',
  photo: 'Photo d\'identité'
}

const getStatusBadge = (status: DocumentStatus) => {
  switch (status) {
    case 'approved':
      return <Badge variant="success" size="sm">Approuvé</Badge>
    case 'rejected':
      return <Badge variant="danger" size="sm">Rejeté</Badge>
    case 'pending':
      return <Badge variant="warning" size="sm">En attente</Badge>
    case 'expired':
      return <Badge variant="danger" size="sm">Expiré</Badge>
  }
}

const getStatusIcon = (status: DocumentStatus) => {
  switch (status) {
    case 'approved':
      return <CheckCircleIcon className="h-5 w-5 text-green-500" />
    case 'rejected':
      return <XCircleIcon className="h-5 w-5 text-red-500" />
    case 'pending':
      return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
    case 'expired':
      return <XCircleIcon className="h-5 w-5 text-red-500" />
  }
}

const isDocumentExpiringSoon = (expirationDate?: Date): boolean => {
  if (!expirationDate) return false
  const thirtyDaysFromNow = new Date()
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
  return expirationDate <= thirtyDaysFromNow
}

export default function DriverDocumentsPage() {
  const router = useRouter()
  const params = useParams()
  const [driver, setDriver] = useState<any>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentType>(DocumentType.DRIVER_LICENSE)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // Simulation d'appel API
        await new Promise(resolve => setTimeout(resolve, 1000))
        setDriver(mockDriver)
        setDocuments(mockDocuments)
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [params.id])

  const handleApproveDocument = async (documentId: string) => {
    try {
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'approved' as DocumentStatus }
            : doc
        )
      )
    } catch (error) {
      console.error('Erreur lors de l\'approbation:', error)
    }
  }

  const handleRejectDocument = async (documentId: string) => {
    try {
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === documentId 
            ? { ...doc, status: 'rejected' as DocumentStatus }
            : doc
        )
      )
    } catch (error) {
      console.error('Erreur lors du rejet:', error)
    }
  }

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return
    
    try {
      setDocuments(docs => docs.filter(doc => doc.id !== selectedDocument.id))
      setShowDeleteModal(false)
      setSelectedDocument(null)
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    if (files.length === 0) return

    setIsSubmitting(true)
    try {
      // Simulation d'upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newDocument: Document = {
        id: String(documents.length + 1),
        type: selectedDocumentType,
        fileName: files[0].name,
        url: `/documents/${files[0].name}`,
        status: 'pending' as DocumentStatus,
        uploadedAt: new Date()
      }

      setDocuments(prev => [...prev, newDocument])
      setShowUploadModal(false)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto"></div>
            <p className="mt-2 text-neutral-600 dark:text-neutral-400">Chargement...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!driver) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <p className="text-neutral-600 dark:text-neutral-400">Chauffeur non trouvé</p>
        </div>
      </DashboardLayout>
    )
  }

  const expiringSoonCount = documents.filter(doc => 
    doc.expirationDate && isDocumentExpiringSoon(doc.expirationDate)
  ).length

  const pendingCount = documents.filter(doc => doc.status === 'pending').length

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Button>
            <div className="flex items-center space-x-4">
              <Avatar 
                fallback={`${driver.firstName[0]}${driver.lastName[0]}`}
                size="md"
              />
              <div>
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
                  Documents - {driver.firstName} {driver.lastName}
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                  Gestion des documents du chauffeur
                </p>
              </div>
            </div>
          </div>
          <Button onClick={() => setShowUploadModal(true)}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un document
          </Button>
        </div>

        {/* Alertes */}
        {(expiringSoonCount > 0 || pendingCount > 0) && (
          <div className="space-y-3">
            {expiringSoonCount > 0 && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                  <p className="text-yellow-800 dark:text-yellow-200">
                    <span className="font-medium">{expiringSoonCount}</span> document(s) expire(nt) dans moins de 30 jours
                  </p>
                </div>
              </div>
            )}
            {pendingCount > 0 && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-5 w-5 text-blue-600 mr-2" />
                  <p className="text-blue-800 dark:text-blue-200">
                    <span className="font-medium">{pendingCount}</span> document(s) en attente de validation
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Liste des documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents ({documents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-200 dark:border-neutral-800">
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Document
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Type
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Statut
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Expiration
                    </th>
                    <th className="text-left py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Date d'ajout
                    </th>
                    <th className="text-right py-3 px-4 font-medium text-neutral-900 dark:text-neutral-100">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((document) => (
                    <tr 
                      key={document.id} 
                      className="border-b border-neutral-100 dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <DocumentTextIcon className="h-5 w-5 text-neutral-500" />
                          <div>
                            <p className="font-medium text-neutral-900 dark:text-neutral-100">
                              {document.fileName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          {documentTypeLabels[document.type]}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(document.status)}
                          {getStatusBadge(document.status)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {document.expirationDate ? (
                          <div>
                            <p className={`text-sm ${
                              isDocumentExpiringSoon(document.expirationDate)
                                ? 'text-yellow-600 dark:text-yellow-400 font-medium'
                                : 'text-neutral-900 dark:text-neutral-100'
                            }`}>
                              {document.expirationDate.toLocaleDateString('fr-FR')}
                            </p>
                            {isDocumentExpiringSoon(document.expirationDate) && (
                              <p className="text-xs text-yellow-500">
                                Expire bientôt
                              </p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-neutral-500 dark:text-neutral-400">
                            Pas d'expiration
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <p className="text-sm text-neutral-900 dark:text-neutral-100">
                          {document.uploadedAt.toLocaleDateString('fr-FR')}
                        </p>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button variant="ghost" size="icon" title="Voir">
                            <EyeIcon className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Télécharger">
                            <CloudArrowDownIcon className="h-4 w-4" />
                          </Button>
                          {document.status === 'pending' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleApproveDocument(document.id)}
                                title="Approuver"
                              >
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={() => handleRejectDocument(document.id)}
                                title="Rejeter"
                              >
                                <XCircleIcon className="h-4 w-4 text-red-500" />
                              </Button>
                            </>
                          )}
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => {
                              setSelectedDocument(document)
                              setShowDeleteModal(true)
                            }}
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {documents.length === 0 && (
                <div className="text-center py-12">
                  <DocumentTextIcon className="h-12 w-12 text-neutral-400 mx-auto mb-4" />
                  <p className="text-neutral-500 dark:text-neutral-400">
                    Aucun document trouvé
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Modal d'upload */}
        <Modal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          title="Ajouter un document"
          size="lg"
        >
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-900 dark:text-neutral-100 mb-2">
                Type de document
              </label>
              <select
                value={selectedDocumentType}
                onChange={(e) => setSelectedDocumentType(e.target.value as DocumentType)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none dark:border-neutral-600 dark:bg-neutral-900"
              >
                {Object.entries(documentTypeLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <FileUpload
              label="Fichier"
              accept=".pdf,.jpg,.jpeg,.png"
              multiple={false}
              maxSize={10}
              onFileSelect={handleFileUpload}
            />

            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowUploadModal(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                disabled={isSubmitting}
                onClick={() => {
                  // Trigger file upload via FileUpload component
                }}
              >
                {isSubmitting ? 'Upload...' : 'Ajouter'}
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de suppression */}
        <Modal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          title="Confirmer la suppression"
        >
          <div className="space-y-4">
            <p className="text-neutral-600 dark:text-neutral-400">
              Êtes-vous sûr de vouloir supprimer le document{' '}
              <span className="font-medium">{selectedDocument?.fileName}</span> ?
            </p>
            <p className="text-sm text-red-600">
              Cette action est irréversible.
            </p>
            <div className="flex items-center justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteDocument}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </DashboardLayout>
  )
}