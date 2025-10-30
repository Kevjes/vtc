'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { login, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      const redirectTo = searchParams?.get('redirect') || '/'
      router.push(redirectTo)
    }
  }, [isAuthenticated, router, searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.login || !formData.password) {
      setError('Veuillez remplir tous les champs')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      await login(formData)
      const redirectTo = searchParams?.get('redirect') || '/'
      router.push(redirectTo)
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Erreur de connexion')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
      </div>
    )
  }

  if (isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600 px-4">
      <div className="w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="bg-white rounded-full w-16 h-16 mx-auto flex items-center justify-center mb-4 shadow-lg">
            <span className="text-2xl font-bold text-primary-600">VTC</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            VTC Dashboard
          </h1>
          <p className="text-white/80">
            Connectez-vous à votre espace d'administration
          </p>
        </div>

        {/* Login Form */}
        <Card className="p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="login" className="block text-sm font-medium text-neutral-700 mb-2">
                Nom d'utilisateur
              </label>
              <Input
                id="login"
                name="login"
                type="text"
                value={formData.login}
                onChange={handleChange}
                placeholder="Entrez votre nom d'utilisateur"
                disabled={isSubmitting}
                className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                Mot de passe
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Entrez votre mot de passe"
                disabled={isSubmitting}
                className={error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                  Connexion...
                </div>
              ) : (
                'Se connecter'
              )}
            </Button>
          </form>

          {/* Demo credentials info */}
          <div className="mt-6 p-4 bg-neutral-50 rounded-lg border">
            <p className="text-xs text-neutral-600 mb-2">
              <strong>Identifiants de démonstration :</strong>
            </p>
            <p className="text-xs text-neutral-500">
              Utilisateur: <code className="bg-neutral-200 px-1 rounded">ADMIN</code>
            </p>
            <p className="text-xs text-neutral-500">
              Mot de passe: <code className="bg-neutral-200 px-1 rounded">++--++--</code>
            </p>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/60 text-sm">
            © 2025 VTC Dashboard. Tous droits réservés.
          </p>
        </div>
      </div>
    </div>
  )
}