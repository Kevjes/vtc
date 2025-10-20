'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { XMarkIcon } from '@heroicons/react/24/outline'
import Button from './Button'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={cn(
            'relative bg-white dark:bg-neutral-900 rounded-xl shadow-xl border border-neutral-200 dark:border-neutral-800 w-full',
            {
              'max-w-md': size === 'sm',
              'max-w-lg': size === 'md',
              'max-w-2xl': size === 'lg',
              'max-w-4xl': size === 'xl',
            }
          )}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-neutral-200 dark:border-neutral-800">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                {title}
              </h3>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <XMarkIcon className="h-5 w-5" />
              </Button>
            </div>
          )}
          
          {/* Content */}
          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}