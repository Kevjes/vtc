'use client'

import React, { useState } from 'react'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { ThemeProvider } from '@/contexts/ThemeContext'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const closeSidebar = () => setSidebarOpen(false)

  return (
    <ThemeProvider>
      <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onToggleSidebar={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </main>
        </div>
      </div>
    </ThemeProvider>
  )
}