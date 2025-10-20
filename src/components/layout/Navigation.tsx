'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  HomeIcon,
  UserGroupIcon,
  UsersIcon,
  StarIcon,
  DocumentArrowUpIcon,
  ChartBarIcon,
  BellIcon,
  Cog6ToothIcon,
  ClipboardDocumentListIcon,
  ShieldCheckIcon,
  KeyIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline'
import type { NavigationItem } from '@/types'
import { Badge } from '@/components/ui'

const navigationItems: NavigationItem[] = [
  // Navigation principale
  {
    title: 'Dashboard',
    href: '/',
    icon: HomeIcon,
  },
  {
    title: 'Chauffeurs',
    href: '/drivers',
    icon: UsersIcon,
    badge: 5,
    children: [
      { title: 'Liste des chauffeurs', href: '/drivers', icon: UsersIcon },
      { title: 'Nouveau chauffeur', href: '/drivers/new', icon: UsersIcon },
    ]
  },
  {
    title: 'Partenaires',
    href: '/partners',
    icon: UserGroupIcon,
    children: [
      { title: 'Liste des partenaires', href: '/partners', icon: UserGroupIcon },
      { title: 'Nouveau partenaire', href: '/partners/new', icon: UserGroupIcon },
    ]
  },
  {
    title: 'Évaluations',
    href: '/evaluations',
    icon: StarIcon,
    children: [
      { title: 'Toutes les évaluations', href: '/evaluations', icon: StarIcon },
      { title: 'Critères d\'évaluation', href: '/evaluations/criteria', icon: StarIcon },
    ]
  },

  // Gestion des utilisateurs et accès
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: UsersIcon,
  },
  {
    title: 'Rôles',
    href: '/admin/roles',
    icon: ShieldCheckIcon,
  },
  {
    title: 'Sessions',
    href: '/admin/sessions',
    icon: ComputerDesktopIcon,
  },
  {
    title: 'Permissions',
    href: '/admin/permissions',
    icon: KeyIcon,
  },

  // Outils et fonctionnalités
  {
    title: 'Import/Export',
    href: '/import-export',
    icon: DocumentArrowUpIcon,
  },
  {
    title: 'Reporting',
    href: '/reporting',
    icon: ChartBarIcon,
  },
  {
    title: 'Notifications',
    href: '/notifications',
    icon: BellIcon,
    badge: 3,
  },

  // Configuration et audit
  {
    title: 'Paramètres',
    href: '/settings',
    icon: Cog6ToothIcon,
  },
  {
    title: 'Audit',
    href: '/audit',
    icon: ClipboardDocumentListIcon,
  },
]

interface NavigationProps {
  collapsed?: boolean
}

export function Navigation({ collapsed = false }: NavigationProps) {
  const pathname = usePathname()

  // Groupes d'éléments avec séparateurs
  const groups = [
    { items: navigationItems.slice(0, 4) }, // Navigation principale
    { items: navigationItems.slice(4, 8) }, // Gestion utilisateurs et accès
    { items: navigationItems.slice(8, 11) }, // Outils et fonctionnalités
    { items: navigationItems.slice(11) }, // Configuration et audit
  ]

  return (
    <nav className="space-y-1">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && (
            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />
          )}
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')

            return (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors',
                    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                    isActive && 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 dark:bg-primary-900/50 dark:text-primary-300',
                    !isActive && 'text-neutral-700 dark:text-neutral-300'
                  )}
                >
                  <Icon className={cn('h-5 w-5', !collapsed && 'mr-3')} />
                  {!collapsed && (
                    <>
                      <span className="flex-1">{item.title}</span>
                      {item.badge && (
                        <Badge variant="info" size="sm">
                          {item.badge}
                        </Badge>
                      )}
                    </>
                  )}
                </Link>
              </div>
            )
          })}
        </div>
      ))}
    </nav>
  )
}