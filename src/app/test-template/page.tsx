'use client'

import React, { useState } from 'react'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui'
import { evaluationTemplatesService } from '@/services/evaluationTemplates'
import { CreateEvaluationTemplateRequest } from '@/types'

export default function TestTemplatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const testCreateTemplate = async () => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      // Données de test basées sur la collection Postman
      const payload: CreateEvaluationTemplateRequest = {
        name: "Standard Driver Evaluation Template",
        description: "Standard evaluation template combining all main driver performance criteria, used for regular driver assessments.",
        active: true,
        evaluationCriteriaList: [
          { uuid: "1df052ff-cb69-4954-9617-abdaf3b3528e" },
          { uuid: "312fee4d-e8a3-4802-9d87-29dc44a4c5f6" },
          { uuid: "0a735413-f518-4799-84e0-0003290f6cc9" }
        ]
      }

      console.log('🔍 Test payload:', payload)
      
      const response = await evaluationTemplatesService.createTemplate(payload)
      console.log('✅ Test response:', response)
      
      setResult(response)
    } catch (err) {
      console.error('❌ Test error:', err)
      setError(err instanceof Error ? err.message : 'Erreur de test')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            Test Template Creation
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-2">
            Page de test pour vérifier l'intégration de la création de template
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Test de création de template</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testCreateTemplate} 
              disabled={isLoading}
            >
              {isLoading ? 'Test en cours...' : 'Tester la création'}
            </Button>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">Erreur</h4>
                <p className="text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            {result && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Succès</h4>
                <pre className="text-sm text-green-600 dark:text-green-400 overflow-auto">
                  {JSON.stringify(result, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}