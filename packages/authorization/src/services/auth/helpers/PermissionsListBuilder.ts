import { PrismaClient, User } from '@prisma/client'
import { injectable } from 'tsyringe'
import { PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

@injectable()
export class PermissionsListBuilder {
  constructor(
    private readonly orgPermissionsHelper: OrgPermissionsHelper,
    private readonly prisma: PrismaClient,
    private readonly teamPermissionsHelper: TeamPermissionsHelper
  ) {}

  async buildPermissionsList(user?: User): Promise<PermissionsList> {
    const userTeamRoles = user
      ? await this.prisma.userTeamRoles.findMany({
          where: { userId: user.id }
        })
      : []
    const userOrgRoles = user
      ? await this.prisma.userOrganizationRoles.findMany({
          where: { userId: user.id }
        })
      : []
    const permissionsByTeamId = await this.teamPermissionsHelper.getPermissions(
      userTeamRoles,
      userOrgRoles
    )
    const permissionsByOrgId =
      this.orgPermissionsHelper.getPermissions(userOrgRoles)

    return {
      user,
      teams: permissionsByTeamId,
      organizations: permissionsByOrgId
    }
  }
}
