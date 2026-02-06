import {
  ApiResponse,
  PaginatedResponse,
  ApiPermission
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class PermissionsService {
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

  async getPermissions(params?: {
    page?: number
    size?: number
    filter?: string
  }): Promise<PaginatedResponse<ApiPermission>> {
    try {
      console.log('🔍 [PermissionsService] Récupération des permissions...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('specs', params.filter)

      const url = `${this.baseURL}/permissions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data: ApiResponse<PaginatedResponse<ApiPermission>> = await response.json()
      console.log('🔍 [PermissionsService] Réponse API permissions:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [PermissionsService] Erreur API permissions:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des permissions')
      }

      console.log('✅ [PermissionsService] Permissions récupérées:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [PermissionsService] Erreur getPermissions:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getAllPermissions(): Promise<ApiPermission[]> {
    try {
      console.log('🔍 [PermissionsService] Récupération de toutes les permissions...')

      // Récupération de la première page pour connaître le nombre total
      const firstPage = await this.getPermissions({ page: 0, size: 100 })

      if (firstPage.totalElements <= 100) {
        return firstPage.content
      }

      // Si il y a plus de 100 permissions, récupérer toutes les pages
      const allPermissions: ApiPermission[] = [...firstPage.content]
      const totalPages = firstPage.totalPages

      for (let page = 1; page < totalPages; page++) {
        const pageData = await this.getPermissions({ page, size: 100 })
        allPermissions.push(...pageData.content)
      }

      console.log('✅ [PermissionsService] Toutes les permissions récupérées:', allPermissions.length)
      return allPermissions
    } catch (error) {
      console.error('❌ [PermissionsService] Erreur getAllPermissions:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const permissionsService = new PermissionsService()