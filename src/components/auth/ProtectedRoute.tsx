'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRoles?: string[]
}

export function ProtectedRoute({ children, requiredRoles = [] }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, isLoading, router])

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
      </div>
    )
  }

  // If not authenticated, don't render anything (redirect will happen in useEffect)
  if (!isAuthenticated) {
    return null
  }

  // Check role-based access
  if (requiredRoles.length > 0 && user) {
    const userRoles = user.roles?.map(role => role.name) || []

    // ROOT role has access to everything
    const hasRootAccess = userRoles.includes('ROOT')
    const hasRequiredRole = hasRootAccess || requiredRoles.some(role => userRoles.includes(role))

    if (!hasRequiredRole) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-neutral-50">
          <div className="text-center">
            <div className="bg-red-100 rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-neutral-900 mb-2">
              Accès non autorisé
            </h2>
            <p className="text-neutral-600 mb-4">
              Vous n'avez pas les permissions nécessaires pour accéder à cette page.
            </p>
            <button
              onClick={() => router.push('/')}
              className="text-primary-600 hover:text-primary-700 font-medium"
            >
              Retour à l'accueil
            </button>
          </div>
        </div>
      )
    }
  }

  return <>{children}</>
}