import { ApiResponse, PaginatedResponse, ApiDriver, CreateDriverRequest, UpdateDriverRequest } from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class DriversService {
  private baseURL = API_BASE_URL

  async getDrivers(params?: { 
    page?: number
    size?: number
    filter?: string
    active?: boolean
  }): Promise<PaginatedResponse<ApiDriver>> {
    try {
      console.log('🔍 [DriversService] Récupération des chauffeurs...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/drivers${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, { method: 'GET' })
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
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getDriver(uuid: string): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Récupération chauffeur...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, { method: 'GET' })
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
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createDriver(payload: CreateDriverRequest): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Création chauffeur...', payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers`, {
        method: 'POST',
        body: JSON.stringify(payload)
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
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateDriver(uuid: string, payload: UpdateDriverRequest): Promise<ApiDriver> {
    try {
      console.log('🔍 [DriversService] Mise à jour chauffeur...', uuid, payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiDriver> = await response.json()
      console.log('🔍 [DriversService] Réponse API update driver:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API update driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du chauffeur')
      }
      console.log('✅ [DriversService] Chauffeur mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [DriversService] Erreur updateDriver:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteDriver(uuid: string): Promise<void> {
    try {
      console.log('🔍 [DriversService] Suppression chauffeur...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/drivers/${uuid}`, { method: 'DELETE' })
      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [DriversService] Réponse API delete driver:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [DriversService] Erreur API delete driver:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du chauffeur')
      }
      console.log('✅ [DriversService] Chauffeur supprimé')
    } catch (error) {
      console.error('❌ [DriversService] Erreur deleteDriver:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const driversService = new DriversService()