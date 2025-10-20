import { LoginCredentials, AuthResponse, AuthUser, UserType } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001'

class AuthService {
  private baseURL = API_BASE_URL

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      console.log('🔍 [AuthService] Tentative de connexion...')

      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      })

      console.log('🔍 [AuthService] Statut HTTP:', response.status)

      const data = await response.json()
      console.log('🔍 [AuthService] Réponse API login:', data)

      // Vérifier l'attribut status dans le JSON au lieu du HTTP status
      if (!data.valid || data.status !== 200) {
        console.log('❌ [AuthService] Erreur de connexion API:', data.message)
        throw new Error(data.message || 'Erreur lors de la connexion')
      }

      // Store token in localStorage and cookies
      if (data.data) {
        console.log('✅ [AuthService] Token stocké dans localStorage et cookies')
        localStorage.setItem('auth_token', data.data)

        // Also store in cookies for middleware access
        document.cookie = `auth_token=${data.data}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`
      } else {
        console.log('❌ [AuthService] Pas de token dans la réponse')
      }

      // Adapter la réponse au format attendu
      return {
        token: data.data,
        user: null // Sera récupéré plus tard via l'API
      }
    } catch (error) {
      console.error('❌ [AuthService] Erreur login:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getUserByUUID(uuid: string): Promise<AuthUser> {
    try {
      const token = this.getToken()
      console.log('🔍 [AuthService] getUserByUUID - UUID:', uuid)
      console.log('🔍 [AuthService] getUserByUUID - Token:', token ? 'Présent' : 'Absent')

      const response = await fetch(`${this.baseURL}/auth/user/${uuid}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()
      console.log('🔍 [AuthService] getUserByUUID - Réponse complète:', data)

      // Vérifier l'attribut status dans le JSON au lieu du HTTP status
      if (!data.valid || data.status !== 200) {
        console.log('❌ [AuthService] getUserByUUID - Erreur API:', data.message)
        throw new Error(data.message || 'Erreur lors de la récupération des données utilisateur')
      }

      if (!data.data) {
        console.log('❌ [AuthService] getUserByUUID - Pas de données utilisateur')
        throw new Error('Aucune donnée utilisateur retournée')
      }

      console.log('✅ [AuthService] getUserByUUID - Utilisateur récupéré:', data.data)
      return data.data
    } catch (error) {
      console.error('❌ [AuthService] getUserByUUID - Erreur:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      console.log('🔍 [AuthService] getCurrentUser appelée')

      const token = this.getToken()
      if (!token || !this.isTokenValid()) {
        console.log('❌ [AuthService] Token absent ou invalide')
        return null
      }

      console.log('🔍 [AuthService] Décodage du JWT...')
      // Decode JWT to get user ID
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('🔍 [AuthService] Payload JWT:', payload)
      console.log('🔍 [AuthService] Toutes les propriétés du payload:', Object.keys(payload))

      const userId = payload.uuid || payload.id || payload.userId || payload.user_id || payload.sub
      console.log('🔍 [AuthService] User ID extrait:', userId)

      if (!userId) {
        console.log('❌ [AuthService] Pas d\'ID utilisateur dans le token')
        throw new Error('Token invalide - pas d\'ID utilisateur')
      }

      console.log('🔍 [AuthService] Appel API getUserByUUID avec ID:', userId)
      return await this.getUserByUUID(userId)
    } catch (error) {
      console.error('❌ [AuthService] Erreur lors de la récupération de l\'utilisateur courant:', error)
      return null
    }
  }

  async getSessions(): Promise<any[]> {
    try {
      const token = this.getToken()
      const response = await fetch(`${this.baseURL}/sessions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des sessions')
      }

      return await response.json()
    } catch (error) {
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Erreur de connexion au serveur')
    }
  }

  async logout(): Promise<void> {
    try {
      console.log('🔐 [AuthService] Déconnexion...')

      const token = this.getToken()
      if (token) {
        // Appeler l'endpoint de logout si disponible
        try {
          await fetch(`${this.baseURL}/auth/logout`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          })
        } catch (error) {
          console.warn('Erreur lors de l\'appel logout API:', error)
        }
      }

      // Nettoyer le stockage local et les cookies
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      // Remove cookie
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'

      console.log('✅ [AuthService] Déconnexion réussie')
    } catch (error) {
      console.error('❌ [AuthService] Erreur logout:', error)
      // En cas d'erreur, on nettoie quand même le stockage local et les cookies
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    }
  }

  clearExpiredToken(): void {
    if (!this.isTokenValid()) {
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'
    }
  }

  // Intercepteur pour gérer les erreurs 401
  async handleUnauthorized(): Promise<void> {
    console.log('🔐 [AuthService] Token expiré, déconnexion automatique')
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax'

    // Rediriger vers la page de login
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
  }

  // Méthode pour faire des requêtes authentifiées avec gestion automatique des erreurs
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken()

    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers
    })

    // Si 401, rediriger automatiquement vers le login
    if (response.status === 401) {
      await this.handleUnauthorized()
      throw new Error('Session expirée, veuillez vous reconnecter')
    }

    return response
  }

  getToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('auth_token')
  }

  isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false

    try {
      // Check if token has proper JWT format (3 parts separated by dots)
      const parts = token.split('.')
      if (parts.length !== 3) {
        return false
      }

      // Real JWT validation
      const payload = JSON.parse(atob(parts[1]))

      // Check if token has expiration and if it's still valid
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        console.log('🔐 [AuthService] Token expiré')
        return false
      }

      return true
    } catch (error) {
      console.error('Erreur lors de la validation du token:', error)
      return false
    }
  }

  isAuthenticated(): boolean {
    return this.isTokenValid()
  }
}

export const authService = new AuthService()