import {
  ApiResponse,
  PaginatedResponse,
  ApiPartner,
  CreatePartnerRequest,
  UpdatePartnerRequest
} from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'


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

  // Note: UPDATE method not supported by API
  async updatePartner(uuid: string, partnerData: UpdatePartnerRequest): Promise<ApiPartner> {
    throw new Error('La mise à jour de partenaires n\'est pas supportée par l\'API')
  }

  // Note: DELETE method not supported by API
  async deletePartner(uuid: string): Promise<void> {
    throw new Error('La suppression de partenaires n\'est pas supportée par l\'API')
  }

  // Note: STATUS UPDATE method not supported by API
  async updatePartnerStatus(uuid: string, active: boolean): Promise<ApiPartner> {
    throw new Error('La mise à jour du statut des partenaires n\'est pas supportée par l\'API')
  }
}

export const partnersService = new PartnersService()