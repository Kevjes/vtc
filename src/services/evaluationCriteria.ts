import { ApiResponse, PaginatedResponse, ApiEvaluationCriteria } from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class EvaluationCriteriaService {
  private baseURL = API_BASE_URL

  async getCriteria(params?: { page?: number; size?: number; filter?: string; active?: boolean }): Promise<PaginatedResponse<ApiEvaluationCriteria>> {
    try {
      console.log('🔍 [EvaluationCriteriaService] Récupération des critères...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('specs', params.filter)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/evaluation-criteria${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiEvaluationCriteria>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }

      console.log('🔍 [EvaluationCriteriaService] Réponse API criteria:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationCriteriaService] Erreur API criteria:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des critères')
      }

      console.log('✅ [EvaluationCriteriaService] Critères récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationCriteriaService] Erreur getCriteria:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getCriterion(uuid: string): Promise<ApiEvaluationCriteria> {
    try {
      console.log('🔍 [EvaluationCriteriaService] Récupération critère...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-criteria/${uuid}`, { method: 'GET' })
      const data: ApiResponse<ApiEvaluationCriteria> = await response.json()
      console.log('🔍 [EvaluationCriteriaService] Réponse API criterion:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationCriteriaService] Erreur API criterion:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération du critère')
      }
      console.log('✅ [EvaluationCriteriaService] Critère récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationCriteriaService] Erreur getCriterion:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createCriterion(payload: { name: string; description?: string; active: boolean }): Promise<ApiEvaluationCriteria> {
    try {
      console.log('🔍 [EvaluationCriteriaService] Création critère...', payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-criteria`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluationCriteria> = await response.json()
      console.log('🔍 [EvaluationCriteriaService] Réponse API create criterion:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationCriteriaService] Erreur API create criterion:', data.message)
        throw new Error(data.message || 'Erreur lors de la création du critère')
      }
      console.log('✅ [EvaluationCriteriaService] Critère créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationCriteriaService] Erreur createCriterion:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateCriterion(uuid: string, payload: { name?: string; description?: string; active?: boolean }): Promise<ApiEvaluationCriteria> {
    try {
      console.log('🔍 [EvaluationCriteriaService] Mise à jour critère...', uuid, payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-criteria/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluationCriteria> = await response.json()
      console.log('🔍 [EvaluationCriteriaService] Réponse API update criterion:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationCriteriaService] Erreur API update criterion:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du critère')
      }
      console.log('✅ [EvaluationCriteriaService] Critère mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationCriteriaService] Erreur updateCriterion:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteCriterion(uuid: string): Promise<void> {
    try {
      console.log('🔍 [EvaluationCriteriaService] Suppression critère...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-criteria/${uuid}`, { method: 'DELETE' })
      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [EvaluationCriteriaService] Réponse API delete criterion:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationCriteriaService] Erreur API delete criterion:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du critère')
      }
      console.log('✅ [EvaluationCriteriaService] Critère supprimé')
    } catch (error) {
      console.error('❌ [EvaluationCriteriaService] Erreur deleteCriterion:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const evaluationCriteriaService = new EvaluationCriteriaService()