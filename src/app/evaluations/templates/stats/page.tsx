'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui'

export default function TemplateStatsPage() {
  const router = useRouter()

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Template Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-neutral-700 dark:text-neutral-300">
              Statistics for evaluation templates will be available here soon.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}