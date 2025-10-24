import { ApiResponse, PaginatedResponse, ApiEvaluationTemplate, CreateEvaluationTemplateRequest, UpdateEvaluationTemplateRequest } from '@/types'
import { authService } from './auth'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class EvaluationTemplatesService {
  private baseURL = API_BASE_URL

  async getTemplates(params?: { 
    page?: number
    size?: number
    filter?: string
    active?: boolean
  }): Promise<PaginatedResponse<ApiEvaluationTemplate>> {
    try {
      console.log('🔍 [EvaluationTemplatesService] Récupération des templates...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)
      if (params?.active !== undefined) queryParams.append('active', params.active.toString())

      const url = `${this.baseURL}/evaluation-templates${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await authService.authenticatedFetch(url, { method: 'GET' })
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const text = await response.text()
      if (!text) {
        throw new Error('Réponse vide du serveur')
      }

      let data: ApiResponse<PaginatedResponse<ApiEvaluationTemplate>>
      try {
        data = JSON.parse(text)
      } catch (parseError) {
        console.error('Erreur parsing JSON:', text)
        throw new Error('Réponse serveur invalide (JSON malformé)')
      }

      console.log('🔍 [EvaluationTemplatesService] Réponse API templates:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationTemplatesService] Erreur API templates:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des templates')
      }

      console.log('✅ [EvaluationTemplatesService] Templates récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationTemplatesService] Erreur getTemplates:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getTemplate(uuid: string): Promise<ApiEvaluationTemplate> {
    try {
      console.log('🔍 [EvaluationTemplatesService] Récupération template...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-templates/${uuid}`, { method: 'GET' })
      const data: ApiResponse<ApiEvaluationTemplate> = await response.json()
      console.log('🔍 [EvaluationTemplatesService] Réponse API template:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationTemplatesService] Erreur API template:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération du template')
      }
      console.log('✅ [EvaluationTemplatesService] Template récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationTemplatesService] Erreur getTemplate:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createTemplate(payload: CreateEvaluationTemplateRequest): Promise<ApiEvaluationTemplate> {
    try {
      console.log('🔍 [EvaluationTemplatesService] Création template...', payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-templates`, {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluationTemplate> = await response.json()
      console.log('🔍 [EvaluationTemplatesService] Réponse API create template:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationTemplatesService] Erreur API create template:', data.message)
        throw new Error(data.message || 'Erreur lors de la création du template')
      }
      console.log('✅ [EvaluationTemplatesService] Template créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationTemplatesService] Erreur createTemplate:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateTemplate(uuid: string, payload: UpdateEvaluationTemplateRequest): Promise<ApiEvaluationTemplate> {
    try {
      console.log('🔍 [EvaluationTemplatesService] Mise à jour template...', uuid, payload)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-templates/${uuid}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      const data: ApiResponse<ApiEvaluationTemplate> = await response.json()
      console.log('🔍 [EvaluationTemplatesService] Réponse API update template:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationTemplatesService] Erreur API update template:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du template')
      }
      console.log('✅ [EvaluationTemplatesService] Template mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [EvaluationTemplatesService] Erreur updateTemplate:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteTemplate(uuid: string): Promise<void> {
    try {
      console.log('🔍 [EvaluationTemplatesService] Suppression template...', uuid)
      const response = await authService.authenticatedFetch(`${this.baseURL}/evaluation-templates/${uuid}`, { method: 'DELETE' })
      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [EvaluationTemplatesService] Réponse API delete template:', data)
      if (!data.valid || data.status !== 200) {
        console.log('❌ [EvaluationTemplatesService] Erreur API delete template:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du template')
      }
      console.log('✅ [EvaluationTemplatesService] Template supprimé')
    } catch (error) {
      console.error('❌ [EvaluationTemplatesService] Erreur deleteTemplate:', error)
      if (error instanceof Error) throw error
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const evaluationTemplatesService = new EvaluationTemplatesService()