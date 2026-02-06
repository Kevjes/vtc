'use client'

import React, { useState, useEffect, useRef } from 'react'
import {
  Bars3Icon,
  MagnifyingGlassIcon,
  BellIcon,
  SunIcon,
  MoonIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
  Cog6ToothIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'
import { Button, Input, Avatar, Badge } from '@/components/ui'
import { useTheme } from '@/contexts/ThemeContext'
import { useAuth } from '@/contexts/AuthContext'

interface HeaderProps {
  onToggleSidebar: () => void
}

export function Header({ onToggleSidebar }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleLogout = async () => {
    try {
      await logout()
      setShowUserMenu(false)
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error)
      setShowUserMenu(false)
    }
  }

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-neutral-200 dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex h-full items-center justify-between px-6">
        {/* Left section */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleSidebar}
            className="lg:hidden"
          >
            <Bars3Icon className="h-5 w-5" />
          </Button>
        </div>

        {/* Center section - Search */}
        <div className="hidden md:block flex-1 max-w-lg mx-8">
          <Input
            placeholder="Rechercher..."
            icon={<MagnifyingGlassIcon className="h-4 w-4" />}
            className="w-full"
          />
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-3">
          {/* Theme toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
          >
            {theme === 'light' ? (
              <MoonIcon className="h-5 w-5" />
            ) : (
              <SunIcon className="h-5 w-5" />
            )}
          </Button>

          {/* Notifications */}
          <div className="relative">
            <Button variant="ghost" size="icon">
              <BellIcon className="h-5 w-5" />
            </Button>
            <div className="absolute -top-1 -right-1">
              <Badge variant="danger" size="sm">3</Badge>
            </div>
          </div>

          {/* User menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            >
              <Avatar
                src=""
                alt={user ? `${user.firstname} ${user.lastname}` : "User"}
                fallback={user ? `${user.firstname[0]}${user.lastname[0]}` : "U"}
                size="md"
              />
              <div className="hidden sm:block text-sm text-left">
                <div className="font-medium text-neutral-900 dark:text-neutral-100">
                  {user ? `${user.firstname} ${user.lastname}` : 'User'}
                </div>
                <div className="text-neutral-500 dark:text-neutral-400">
                  {user?.email || 'user@vtc.com'}
                </div>
              </div>
              <ChevronDownIcon className="hidden sm:block h-4 w-4 text-neutral-400" />
            </button>

            {/* Dropdown menu */}
            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-neutral-800 rounded-lg shadow-lg border border-neutral-200 dark:border-neutral-700 py-1 z-50">
                <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                  <div className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    {user ? `${user.firstname} ${user.lastname}` : 'User'}
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    {user?.type || 'ADMIN'}
                  </div>
                </div>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <UserIcon className="h-4 w-4 mr-3" />
                  Profil
                </button>

                <button
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center w-full px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors"
                >
                  <Cog6ToothIcon className="h-4 w-4 mr-3" />
                  Paramètres
                </button>

                <hr className="my-1 border-neutral-200 dark:border-neutral-700" />

                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <ArrowRightOnRectangleIcon className="h-4 w-4 mr-3" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}