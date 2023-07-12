import { OrgRole } from '@prisma/client'
import { OrgPermission } from '../permissions'
import { PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'

describe('OrgPermissionsHelper', () => {
  let orgPermissionsHelper: OrgPermissionsHelper

  beforeEach(() => {
    orgPermissionsHelper = new OrgPermissionsHelper()
  })

  it('getPermissions() should deduplicate permissions', async () => {
    expect(
      await orgPermissionsHelper.getPermissions([
        {
          userId: 'user1',
          organizationId: 'org1',
          roles: [OrgRole.MEMBER, OrgRole.ADMIN]
        },
        {
          userId: 'user1',
          organizationId: 'org2',
          roles: [OrgRole.MEMBER]
        }
      ])
    ).toEqual({
      org1: [OrgPermission.VIEW_INFO, OrgPermission.SET_USER_ROLES],
      org2: [OrgPermission.VIEW_INFO]
    })
  })

  test.each([
    [OrgPermission.VIEW_INFO, 'org1', true],
    [OrgPermission.VIEW_INFO, 'org2', false],
    [OrgPermission.SET_USER_ROLES, 'org1', false],
    [OrgPermission.VIEW_INFO, { id: 'org1' }, true]
  ])('can(%p, %p)', (permission, org, expected) => {
    const permissions = {
      userId: 'user1',
      organizations: { org1: [OrgPermission.VIEW_INFO] },
      teams: {}
    } as PermissionsList

    expect(
      orgPermissionsHelper.can(permissions, permission, org as never)
    ).toBe(expected)
  })

  test('filter()', () => {
    expect(
      orgPermissionsHelper.getFilter({
        organizations: {
          // Explicitly check that an empty array doesn't accidentally confer permissions
          org1: [],
          org2: [OrgPermission.VIEW_INFO]
        }
      } as never)
    ).toEqual({ id: { in: ['org2'] } })
  })
})
