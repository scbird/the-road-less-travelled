import {
  Prisma,
  PrismaClient,
  Team,
  UserOrganizationRoles,
  UserTeamRoles
} from '@prisma/client'
import { prop, propEq, uniq } from 'ramda'
import { injectable } from 'tsyringe'
import {
  TEAM_PERMISSIONS_BY_ORG_ROLE,
  TEAM_PERMISSIONS_BY_SITE_ROLE,
  TEAM_PERMISSIONS_BY_TEAM_ROLE,
  TeamPermission
} from '../permissions'
import { PermissionsList } from '../types'

@injectable()
export class TeamPermissionsHelper {
  constructor(private readonly prisma: PrismaClient) {}

  async getPermissions(
    userTeamRoles: readonly UserTeamRoles[],
    userOrgRoles: readonly UserOrganizationRoles[]
  ): Promise<Record<string, TeamPermission[]>> {
    const permissionsFromTeamRoles =
      this.getPermissionsFromTeamRoles(userTeamRoles)
    const permissionsFromOrgRoles = await this.getTeamPermissionsFromOrgRoles(
      userOrgRoles
    )

    return this.combinePermissions(
      permissionsFromTeamRoles,
      permissionsFromOrgRoles
    )
  }

  can(
    permissions: PermissionsList,
    permission: TeamPermission,
    teamOrId: Team | string
  ): boolean {
    const id = typeof teamOrId === 'string' ? teamOrId : teamOrId.id

    return Boolean(
      (permissions.teams[id] ?? []).includes(permission) ||
        permissions.user?.siteRoles.some((siteRole) =>
          (TEAM_PERMISSIONS_BY_SITE_ROLE[siteRole] ?? []).includes(permission)
        )
    )
  }

  getFilter(permissions: PermissionsList): Prisma.TeamWhereInput {
    const hasAnyGlobalPermissions = permissions.user?.siteRoles.some(
      (siteRole) => (TEAM_PERMISSIONS_BY_SITE_ROLE[siteRole] ?? []).length > 0
    )

    if (hasAnyGlobalPermissions) {
      return {}
    } else {
      const teamIds = Object.keys(permissions.teams).filter(
        (teamId) => permissions.teams[teamId].length > 0
      )

      return { id: { in: teamIds } }
    }
  }

  private getPermissionsFromTeamRoles(
    userTeamRoles: readonly UserTeamRoles[]
  ): Record<string, TeamPermission[]> {
    const permissionsByTeamId: Record<string, TeamPermission[]> = {}

    for (const { teamId, roles } of userTeamRoles) {
      const permissions = roles.flatMap(
        (role) => TEAM_PERMISSIONS_BY_TEAM_ROLE[role]
      )

      permissionsByTeamId[teamId] = uniq(permissions)
    }

    return permissionsByTeamId
  }

  private async getTeamPermissionsFromOrgRoles(
    userOrgRoles: readonly UserOrganizationRoles[]
  ) {
    const orgIds = uniq(userOrgRoles.map(prop('organizationId')))
    const orgTeams = await this.prisma.team.findMany({
      where: { organizationId: { in: orgIds } }
    })
    const permissionsByTeamId: Record<string, TeamPermission[]> = {}

    for (const team of orgTeams) {
      const teamOrgRoles = userOrgRoles.find(
        propEq('organizationId', team.organizationId)
      ) as UserOrganizationRoles
      const permissions = teamOrgRoles.roles.flatMap(
        (orgRole) => TEAM_PERMISSIONS_BY_ORG_ROLE[orgRole] ?? []
      )

      permissionsByTeamId[team.id] = uniq(permissions)
    }

    return permissionsByTeamId
  }

  private combinePermissions(
    permissionsFromTeamRoles: Record<string, TeamPermission[]>,
    permissionsFromOrgRoles: Record<string, TeamPermission[]>
  ): Record<string, TeamPermission[]> {
    const teamPermissions = { ...permissionsFromTeamRoles }

    // Combine the direct team permissions with the ones provided
    // by the user's organisation roles
    for (const [teamId, permissions] of Object.entries(
      permissionsFromOrgRoles
    )) {
      teamPermissions[teamId] = uniq([
        ...(teamPermissions[teamId] ?? []),
        ...permissions
      ])
    }

    return teamPermissions
  }
}
