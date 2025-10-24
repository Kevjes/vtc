'use client'

'use client'

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react'
import { AuthState, AuthUser, LoginCredentials, UserType } from '@/types'
import { authService } from '@/services/auth'

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<void>
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  token: null,
  isLoading: true,
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'CHECK_AUTH_SUCCESS'; payload: { user: AuthUser; token: string } }
  | { type: 'CHECK_AUTH_FAILURE' }
  | { type: 'SET_LOADING'; payload: boolean }

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      }
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }
    case 'LOGIN_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      }
    case 'CHECK_AUTH_SUCCESS':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      }
    case 'CHECK_AUTH_FAILURE':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        isLoading: false,
      }
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      }
    default:
      return state
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'LOGIN_START' })
      const response = await authService.login(credentials)

      // Si pas d'utilisateur dans la réponse login, le récupérer via l'API
      let user = response.user
      if (!user && response.token) {
        user = await authService.getCurrentUser()
      }

      if (!user) {
        throw new Error('Impossible de récupérer les données utilisateur')
      }

      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          token: response.token,
        },
      })
    } catch (error) {
      dispatch({ type: 'LOGIN_FAILURE' })
      throw error
    }
  }

  const logout = async () => {
    try {
      await authService.logout()
      dispatch({ type: 'LOGOUT' })
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      // Forcer le logout local même en cas d'erreur
      dispatch({ type: 'LOGOUT' })
    }
  }

  const checkAuth = async () => {
    try {
      console.log('🔍 [AuthContext] Vérification de l\'authentification...')

      // Clean expired tokens first
      authService.clearExpiredToken()

      const token = authService.getToken()
      console.log('🔍 [AuthContext] Token récupéré:', token ? 'Token présent' : 'Aucun token')

      if (!token) {
        console.log('❌ [AuthContext] Pas de token - échec')
        dispatch({ type: 'CHECK_AUTH_FAILURE' })
        return
      }

      const isValid = authService.isTokenValid()
      console.log('🔍 [AuthContext] Token valide:', isValid)

      if (!isValid) {
        console.log('❌ [AuthContext] Token invalide - échec')
        dispatch({ type: 'CHECK_AUTH_FAILURE' })
        return
      }

      console.log('🔍 [AuthContext] Récupération des données utilisateur...')

      // Get current user from API
      const user = await authService.getCurrentUser()
      console.log('🔍 [AuthContext] Utilisateur récupéré:', user)

      if (!user) {
        console.log('❌ [AuthContext] Pas d\'utilisateur - échec')
        dispatch({ type: 'CHECK_AUTH_FAILURE' })
        return
      }

      console.log('✅ [AuthContext] Authentification réussie')
      dispatch({
        type: 'CHECK_AUTH_SUCCESS',
        payload: {
          user,
          token,
        },
      })
    } catch (error) {
      console.error('❌ [AuthContext] Erreur lors de la vérification de l\'authentification:', error)
      dispatch({ type: 'CHECK_AUTH_FAILURE' })
    }
  }

  useEffect(() => {
    checkAuth()
  }, [])

  const value: AuthContextType = {
    ...state,
    login,
    logout,
    checkAuth,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}