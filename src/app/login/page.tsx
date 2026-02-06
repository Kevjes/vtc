'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button, Input, Card } from '@/components/ui'
import { authService } from '@/services/auth'

export default function LoginPage() {
  const [view, setView] = useState<'login' | 'forgot' | 'verify' | 'reset'>('login')
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    otpCode: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
    if (success) setSuccess('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (view === 'login') {
      if (!formData.login || !formData.password) {
        setError('Veuillez remplir tous les champs')
        return
      }

      setIsSubmitting(true)
      setError('')

      try {
        await login({ login: formData.login, password: formData.password })
        const redirectTo = searchParams?.get('redirect') || '/'
        router.push(redirectTo)
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur de connexion')
      } finally {
        setIsSubmitting(false)
      }
    } else if (view === 'forgot') {
      if (!formData.login) {
        setError('Veuillez entrer votre nom d\'utilisateur')
        return
      }
      setIsSubmitting(true)
      try {
        await authService.forgotPassword(formData.login)
        setSuccess('Un code OTP a été envoyé (si configuré)')
        setView('verify')
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur lors de la demande')
      } finally {
        setIsSubmitting(false)
      }
    } else if (view === 'verify') {
      if (!formData.otpCode) {
        setError('Veuillez entrer le code OTP')
        return
      }
      setIsSubmitting(true)
      try {
        await authService.verifyOtp(formData.login, formData.otpCode)
        setSuccess('OTP validé')
        setView('reset')
      } catch (error) {
        setError(error instanceof Error ? error.message : 'OTP invalide')
      } finally {
        setIsSubmitting(false)
      }
    } else if (view === 'reset') {
      if (!formData.newPassword || formData.newPassword !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas')
        return
      }
      setIsSubmitting(true)
      try {
        await authService.resetPassword({
          login: formData.login,
          otpCode: formData.otpCode,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
        setSuccess('Mot de passe réinitialisé avec succès')
        setView('login')
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Erreur lors de la réinitialisation')
      } finally {
        setIsSubmitting(false)
      }
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
            {view === 'login' ? 'Administration' : 'Récupération de compte'}
          </p>
        </div>

        {/* Form Container */}
        <Card className="p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'login' && (
              <>
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
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label htmlFor="password" className="block text-sm font-medium text-neutral-700">
                      Mot de passe
                    </label>
                    <button
                      type="button"
                      onClick={() => setView('forgot')}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Entrez votre mot de passe"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {view === 'forgot' && (
              <>
                <p className="text-sm text-neutral-600 mb-4">
                  Entrez votre nom d'utilisateur pour recevoir un code de réinitialisation.
                </p>
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
                  />
                </div>
              </>
            )}

            {view === 'verify' && (
              <>
                <p className="text-sm text-neutral-600 mb-4">
                  Entrez le code OTP que vous avez reçu.
                </p>
                <div>
                  <label htmlFor="otpCode" className="block text-sm font-medium text-neutral-700 mb-2">
                    Code OTP
                  </label>
                  <Input
                    id="otpCode"
                    name="otpCode"
                    type="text"
                    value={formData.otpCode}
                    onChange={handleChange}
                    placeholder="Code à 6 chiffres"
                    disabled={isSubmitting}
                  />
                </div>
              </>
            )}

            {view === 'reset' && (
              <>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                      Nouveau mot de passe
                    </label>
                    <Input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      placeholder="Nouveau mot de passe"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                      Confirmer le mot de passe
                    </label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirmez le mot de passe"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              </>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            <div className="space-y-3">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? 'Traitement...' :
                  view === 'login' ? 'Se connecter' :
                    view === 'forgot' ? 'Envoyer le code' :
                      view === 'verify' ? 'Vérifier le code' : 'Réinitialiser'}
              </Button>

              {view !== 'login' && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setView('login')}
                  className="w-full"
                  disabled={isSubmitting}
                >
                  Retour au login
                </Button>
              )}
            </div>
          </form>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm">
          © 2025 VTC Dashboard. Tous droits réservés.
        </div>
      </div>
    </div>
  )
}