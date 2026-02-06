import {
  ApiResponse,
  PaginatedResponse,
  ApiRole,
  CreateRoleRequest,
  UpdateRoleRequest
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class RolesService {
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

  async getRoles(params?: {
    page?: number
    size?: number
    filter?: string
  }): Promise<PaginatedResponse<ApiRole>> {
    try {
      console.log('🔍 [RolesService] Récupération des rôles...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('specs', params.filter)

      const url = `${this.baseURL}/roles${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data: ApiResponse<PaginatedResponse<ApiRole>> = await response.json()
      console.log('🔍 [RolesService] Réponse API roles:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [RolesService] Erreur API roles:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des rôles')
      }

      console.log('✅ [RolesService] Rôles récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [RolesService] Erreur getRoles:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createRole(roleData: CreateRoleRequest): Promise<ApiRole> {
    try {
      console.log('🔍 [RolesService] Création rôle...', roleData)

      const response = await fetch(`${this.baseURL}/roles`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(roleData)
      })

      const data: ApiResponse<ApiRole> = await response.json()
      console.log('🔍 [RolesService] Réponse API create role:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [RolesService] Erreur API create role:', data.message)
        throw new Error(data.message || 'Erreur lors de la création du rôle')
      }

      console.log('✅ [RolesService] Rôle créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [RolesService] Erreur createRole:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateRole(uuid: string, roleData: UpdateRoleRequest): Promise<ApiRole> {
    try {
      console.log('🔍 [RolesService] Mise à jour rôle...', uuid, roleData)

      const response = await fetch(`${this.baseURL}/roles/${uuid}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(roleData)
      })

      const data: ApiResponse<ApiRole> = await response.json()
      console.log('🔍 [RolesService] Réponse API update role:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [RolesService] Erreur API update role:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour du rôle')
      }

      console.log('✅ [RolesService] Rôle mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [RolesService] Erreur updateRole:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteRole(uuid: string): Promise<void> {
    try {
      console.log('🔍 [RolesService] Suppression rôle...', uuid)

      const response = await fetch(`${this.baseURL}/roles/${uuid}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [RolesService] Réponse API delete role:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [RolesService] Erreur API delete role:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression du rôle')
      }

      console.log('✅ [RolesService] Rôle supprimé')
    } catch (error) {
      console.error('❌ [RolesService] Erreur deleteRole:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const rolesService = new RolesService()