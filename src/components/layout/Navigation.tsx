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
  ComputerDesktopIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import type { NavigationItem } from '@/types'
import { Badge } from '@/components/ui'
import { usePermissions } from '@/hooks/usePermissions'

const navigationItems: NavigationItem[] = [
  // Navigation principale
  {
    title: 'Dashboard',
    href: '/',
    icon: HomeIcon,
    // Accessible à tous les utilisateurs authentifiés
  },
  {
    title: 'Chauffeurs',
    href: '/drivers',
    icon: UsersIcon,
    badge: 5,
    permissions: ['CAN_READ_ANY_DRIVER', 'CAN_READ_DRIVER', 'CAN_READ_OWN_DRIVER'],
    children: [
      {
        title: 'Liste des chauffeurs',
        href: '/drivers',
        icon: UsersIcon,
        permissions: ['CAN_READ_ANY_DRIVER', 'CAN_READ_DRIVER', 'CAN_READ_OWN_DRIVER']
      },
      {
        title: 'Nouveau chauffeur',
        href: '/drivers/new',
        icon: UsersIcon,
        permissions: ['CAN_CREATE_DRIVER']
      },
    ]
  },
  {
    title: 'Partenaires',
    href: '/partners',
    icon: UserGroupIcon,
    permissions: ['CAN_READ_ANY_PARTNER', 'CAN_READ_PARTNER', 'CAN_READ_OWN_PARTNER'],
    children: [
      {
        title: 'Liste des partenaires',
        href: '/partners',
        icon: UserGroupIcon,
        permissions: ['CAN_READ_ANY_PARTNER', 'CAN_READ_PARTNER', 'CAN_READ_OWN_PARTNER']
      },
      {
        title: 'Nouveau partenaire',
        href: '/partners/new',
        icon: UserGroupIcon,
        permissions: ['CAN_CREATE_PARTNER']
      },
    ]
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: UserIcon,
    permissions: ['CAN_READ_ANY_AGENT', 'CAN_READ_AGENT', 'CAN_READ_OWN_AGENT'],
  },
  {
    title: 'Évaluations',
    href: '/evaluations',
    icon: StarIcon,
    permissions: ['CAN_READ_ANY_EVALUATION', 'CAN_READ_EVALUATION', 'CAN_READ_OWN_EVALUATION'],
    children: [
      {
        title: 'Liste des évaluations',
        href: '/evaluations',
        icon: StarIcon,
        permissions: ['CAN_READ_ANY_EVALUATION', 'CAN_READ_EVALUATION', 'CAN_READ_OWN_EVALUATION']
      },
      {
        title: 'Gestion des statuts',
        href: '/evaluations/status',
        icon: StarIcon,
        permissions: ['CAN_UPDATE_EVALUATION']
      },
      {
        title: 'Statistiques',
        href: '/evaluations/stats',
        icon: StarIcon,
        permissions: ['CAN_READ_ANY_EVALUATION']
      },
      {
        title: 'Critères',
        href: '/evaluations/criteria',
        icon: StarIcon,
        permissions: ['CAN_READ_ANY_EVALUATION_CRITERIA', 'CAN_READ_EVALUATION_CRITERIA']
      },
      {
        title: 'Templates',
        href: '/evaluations/templates',
        icon: StarIcon,
        permissions: ['CAN_READ_ANY_EVALUATION_TEMPLATE', 'CAN_READ_EVALUATION_TEMPLATE']
      },
    ]
  },

  // Gestion des utilisateurs et accès
  {
    title: 'Utilisateurs',
    href: '/admin/users',
    icon: UsersIcon,
    permissions: ['CAN_READ_ANY_USER', 'CAN_READ_USER'],
  },
  {
    title: 'Rôles',
    href: '/admin/roles',
    icon: ShieldCheckIcon,
    permissions: ['CAN_READ_ANY_ROLE', 'CAN_READ_ROLE'],
  },
  {
    title: 'Sessions',
    href: '/admin/sessions',
    icon: ComputerDesktopIcon,
    permissions: ['CAN_READ_ANY_SESSION', 'CAN_READ_SESSION'],
  },
  {
    title: 'Permissions',
    href: '/admin/permissions',
    icon: KeyIcon,
    permissions: ['CAN_READ_ANY_PERMISSION', 'CAN_READ_PERMISSION'],
  },

  // Outils et fonctionnalités
  {
    title: 'Import/Export',
    href: '/import-export',
    icon: DocumentArrowUpIcon,
    // Accessible à tous pour l'instant
  },
]

interface NavigationProps {
  collapsed?: boolean
}

export function Navigation({ collapsed = false }: NavigationProps) {
  const pathname = usePathname()
  const { hasAnyPermission, hasAllPermissions, hasAllAccess } = usePermissions()

  // Fonction pour vérifier si l'utilisateur a accès à un élément de navigation
  const hasAccessToItem = (item: NavigationItem): boolean => {
    // Si pas de permissions requises, accessible à tous
    if (!item.permissions || item.permissions.length === 0) {
      return true
    }

    // Si l'utilisateur a ALL_ACCESS, il a accès à tout
    if (hasAllAccess()) {
      return true
    }

    // Vérifier les permissions
    if (item.requireAllPermissions) {
      return hasAllPermissions(item.permissions)
    } else {
      return hasAnyPermission(item.permissions)
    }
  }

  // Fonction pour déterminer si un élément est actif
  const isItemActive = (item: NavigationItem) => {
    // Si l'item a des enfants, il n'est actif que si on est exactement sur sa route
    if (item.children && item.children.length > 0) {
      return pathname === item.href
    }
    // Sinon, logique normale
    return pathname === item.href || (item.href !== '/' && pathname?.startsWith(item.href + '/'))
  }

  // Fonction pour déterminer si un enfant est actif
  const isChildActive = (child: NavigationItem, parent: NavigationItem) => {
    return pathname === child.href || (child.href !== parent.href && pathname?.startsWith(child.href + '/'))
  }

  // Filtrer les éléments de navigation selon les permissions
  const filterItemsByPermissions = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(item => hasAccessToItem(item))
      .map(item => {
        // Si l'item a des enfants, les filtrer aussi
        if (item.children && item.children.length > 0) {
          const filteredChildren = item.children.filter(child => hasAccessToItem(child))
          // Si l'item parent n'a plus d'enfants après filtrage, ne pas l'afficher
          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null
        }
        return item
      })
      .filter((item): item is NavigationItem => item !== null)
  }

  // Filtrer tous les éléments de navigation
  const filteredNavigationItems = filterItemsByPermissions(navigationItems)

  // Groupes d'éléments avec séparateurs (recalculer après filtrage)
  const getGroups = () => {
    const items = filteredNavigationItems
    const groups: { items: NavigationItem[] }[] = []

    // Navigation principale (Dashboard + modules principaux)
    const mainNav = items.filter(item =>
      ['/', '/drivers', '/partners', '/agents', '/evaluations'].includes(item.href)
    )
    if (mainNav.length > 0) groups.push({ items: mainNav })

    // Gestion utilisateurs et accès
    const adminNav = items.filter(item =>
      item.href.startsWith('/admin')
    )
    if (adminNav.length > 0) groups.push({ items: adminNav })

    // Outils et fonctionnalités
    const toolsNav = items.filter(item =>
      ['/import-export'].includes(item.href)
    )
    if (toolsNav.length > 0) groups.push({ items: toolsNav })

    return groups
  }

  const groups = getGroups()

  return (
    <nav className="space-y-1">
      {groups.map((group, groupIndex) => (
        <div key={groupIndex}>
          {groupIndex > 0 && (
            <div className="my-4 border-t border-neutral-200 dark:border-neutral-700" />
          )}
          {group.items.map((item) => {
            const Icon = item.icon
            const isActive = isItemActive(item)

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
                {item.title === 'Évaluations' && !collapsed && item.children && (
                  <div className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => {
                      const childActive = isChildActive(child, item)
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={cn(
                            'flex items-center px-3 py-1 text-xs rounded-lg transition-colors',
                            'hover:bg-neutral-100 dark:hover:bg-neutral-800',
                            childActive && 'bg-primary-50 text-primary-700 border-r-2 border-primary-500 dark:bg-primary-900/50 dark:text-primary-300',
                            !childActive && 'text-neutral-600 dark:text-neutral-400'
                          )}
                        >
                          <span>{child.title}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      ))}
    </nav>
  )
}