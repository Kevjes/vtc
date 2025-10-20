import {
  ApiResponse,
  PaginatedResponse,
  ApiSession
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class SessionsService {
  private baseURL = API_BASE_URL

  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  private getHeaders() {
    const token = this.getToken()
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    }
  }

  async getSessions(params?: {
    page?: number
    size?: number
    filter?: string
  }): Promise<PaginatedResponse<ApiSession>> {
    try {
      console.log('🔍 [SessionsService] Récupération des sessions...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)

      const url = `${this.baseURL}/sessions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data: ApiResponse<PaginatedResponse<ApiSession>> = await response.json()
      console.log('🔍 [SessionsService] Réponse API sessions:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [SessionsService] Erreur API sessions:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des sessions')
      }

      console.log('✅ [SessionsService] Sessions récupérées:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [SessionsService] Erreur getSessions:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const sessionsService = new SessionsService()