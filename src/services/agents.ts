import { ApiResponse, PaginatedResponse, ApiAgent, CreateAgentRequest, GetAgentsParams } from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class AgentsService {
  private baseURL = API_BASE_URL

  async getAgents(params?: GetAgentsParams): Promise<PaginatedResponse<ApiAgent>> {
    try {
      console.log('🔍 [AgentsService] Récupération des agents...', params)

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('specs', params.filter)
      if (params?.status) queryParams.append('status', params.status)
      if (params?.partnerUuid) queryParams.append('partnerUuid', params.partnerUuid)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/agents${queryParams.toString() ? `?${queryParams.toString()}` : ''}`
      const response = await authService.authenticatedFetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiAgent>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }

      console.log('🔍 [AgentsService] Réponse API agents:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [AgentsService] Erreur API agents:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des agents')
      }

      console.log('✅ [AgentsService] Agents récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [AgentsService] Erreur getAgents:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getAgent(uuid: string): Promise<ApiAgent> {
    try {
      console.log('🔍 [AgentsService] Récupération agent...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/agents/${uuid}`, { method: 'GET' })
      const data: ApiResponse<ApiAgent> = await response.json()
      console.log('🔍 [AgentsService] Réponse API agent:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [AgentsService] Erreur API agent:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération de l\'agent')
      }
      console.log('✅ [AgentsService] Agent récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [AgentsService] Erreur getAgent:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createAgent(payload: CreateAgentRequest): Promise<ApiAgent> {
    try {
      console.log('🔍 [AgentsService] Création agent...', payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/agents`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiAgent> = await response.json()
      console.log('🔍 [AgentsService] Réponse API create agent:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [AgentsService] Erreur API create agent:', data.message)
        throw new Error(data.message || 'Erreur lors de la création de l\'agent')
      }
      console.log('✅ [AgentsService] Agent créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [AgentsService] Erreur createAgent:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const agentsService = new AgentsService()