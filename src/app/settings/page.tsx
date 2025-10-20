'use client'

import React, { useState } from 'react'
import { 
  CogIcon,
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
  CreditCardIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline'
import { DashboardLayout } from '@/components/layout'
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button,
  Input,
  Select,
  Switch
} from '@/components/ui'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general')
  const [showPassword, setShowPassword] = useState(false)
  const [settings, setSettings] = useState({
    // Paramètres généraux
    companyName: 'VTC Dashboard',
    email: 'admin@vtc-dashboard.com',
    phone: '+223 70 12 34 56',
    address: 'Bamako, Mali',
    
    // Paramètres de notification
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    marketingEmails: false,
    
    // Paramètres de sécurité
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    
    // Paramètres régionaux
    language: 'fr',
    timezone: 'UTC+0',
    currency: 'XOF',
    dateFormat: 'dd/MM/yyyy',
    
    // Paramètres de paiement
    defaultCommission: '15',
    autoPayouts: true,
    minimumPayout: '50000'
  })

  const tabs = [
    { id: 'general', name: 'Général', icon: CogIcon },
    { id: 'account', name: 'Compte', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Sécurité', icon: ShieldCheckIcon },
    { id: 'regional', name: 'Régional', icon: GlobeAltIcon },
    { id: 'payments', name: 'Paiements', icon: CreditCardIcon }
  ]

  const languageOptions = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ]

  const timezoneOptions = [
    { value: 'UTC+0', label: 'UTC+0 (GMT)' },
    { value: 'UTC+1', label: 'UTC+1 (WAT)' },
    { value: 'UTC+2', label: 'UTC+2 (CAT)' }
  ]

  const currencyOptions = [
    { value: 'XOF', label: 'Franc CFA (XOF)' },
    { value: 'EUR', label: 'Euro (EUR)' },
    { value: 'USD', label: 'Dollar US (USD)' }
  ]

  const sessionTimeoutOptions = [
    { value: '15', label: '15 minutes' },
    { value: '30', label: '30 minutes' },
    { value: '60', label: '1 heure' },
    { value: '120', label: '2 heures' }
  ]

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    console.log('Sauvegarde des paramètres:', settings)
    // Ici vous implémenteriez la sauvegarde
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-4">
            <Input
              label="Nom de l'entreprise"
              value={settings.companyName}
              onChange={(e) => handleSettingChange('companyName', e.target.value)}
            />
            <Input
              label="Email principal"
              type="email"
              value={settings.email}
              onChange={(e) => handleSettingChange('email', e.target.value)}
            />
            <Input
              label="Téléphone"
              value={settings.phone}
              onChange={(e) => handleSettingChange('phone', e.target.value)}
            />
            <Input
              label="Adresse"
              value={settings.address}
              onChange={(e) => handleSettingChange('address', e.target.value)}
            />
          </div>
        )

      case 'account':
        return (
          <div className="space-y-4">
            <Input
              label="Nom d'utilisateur"
              value="admin"
              disabled
            />
            <div className="relative">
              <Input
                label="Mot de passe actuel"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-2 top-8"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeSlashIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </Button>
            </div>
            <Input
              label="Nouveau mot de passe"
              type="password"
              placeholder="••••••••"
            />
            <Input
              label="Confirmer le nouveau mot de passe"
              type="password"
              placeholder="••••••••"
            />
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Notifications par email
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recevez des notifications par email
                </p>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(checked) => handleSettingChange('emailNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Notifications SMS
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recevez des notifications par SMS
                </p>
              </div>
              <Switch
                checked={settings.smsNotifications}
                onChange={(checked) => handleSettingChange('smsNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Notifications push
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recevez des notifications sur votre appareil
                </p>
              </div>
              <Switch
                checked={settings.pushNotifications}
                onChange={(checked) => handleSettingChange('pushNotifications', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Emails marketing
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Recevez des emails promotionnels et des mises à jour
                </p>
              </div>
              <Switch
                checked={settings.marketingEmails}
                onChange={(checked) => handleSettingChange('marketingEmails', checked)}
              />
            </div>
          </div>
        )

      case 'security':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Authentification à deux facteurs
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Ajoutez une couche de sécurité supplémentaire
                </p>
              </div>
              <Switch
                checked={settings.twoFactorAuth}
                onChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
              />
            </div>
            
            <Select
              label="Délai d'expiration de session"
              value={settings.sessionTimeout}
              onChange={(e) => handleSettingChange('sessionTimeout', e.target.value)}
              options={sessionTimeoutOptions}
            />
            
            <Input
              label="Expiration du mot de passe (jours)"
              type="number"
              value={settings.passwordExpiry}
              onChange={(e) => handleSettingChange('passwordExpiry', e.target.value)}
            />
          </div>
        )

      case 'regional':
        return (
          <div className="space-y-4">
            <Select
              label="Langue"
              value={settings.language}
              onChange={(e) => handleSettingChange('language', e.target.value)}
              options={languageOptions}
            />
            
            <Select
              label="Fuseau horaire"
              value={settings.timezone}
              onChange={(e) => handleSettingChange('timezone', e.target.value)}
              options={timezoneOptions}
            />
            
            <Select
              label="Devise"
              value={settings.currency}
              onChange={(e) => handleSettingChange('currency', e.target.value)}
              options={currencyOptions}
            />
            
            <Input
              label="Format de date"
              value={settings.dateFormat}
              onChange={(e) => handleSettingChange('dateFormat', e.target.value)}
            />
          </div>
        )

      case 'payments':
        return (
          <div className="space-y-4">
            <Input
              label="Commission par défaut (%)"
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={settings.defaultCommission}
              onChange={(e) => handleSettingChange('defaultCommission', e.target.value)}
            />
            
            <div className="flex items-center justify-between p-4 border border-neutral-200 dark:border-neutral-800 rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-900 dark:text-neutral-100">
                  Paiements automatiques
                </h3>
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  Effectuer les paiements automatiquement
                </p>
              </div>
              <Switch
                checked={settings.autoPayouts}
                onChange={(checked) => handleSettingChange('autoPayouts', checked)}
              />
            </div>
            
            <Input
              label="Montant minimum de paiement (FCFA)"
              type="number"
              value={settings.minimumPayout}
              onChange={(e) => handleSettingChange('minimumPayout', e.target.value)}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Paramètres
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Configurez les paramètres de votre plateforme
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-4">
          {/* Navigation des onglets */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-4">
                <nav className="space-y-2">
                  {tabs.map((tab) => {
                    const Icon = tab.icon
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTab === tab.id
                            ? 'bg-primary-100 text-primary-900 dark:bg-primary-900/30 dark:text-primary-100'
                            : 'text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{tab.name}</span>
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Contenu des onglets */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderTabContent()}
                
                <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-200 dark:border-neutral-800 mt-6">
                  <Button variant="outline">
                    Annuler
                  </Button>
                  <Button onClick={handleSave}>
                    Enregistrer les modifications
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}