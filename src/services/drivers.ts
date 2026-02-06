import {
  ApiResponse,
  PaginatedResponse,
  ApiDriver,
  CreateDriverRequest,
  UpdateDriverRequest
} from '@/types'
import { authService } from './auth'
import { usersService } from './users'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8007/api'

class DriversService {
  private baseURL = API_BASE_URL

  async getDrivers(params?: {
    page?: number
    size?: number
    filter?: string
    partnerId?: string
    vehicleType?: string
    active?: boolean
  }): Promise<PaginatedResponse<ApiDriver>> {
    try {
      console.log('🔍 [DriversService] Récupération des chauffeurs...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.partnerId) queryParams.append('partnerId', params.partnerId)
      if (params?.vehicleType) queryParams.append('vehicleType', params.vehicleType)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/drivers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, {
        method: 'GET'
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiDriver>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }
      console.log('🔍 [DriversService] Réponse API drivers:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API drivers:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des chauffeurs')
      }

      console.log('✅ [DriversService] Chauffeurs récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur getDrivers:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getDriver(uuid: string): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Récupération chauffeur...', uuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, {
        method: 'GET'
      })

      const data: ApiResponse<ApiDriver> = await response.json()
      console.log('🔍 [DriversService] Réponse API driver:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération du chauffeur')
      }

      console.log('✅ [DriversService] Chauffeur récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur getDriver:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createDriver(driverData: CreateDriverRequest): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Création chauffeur...', driverData)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers`, {
        method: 'POST',
        body: JSON.stringify(driverData)
      })

      const data: ApiResponse<ApiDriver> = await response.json()
      console.log('🔍 [DriversService] Réponse API create driver:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API create driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la création du chauffeur')
      }

      console.log('✅ [DriversService] Chauffeur créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur createDriver:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateDriver(uuid: string, driverData: UpdateDriverRequest): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Mise à jour chauffeur...', uuid, driverData)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(driverData)
      })

      // Parse safely to handle empty/204 responses
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      if (!text || text.trim().length === 0 || response.status === 204) {
        console.warn('⚠️ [DriversService] Réponse vide pour updateDriver, récupération du chauffeur…')
        return await this.getDriver(uuid)
      }
      let data: ApiResponse<ApiDriver>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }
      console.log('🔍 [DriversService] Réponse API update driver:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API update driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du chauffeur')
      }

      console.log('✅ [DriversService] Chauffeur mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur updateDriver:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteDriver(uuid: string): Promise<void> {
    try {
      console.log('🔍 [DriversService] Suppression chauffeur...', uuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, {
        method: 'DELETE'
      })

      // Parse safely to handle empty/204 responses
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      const text = await response.text()
      if (!text || text.trim().length === 0 || response.status === 204) {
        console.log('✅ [DriversService] Chauffeur supprimé (réponse vide/204)')
        return
      }
      let data: ApiResponse<void>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }
      console.log('🔍 [DriversService] Réponse API delete driver:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API delete driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du chauffeur')
      }

      console.log('✅ [DriversService] Chauffeur supprimé')
    } catch (error) {
      console.error('❌ [DriversService] Erreur deleteDriver:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateDocumentStatus(docId: string | number, status: string): Promise<any> {
    try {
      console.log('🔍 [DriversService] Mise à jour statut document...', docId, status)

      const response = await authService.authenticatedFetch(`${API_BASE_URL}/documents/${docId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })

      const data: ApiResponse<any> = await response.json()
      if (!data.valid || data.status !== 200) {
        throw new Error(data.message || 'Erreur lors de la mise à jour du statut du document')
      }

      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur updateDocumentStatus:', error)
      throw error
    }
  }

  async assignPartner(driverUuid: string, partnerUuid: string): Promise<any> {
    try {
      console.log('🔍 [DriversService] Assignation partenaire...', driverUuid, partnerUuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${driverUuid}/assign-partner/${partnerUuid}`, {
        method: 'PUT'
      })

      const data: ApiResponse<any> = await response.json()
      if (!data.valid || data.status !== 200) {
        throw new Error(data.message || 'Erreur lors de l\'assignation du partenaire')
      }

      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur assignPartner:', error)
      throw error
    }
  }

  async unassignPartner(driverUuid: string): Promise<any> {
    try {
      console.log('🔍 [DriversService] Désassignation partenaire...', driverUuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${driverUuid}/unassign-partner`, {
        method: 'PUT'
      })

      const data: ApiResponse<any> = await response.json()
      if (!data.valid || data.status !== 200) {
        throw new Error(data.message || 'Erreur lors de la désassignation du partenaire')
      }

      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur unassignPartner:', error)
      throw error
    }
  }

  async getDriverHistory(uuid: string): Promise<any[]> {
    try {
      console.log('🔍 [DriversService] Récupération historique chauffeur...', uuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}/history`, {
        method: 'GET'
      })

      const data: ApiResponse<any[]> = await response.json()
      if (!data.valid || data.status !== 200) {
        throw new Error(data.message || 'Erreur lors de la récupération de l\'historique')
      }

      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur getDriverHistory:', error)
      throw error
    }
  }

  async uploadDriverDocument(uuid: string, file: File, documentType: string): Promise<any> {
    try {
      console.log('🔍 [DriversService] Upload document chauffeur...', uuid, documentType)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('documentType', documentType)

      // Note: For file uploads, we need to handle headers differently
      const token = authService.getToken()
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      // Don't set Content-Type for FormData - let the browser set it

      const response = await fetch(`${this.baseURL}/drivers/${uuid}/documents`, {
        method: 'POST',
        headers,
        body: formData
      })

      const data: ApiResponse<any> = await response.json()
      console.log('🔍 [DriversService] Réponse API upload document:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API upload document:', data.message)
        throw new Error(data.message || 'Erreur lors de l\'upload du document')
      }

      console.log('✅ [DriversService] Document uploadé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur uploadDriverDocument:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getDriverDocuments(uuid: string): Promise<any[]> {
    try {
      console.log('🔍 [DriversService] Récupération documents chauffeur...', uuid)

      const response = await authService.authenticatedFetch(`${API_BASE_URL}/documents/driver/${uuid}`, {
        method: 'GET'
      })

      const data: ApiResponse<any[]> = await response.json()
      console.log('🔍 [DriversService] Réponse API documents:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API documents:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des documents')
      }

      console.log('✅ [DriversService] Documents récupérés:', data.data.length)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur getDriverDocuments:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getDriverEvaluations(uuid: string): Promise<any[]> {
    try {
      console.log('🔍 [DriversService] Récupération évaluations chauffeur...', uuid)

      // Utilisation de l'endpoint global avec filtrage par driver.uuid
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations?specs=driver.uuid:'${uuid}'&size=100`, {
        method: 'GET'
      })

      const data: ApiResponse<PaginatedResponse<any>> = await response.json()
      console.log('🔍 [DriversService] Réponse API évaluations:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API évaluations:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des évaluations')
      }

      // Puisque c'est paginé, on récupère le contenu
      const evaluations = data.data.content || []
      console.log('✅ [DriversService] Évaluations récupérées:', evaluations.length)
      return evaluations
    } catch (error) {
      console.error('❌ [DriversService] Erreur getDriverEvaluations:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateDriverStatus(uuid: string, active: boolean): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Mise à jour statut chauffeur via Users API...', uuid, active)

      // Récupérer le chauffeur pour obtenir l'UUID utilisateur associé
      const driver = await this.getDriver(uuid)
      const userUuid = driver.user.uuid

      // Mettre à jour le statut de l'utilisateur associé
      await usersService.updateUser(userUuid, { active })

      // Récupérer et retourner le chauffeur mis à jour
      const updatedDriver = await this.getDriver(uuid)
      console.log('✅ [DriversService] Statut mis à jour via Users API:', updatedDriver.user.active)
      return updatedDriver
    } catch (error) {
      console.error('❌ [DriversService] Erreur updateDriverStatus (Users API):', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const driversService = new DriversService()