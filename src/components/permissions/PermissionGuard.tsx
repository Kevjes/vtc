import React from 'react'
import { usePermissions } from '@/hooks/usePermissions'
import { Button } from '@/components/ui'
import { useRouter } from 'next/navigation'

interface PermissionGuardProps {
  /** Required permission guard name(s) */
  permissions: string | string[]
  /** Require all permissions (default: false, requires any) */
  requireAll?: boolean
  /** Custom access denied message */
  deniedMessage?: string
  /** Custom fallback component */
  fallback?: React.ReactNode
  /** Redirect path on access denied */
  redirectTo?: string
  /** Children to render if permission is granted */
  children: React.ReactNode
}

/**
 * Component to guard content based on user permissions
 *
 * @example
 * ```tsx
 * <PermissionGuard permissions="CAN_CREATE_AGENT">
 *   <Button>Create Agent</Button>
 * </PermissionGuard>
 * ```
 *
 * @example
 * ```tsx
 * <PermissionGuard
 *   permissions={["CAN_UPDATE_AGENT", "CAN_DELETE_AGENT"]}
 *   requireAll
 * >
 *   <Button>Manage Agent</Button>
 * </PermissionGuard>
 * ```
 */
export function PermissionGuard({
  permissions,
  requireAll = false,
  deniedMessage = "Vous n'avez pas la permission d'accéder à cette ressource.",
  fallback,
  redirectTo,
  children,
}: PermissionGuardProps) {
  const router = useRouter()
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasAllAccess } = usePermissions()

  // Always allow if user has ALL_ACCESS
  if (hasAllAccess()) {
    return <>{children}</>
  }

  // Check permissions
  let hasAccess = false
  if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions)
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions)
  } else {
    hasAccess = hasAnyPermission(permissions)
  }

  // If no access, show fallback or default denied message
  if (!hasAccess) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-2">Accès refusé</h2>
        <p className="text-red-700 dark:text-red-300">{deniedMessage}</p>
        {redirectTo && (
          <div className="mt-4">
            <Button variant="outline" onClick={() => router.push(redirectTo)}>
              Retour
            </Button>
          </div>
        )}
      </div>
    )
  }

  return <>{children}</>
}

interface ConditionalRenderProps {
  /** Required permission guard name(s) */
  permissions: string | string[]
  /** Require all permissions (default: false, requires any) */
  requireAll?: boolean
  /** Children to render if permission is granted */
  children: React.ReactNode
}

/**
 * Conditionally renders children based on permissions without showing error message
 *
 * @example
 * ```tsx
 * <ConditionalRender permissions="CAN_DELETE_AGENT">
 *   <Button variant="danger">Delete</Button>
 * </ConditionalRender>
 * ```
 */
export function ConditionalRender({
  permissions,
  requireAll = false,
  children,
}: ConditionalRenderProps) {
  const { hasPermission, hasAnyPermission, hasAllPermissions, hasAllAccess } = usePermissions()

  // Always allow if user has ALL_ACCESS
  if (hasAllAccess()) {
    return <>{children}</>
  }

  // Check permissions
  let hasAccess = false
  if (typeof permissions === 'string') {
    hasAccess = hasPermission(permissions)
  } else if (requireAll) {
    hasAccess = hasAllPermissions(permissions)
  } else {
    hasAccess = hasAnyPermission(permissions)
  }

  return hasAccess ? <>{children}</> : null
}
