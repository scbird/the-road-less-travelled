import { Organization, Prisma, UserOrganizationRoles } from '@prisma/client'
import { uniq } from 'ramda'
import { injectable } from 'tsyringe'
import {
  ORG_PERMISSIONS_BY_ORG_ROLE,
  ORG_PERMISSIONS_BY_SITE_ROLE,
  OrgPermission
} from '../permissions'
import { PermissionsList } from '../types'

@injectable()
export class OrgPermissionsHelper {
  getPermissions(
    userOrgRoles: readonly UserOrganizationRoles[]
  ): Record<string, OrgPermission[]> {
    const permissions: Record<string, OrgPermission[]> = {}

    for (const { organizationId, roles } of userOrgRoles) {
      permissions[organizationId] = uniq(
        roles.flatMap((role) => ORG_PERMISSIONS_BY_ORG_ROLE[role])
      )
    }

    return permissions
  }

  can(
    permissions: PermissionsList,
    permission: OrgPermission,
    organizationOrId: Organization | string
  ): boolean {
    const id =
      typeof organizationOrId === 'string'
        ? organizationOrId
        : organizationOrId.id

    return Boolean(
      (permissions.organizations[id] ?? []).includes(permission) ||
        permissions.user?.siteRoles.some((siteRole) =>
          (ORG_PERMISSIONS_BY_SITE_ROLE[siteRole] ?? []).includes(permission)
        )
    )
  }

  getFilter(permissions: PermissionsList): Prisma.OrganizationWhereInput {
    const hasAnyGlobalPermissions = permissions.user?.siteRoles.some(
      (siteRole) => (ORG_PERMISSIONS_BY_SITE_ROLE[siteRole] ?? []).length > 0
    )

    if (hasAnyGlobalPermissions) {
      return {}
    } else {
      const organizationIds = Object.keys(permissions.organizations).filter(
        (organizationId) => permissions.organizations[organizationId].length > 0
      )

      return { id: { in: organizationIds } }
    }
  }
}
