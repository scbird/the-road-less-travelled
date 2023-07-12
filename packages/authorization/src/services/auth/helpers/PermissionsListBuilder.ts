import { PrismaClient } from '@prisma/client'
import { Service } from 'typedi'
import { PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

@Service()
export class PermissionsListBuilder {
  constructor(
    private readonly orgPermissionsHelper: OrgPermissionsHelper,
    private readonly prisma: PrismaClient,
    private readonly teamPermissionsHelper: TeamPermissionsHelper
  ) {}

  async buildPermissionsList(userId: string): Promise<PermissionsList> {
    const userTeamRoles = await this.prisma.userTeamRoles.findMany({
      where: { userId }
    })
    const userOrgRoles = await this.prisma.userOrganizationRoles.findMany({
      where: { userId }
    })
    const permissionsByTeamId = await this.teamPermissionsHelper.getPermissions(
      userTeamRoles,
      userOrgRoles
    )
    const permissionsByOrgId =
      this.orgPermissionsHelper.getPermissions(userOrgRoles)

    return {
      userId,
      teams: permissionsByTeamId,
      organizations: permissionsByOrgId
    }
  }
}
