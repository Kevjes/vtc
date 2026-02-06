import {
  ApiResponse,
  PaginatedResponse,
  ApiPartner,
  CreatePartnerRequest,
  UpdatePartnerRequest
} from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8007/api'


class PartnersService {

  private baseURL = API_BASE_URL

  async getPartners(params?: {
    page?: number
    size?: number
    filter?: string
    status?: string
    active?: boolean
  }): Promise<PaginatedResponse<ApiPartner>> {
    try {
      console.log('🔍 [PartnersService] Récupération des partenaires...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/partners${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

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

      let data: ApiResponse<PaginatedResponse<ApiPartner>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }
      console.log('🔍 [PartnersService] Réponse API partners:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PartnersService] Erreur API partners:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des partenaires')
      }

      console.log('✅ [PartnersService] Partenaires récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [PartnersService] Erreur getPartners:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getPartner(uuid: string): Promise<ApiPartner> {
    try {
      console.log('🔍 [PartnersService] Récupération partenaire...', uuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/partners/${uuid}`, {
        method: 'GET'
      })

      const data: ApiResponse<ApiPartner> = await response.json()
      console.log('🔍 [PartnersService] Réponse API partner:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PartnersService] Erreur API partner:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération du partenaire')
      }

      console.log('✅ [PartnersService] Partenaire récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [PartnersService] Erreur getPartner:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createPartner(partnerData: CreatePartnerRequest): Promise<ApiPartner> {
    try {
      console.log('🔍 [PartnersService] Création partenaire...', partnerData)

      const response = await authService.authenticatedFetch(`${this.baseURL}/partners`, {
        method: 'POST',
        body: JSON.stringify(partnerData)
      })

      const data: ApiResponse<ApiPartner> = await response.json()
      console.log('🔍 [PartnersService] Réponse API create partner:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PartnersService] Erreur API create partner:', data.message)
        throw new Error(data.message || 'Erreur lors de la création du partenaire')
      }

      console.log('✅ [PartnersService] Partenaire créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [PartnersService] Erreur createPartner:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updatePartner(uuid: string, partnerData: UpdatePartnerRequest): Promise<ApiPartner> {
    try {
      console.log('🔍 [PartnersService] Mise à jour partenaire...', uuid, partnerData)

      const response = await authService.authenticatedFetch(`${this.baseURL}/partners/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(partnerData)
      })

      const data: ApiResponse<ApiPartner> = await response.json()
      console.log('🔍 [PartnersService] Réponse API update partner:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PartnersService] Erreur API update partner:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du partenaire')
      }

      console.log('✅ [PartnersService] Partenaire mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [PartnersService] Erreur updatePartner:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deletePartner(uuid: string): Promise<void> {
    try {
      console.log('🔍 [PartnersService] Suppression partenaire...', uuid)

      const response = await authService.authenticatedFetch(`${this.baseURL}/partners/${uuid}`, {
        method: 'DELETE'
      })

      const data: ApiResponse<string> = await response.json()
      console.log('🔍 [PartnersService] Réponse API delete partner:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PartnersService] Erreur API delete partner:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du partenaire')
      }

      console.log('✅ [PartnersService] Partenaire supprimé')
    } catch (error) {
      console.error('❌ [PartnersService] Erreur deletePartner:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updatePartnerStatus(uuid: string, status: string): Promise<ApiPartner> {
    return this.updatePartner(uuid, { status: status as any })
  }
}

export const partnersService = new PartnersService()