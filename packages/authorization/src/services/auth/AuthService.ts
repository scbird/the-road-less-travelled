import { OrgRole, PrismaClient, TeamRole, User } from '@prisma/client'
import { injectable } from 'tsyringe'
import { CanBuilder } from './helpers'
import { FiltersBuilder } from './helpers/FiltersBuilder'
import { PermissionsListBuilder } from './helpers/PermissionsListBuilder'
import { CanFunction, DatabaseFilters, PermissionsList } from './types'

@injectable()
export class AuthService {
  constructor(
    private readonly canBuilder: CanBuilder,
    private readonly filtersBuilder: FiltersBuilder,
    private readonly permissionsListBuilder: PermissionsListBuilder,
    private readonly prisma: PrismaClient
  ) {}
  async getPermissions(user?: User): Promise<PermissionsList> {
    return this.permissionsListBuilder.buildPermissionsList(user)
  }

  getCan(permissions: PermissionsList): CanFunction {
    return this.canBuilder.getCan(permissions)
  }

  getFilters(permissions: PermissionsList): DatabaseFilters {
    return this.filtersBuilder.getFilters(permissions)
  }

  async getRolesByOrgId(userId: string): Promise<Record<string, OrgRole[]>> {
    const userOrgRoles = await this.prisma.userOrganizationRoles.findMany({
      where: { userId }
    })
    const rolesByOrgId: Record<string, OrgRole[]> = {}

    for (const { organizationId, roles } of userOrgRoles) {
      rolesByOrgId[organizationId] = roles
    }

    return rolesByOrgId
  }

  async getRolesByTeamId(userId: string): Promise<Record<string, TeamRole[]>> {
    const userTeamRoles = await this.prisma.userTeamRoles.findMany({
      where: { userId }
    })
    const rolesByTeamId: Record<string, TeamRole[]> = {}

    for (const { teamId, roles } of userTeamRoles) {
      rolesByTeamId[teamId] = roles
    }

    return rolesByTeamId
  }

  async setOrgRoles(
    userId: string,
    orgId: string,
    roles: OrgRole[]
  ): Promise<void> {
    await this.prisma.userOrganizationRoles.upsert({
      where: { userId_organizationId: { userId, organizationId: orgId } },
      update: { roles },
      create: { userId, organizationId: orgId, roles: roles }
    })
  }

  async setTeamRoles(
    userId: string,
    teamId: string,
    roles: TeamRole[]
  ): Promise<void> {
    await this.prisma.userTeamRoles.upsert({
      where: { userId_teamId: { userId, teamId } },
      update: { roles },
      create: { userId, teamId, roles: roles }
    })
  }
}
