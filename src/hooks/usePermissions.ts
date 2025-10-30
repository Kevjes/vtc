import { useAuth } from '@/contexts/AuthContext'
import { Permission } from '@/types'

export function usePermissions() {
  const { user } = useAuth()

  /**
   * Get all permissions for the current user from all their roles
   */
  const getAllPermissions = (): Permission[] => {
    if (!user || !user.roles) {
      return []
    }

    const allPermissions: Permission[] = []
    user.roles.forEach((role) => {
      if (role.permissions) {
        allPermissions.push(...role.permissions)
      }
    })

    return allPermissions
  }

  /**
   * Check if user has a specific permission by guard name
   */
  const hasPermission = (guardName: string): boolean => {
    const permissions = getAllPermissions()
    return permissions.some((permission) => permission.guardName === guardName)
  }

  /**
   * Check if user has any of the provided permissions
   */
  const hasAnyPermission = (guardNames: string[]): boolean => {
    return guardNames.some((guardName) => hasPermission(guardName))
  }

  /**
   * Check if user has all of the provided permissions
   */
  const hasAllPermissions = (guardNames: string[]): boolean => {
    return guardNames.every((guardName) => hasPermission(guardName))
  }

  /**
   * Check if user has "ALL_ACCESS" permission (super admin)
   */
  const hasAllAccess = (): boolean => {
    return hasPermission('ALL_ACCESS')
  }

  return {
    getAllPermissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAllAccess,
  }
}
