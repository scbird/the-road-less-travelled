import {
  OrgRole,
  PrismaClient,
  TeamRole,
  UserOrganizationRoles,
  UserTeamRoles
} from '@prisma/client'
import { acmeAdmin } from '../../../fixtures'
import { Mutable } from '../../../types'
import { TeamPermission } from '../permissions'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { PermissionsListBuilder } from './PermissionsListBuilder'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

describe('PermissionsListBuilder', () => {
  let prisma: Mutable<PrismaClient>
  let teamPermissionsHelper: TeamPermissionsHelper
  let orgPermissionsHelper: OrgPermissionsHelper
  let permissionsListBuilder: PermissionsListBuilder

  beforeEach(() => {
    prisma = {} as PrismaClient
    teamPermissionsHelper = {} as TeamPermissionsHelper
    orgPermissionsHelper = {} as OrgPermissionsHelper
    permissionsListBuilder = new PermissionsListBuilder(
      orgPermissionsHelper,
      prisma,
      teamPermissionsHelper
    )
  })

  test('buildPermissionsList()', async () => {
    const user = acmeAdmin
    const userId = user.id
    const userTeamRoles = [
      {
        teamId: 'team1',
        roles: [TeamRole.VIEWER]
      }
    ] as UserTeamRoles[]
    const userOrgRoles = [
      {
        organizationId: 'org1',
        roles: [OrgRole.MEMBER]
      }
    ] as UserOrganizationRoles[]
    const teamPermissions = { team1: [TeamPermission.VIEW_INFO] }
    const orgPermissions = { org1: [TeamPermission.EDIT_ANY_POST] }

    prisma.userTeamRoles = {
      findMany: jest.fn().mockResolvedValue(userTeamRoles)
    } as never
    prisma.userOrganizationRoles = {
      findMany: jest.fn().mockResolvedValue(userOrgRoles)
    } as never
    teamPermissionsHelper.getPermissions = jest
      .fn()
      .mockResolvedValue(teamPermissions)
    orgPermissionsHelper.getPermissions = jest
      .fn()
      .mockReturnValue(orgPermissions)

    expect(await permissionsListBuilder.buildPermissionsList(user)).toEqual({
      user,
      teams: teamPermissions,
      organizations: orgPermissions
    })
    expect(prisma.userTeamRoles.findMany).toHaveBeenCalledWith({
      where: { userId }
    })
    expect(prisma.userOrganizationRoles.findMany).toHaveBeenCalledWith({
      where: { userId }
    })
    expect(teamPermissionsHelper.getPermissions).toHaveBeenCalledWith(
      userTeamRoles,
      userOrgRoles
    )
    expect(orgPermissionsHelper.getPermissions).toHaveBeenCalledWith(
      userOrgRoles
    )
  })
})
