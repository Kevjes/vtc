'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, Button, Input, Select } from '@/components/ui'
import { agentsService } from '@/services/agents'
import type { CreateAgentRequest } from '@/types'

export default function NewAgentPage() {
  const router = useRouter()
  const [form, setForm] = useState<CreateAgentRequest>({
    phone: '',
    lastname: '',
    firstname: '',
    dob: '',
    email: '',
    address: '',
    city: '',
    country: '',
    countryISO: '',
    countryCode: '',
    partner: { uuid: '' },
    position: '',
    status: 'ACTIVE'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError(null)
      await agentsService.createAgent(form)
      router.push('/agents')
    } catch (err) {
      console.error('Erreur lors de la création de l\'agent:', err)
      setError(err instanceof Error ? err.message : 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Nouveau agent</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-2">Créer un agent</p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {/* Form */}
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Prénom" name="firstname" value={form.firstname} onChange={handleChange} required />
              <Input label="Nom" name="lastname" value={form.lastname} onChange={handleChange} required />
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} required />
              <Input label="Téléphone" name="phone" value={form.phone} onChange={handleChange} required />
              <Input label="Date de naissance" name="dob" type="date" value={form.dob} onChange={handleChange} required />
              <Input label="Adresse" name="address" value={form.address || ''} onChange={handleChange} />
              <Input label="Ville" name="city" value={form.city || ''} onChange={handleChange} />
              <Input label="Pays" name="country" value={form.country || ''} onChange={handleChange} />
              <Input label="Code pays (ISO)" name="countryISO" value={form.countryISO || ''} onChange={handleChange} />
              <Input label="Indicatif téléphonique" name="countryCode" value={form.countryCode || ''} onChange={handleChange} />
              <Input label="UUID Partenaire" name="partnerUuid" value={form.partner.uuid} onChange={(e) => setForm((prev) => ({ ...prev, partner: { uuid: e.target.value } }))} required />
              <Input label="Poste" name="position" value={form.position} onChange={handleChange} required />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Statut"
                name="status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                options={[
                  { label: 'Actif', value: 'ACTIVE' },
                  { label: 'Inactif', value: 'INACTIVE' }
                ]}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => router.push('/agents')}>Annuler</Button>
              <Button type="submit" disabled={loading}>Créer</Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  )
}