'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Navigation } from './Navigation'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800 transform transition-transform duration-300 ease-in-out lg:static lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo section */}
          <div className="flex h-16 items-center justify-center border-b border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <span className="text-white font-bold text-sm">VTC</span>
              </div>
              <span className="text-xl font-bold text-neutral-900 dark:text-neutral-100">
                Dashboard
              </span>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4">
            <Navigation />
          </div>

          {/* Footer */}
          <div className="border-t border-neutral-200 dark:border-neutral-800 p-4">
            <div className="text-center text-sm text-neutral-500 dark:text-neutral-400">
              VTC Platform v1.0
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}