import { Organization, Prisma, UserOrganizationRoles } from '@prisma/client'
import { uniq } from 'ramda'
import { Service } from 'typedi'
import { ORG_PERMISSIONS_BY_ORG_ROLE, OrgPermission } from '../permissions'
import { PermissionsList } from '../types'

@Service()
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

    return (permissions.organizations[id] ?? []).includes(permission)
  }

  getFilter(permissions: PermissionsList): Prisma.OrganizationWhereInput {
    const organizationIds = Object.keys(permissions.organizations).filter(
      (organizationId) => permissions.organizations[organizationId].length > 0
    )

    return { id: { in: organizationIds } }
  }
}
