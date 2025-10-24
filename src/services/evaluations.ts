import { ApiResponse, PaginatedResponse } from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

// Types pour les évaluations
export interface ApiEvaluation {
  uuid: string
  version: number
  code: string
  slug?: string | null
  createdBy?: number
  createdDate: string
  lastModifiedBy?: number
  lastModifiedDate: string
  deleted?: boolean
  isDeletable?: boolean
  driver: {
    uuid: string
    user: {
      firstname: string
      lastname: string
      email: string
      phone: string
    }
  }
  partner: {
    uuid: string
    name: string
  }
  evaluator: {
    uuid: string
    firstname: string
    lastname: string
  }
  template: {
    uuid: string
    name: string
  }
  comments?: string
  periodStart: string
  periodEnd: string
  evaluationDate: string
  status: 'PENDING' | 'COMPLETED' | 'VALIDATED' | 'REJECTED'
  scores: ApiEvaluationScore[]
  overallScore?: number
}

export interface ApiEvaluationScore {
  uuid: string
  criteria: {
    uuid: string
    name: string
    description?: string
  }
  numericValue: number
  comment?: string
}

export interface CreateEvaluationRequest {
  driver: { uuid: string }
  partner: { uuid: string }
  evaluator: { uuid: string }
  template: { uuid: string }
  comments?: string
  periodStart: string
  periodEnd: string
  scores: Array<{
    criteria: { uuid: string }
    numericValue: number
    comment?: string
  }>
}

export interface UpdateEvaluationRequest {
  driver?: { uuid: string }
  partner?: { uuid: string }
  evaluator?: { uuid: string }
  template?: { uuid: string }
  comments?: string
  periodStart?: string
  periodEnd?: string
  scores?: Array<{
    criteria: { uuid: string }
    numericValue: number
    comment?: string
  }>
}

class EvaluationsService {
  private baseURL = API_BASE_URL

  async getEvaluations(params?: { 
    page?: number
    size?: number
    filter?: string
    status?: string
  }): Promise<PaginatedResponse<ApiEvaluation>> {
    try {
      console.log('🔍 [EvaluationsService] Récupération des évaluations...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.status) queryParams.append('status', params.status)

      const url = `${this.baseURL}/evaluations${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiEvaluation>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }

      console.log('🔍 [EvaluationsService] Réponse API evaluations:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API evaluations:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des évaluations')
      }

      console.log('✅ [EvaluationsService] Évaluations récupérées:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur getEvaluations:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getEvaluation(uuid: string): Promise<ApiEvaluation> {
    try {
      console.log('🔍 [EvaluationsService] Récupération évaluation...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations/${uuid}`, { method: 'GET' })
      const data: ApiResponse<ApiEvaluation> = await response.json()
      console.log('🔍 [EvaluationsService] Réponse API evaluation:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API evaluation:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération de l\'évaluation')
      }
      console.log('✅ [EvaluationsService] Évaluation récupérée:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur getEvaluation:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createEvaluation(payload: CreateEvaluationRequest): Promise<ApiEvaluation> {
    try {
      console.log('🔍 [EvaluationsService] Création évaluation...', payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluation> = await response.json()
      console.log('🔍 [EvaluationsService] Réponse API create evaluation:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API create evaluation:', data.message)
        throw new Error(data.message || 'Erreur lors de la création de l\'évaluation')
      }
      console.log('✅ [EvaluationsService] Évaluation créée:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur createEvaluation:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateEvaluation(uuid: string, payload: UpdateEvaluationRequest): Promise<ApiEvaluation> {
    try {
      console.log('🔍 [EvaluationsService] Mise à jour évaluation...', uuid, payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluation> = await response.json()
      console.log('🔍 [EvaluationsService] Réponse API update evaluation:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API update evaluation:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour de l\'évaluation')
      }
      console.log('✅ [EvaluationsService] Évaluation mise à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur updateEvaluation:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteEvaluation(uuid: string): Promise<void> {
    try {
      console.log('🔍 [EvaluationsService] Suppression évaluation...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations/${uuid}`, { method: 'DELETE' })
      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [EvaluationsService] Réponse API delete evaluation:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API delete evaluation:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression de l\'évaluation')
      }
      console.log('✅ [EvaluationsService] Évaluation supprimée')
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur deleteEvaluation:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateEvaluationStatus(uuid: string, status: 'PENDING' | 'COMPLETED' | 'VALIDATED' | 'REJECTED'): Promise<ApiEvaluation> {
    try {
      console.log('🔍 [EvaluationsService] Mise à jour statut évaluation...', uuid, status)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluations/${uuid}/update-status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
      const data: ApiResponse<ApiEvaluation> = await response.json()
      console.log('🔍 [EvaluationsService] Réponse API update status:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationsService] Erreur API update status:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du statut')
      }
      console.log('✅ [EvaluationsService] Statut mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationsService] Erreur updateEvaluationStatus:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const evaluationsService = new EvaluationsService()