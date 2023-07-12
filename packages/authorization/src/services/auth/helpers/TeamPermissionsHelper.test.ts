import { OrgRole, PrismaClient, TeamRole } from '@prisma/client'
import { Mutable } from '../../../types'
import { TeamPermission } from '../permissions'
import { PermissionsList } from '../types'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

describe('TeamPermissionsHelper', () => {
  let prisma: Mutable<PrismaClient>
  let teamPermissionsHelper: TeamPermissionsHelper

  beforeEach(() => {
    prisma = {} as PrismaClient
    teamPermissionsHelper = new TeamPermissionsHelper(prisma)
  })

  it('getPermissions() should deduplicate permissions', async () => {
    prisma.team = { findMany: jest.fn().mockResolvedValue([]) } as never

    expect(
      await teamPermissionsHelper.getPermissions(
        [
          {
            userId: 'user1',
            teamId: 'team1',
            roles: [TeamRole.VIEWER, TeamRole.SUBMITTER]
          }
        ],
        []
      )
    ).toEqual({
      team1: [
        TeamPermission.VIEW_INFO,
        TeamPermission.VIEW_POSTS,
        TeamPermission.CREATE_POST
      ]
    })
  })

  it('getPermissions() should add permissions from org roles', async () => {
    prisma.team = {
      findMany: jest.fn().mockResolvedValue([
        { id: 'team1', organizationId: 'org1' },
        { id: 'team2', organizationId: 'org2' }
      ])
    } as never

    expect(
      await teamPermissionsHelper.getPermissions(
        [],
        [
          { userId: 'user1', organizationId: 'org1', roles: [OrgRole.MEMBER] },
          { userId: 'user1', organizationId: 'org2', roles: [OrgRole.ADMIN] }
        ]
      )
    ).toEqual({
      team1: [TeamPermission.VIEW_INFO],
      team2: [
        TeamPermission.VIEW_INFO,
        TeamPermission.VIEW_POSTS,
        TeamPermission.SET_USER_ROLES
      ]
    })

    expect(prisma.team.findMany).toHaveBeenCalledWith({
      where: { organizationId: { in: ['org1', 'org2'] } }
    })
  })

  test.each([
    [TeamPermission.VIEW_POSTS, 'team1', true],
    [TeamPermission.VIEW_POSTS, 'team2', false],
    [TeamPermission.EDIT_ANY_POST, 'team1', false],
    [TeamPermission.VIEW_POSTS, { id: 'team1' }, true]
  ])('can(%p, %p)', (permission, team, expected) => {
    const permissions = {
      userId: 'user1',
      organizations: {},
      teams: { team1: [TeamPermission.VIEW_POSTS] }
    } as PermissionsList

    expect(
      teamPermissionsHelper.can(permissions, permission, team as never)
    ).toBe(expected)
  })

  test('filter()', () => {
    expect(
      teamPermissionsHelper.getFilter({
        teams: {
          // Explicitly check that an empty array doesn't accidentally confer permissions
          team1: [],
          team2: [TeamPermission.VIEW_INFO]
        }
      } as never)
    ).toEqual({ id: { in: ['team2'] } })
  })
})
