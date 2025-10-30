import {
  ApiResponse,
  PaginatedResponse,
  ApiUser,
  CreateUserRequest,
  UpdateUserRequest
} from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class UsersService {
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

  async getUsers(params?: {
    page?: number
    size?: number
    filter?: string
  }): Promise<PaginatedResponse<ApiUser>> {
    try {
      console.log('🔍 [UsersService] Récupération des utilisateurs...')

      const queryParams = new URLSearchParams()
      if (params?.page !== undefined) queryParams.append('page', params.page.toString())
      if (params?.size !== undefined) queryParams.append('size', params.size.toString())
      if (params?.filter) queryParams.append('filter', params.filter)

      const url = `${this.baseURL}/users${queryParams.toString() ? `?${queryParams.toString()}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders()
      })

      const data: ApiResponse<PaginatedResponse<ApiUser>> = await response.json()
      console.log('🔍 [UsersService] Réponse API users:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [UsersService] Erreur API users:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des utilisateurs')
      }

      console.log('✅ [UsersService] Utilisateurs récupérés:', data.data.content.length)
      return data.data
    } catch (error) {
      console.error('❌ [UsersService] Erreur getUsers:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async createUser(userData: CreateUserRequest): Promise<ApiUser> {
    try {
      console.log('🔍 [UsersService] Création utilisateur...', userData)

      const response = await fetch(`${this.baseURL}/users`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      })

      const data: ApiResponse<ApiUser> = await response.json()
      console.log('🔍 [UsersService] Réponse API create user:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [UsersService] Erreur API create user:', data.message)
        throw new Error(data.message || 'Erreur lors de la création de l\'utilisateur')
      }

      console.log('✅ [UsersService] Utilisateur créé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [UsersService] Erreur createUser:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async updateUser(uuid: string, userData: UpdateUserRequest): Promise<ApiUser> {
    try {
      console.log('🔍 [UsersService] Mise à jour utilisateur...', uuid, userData)

      const response = await fetch(`${this.baseURL}/users/${uuid}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(userData)
      })

      const data: ApiResponse<ApiUser> = await response.json()
      console.log('🔍 [UsersService] Réponse API update user:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [UsersService] Erreur API update user:', data.message)
        throw new Error(data.message || 'Erreur lors de la mise à jour de l\'utilisateur')
      }

      console.log('✅ [UsersService] Utilisateur mis à jour:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [UsersService] Erreur updateUser:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async disableUser(uuid: string): Promise<ApiUser> {
    try {
      console.log('🔍 [UsersService] Désactivation utilisateur...', uuid)

      const response = await fetch(`${this.baseURL}/users/${uuid}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify({ active: false })
      })

      const data: ApiResponse<ApiUser> = await response.json()
      console.log('🔍 [UsersService] Réponse API disable user:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [UsersService] Erreur API disable user:', data.message)
        throw new Error(data.message || 'Erreur lors de la désactivation de l\'utilisateur')
      }

      console.log('✅ [UsersService] Utilisateur désactivé:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [UsersService] Erreur disableUser:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async deleteUser(uuid: string): Promise<void> {
    try {
      console.log('🔍 [UsersService] Suppression utilisateur...', uuid)

      const response = await fetch(`${this.baseURL}/users/${uuid}`, {
        method: 'DELETE',
        headers: this.getHeaders()
      })

      const data: ApiResponse<void> = await response.json()
      console.log('🔍 [UsersService] Réponse API delete user:', data)

      if (!data.valid || data.status !== 200) {
        console.log('❌ [UsersService] Erreur API delete user:', data.message)
        throw new Error(data.message || 'Erreur lors de la suppression de l\'utilisateur')
      }

      console.log('✅ [UsersService] Utilisateur supprimé')
    } catch (error) {
      console.error('❌ [UsersService] Erreur deleteUser:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }
}

export const usersService = new UsersService()