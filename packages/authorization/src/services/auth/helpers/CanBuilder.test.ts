import { OrgPermission, PostPermission, TeamPermission } from '../permissions'
import { PermissionsList } from '../types'
import { CanBuilder } from './CanBuilder'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { PostPermissionsHelper } from './PostPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

describe('CanBuilder', () => {
  const permissionsList: PermissionsList = {
    userId: 'user123',
    teams: {},
    organizations: {}
  }
  let postPermissionsHelper: PostPermissionsHelper
  let orgPermissionsHelper: OrgPermissionsHelper
  let teamPermissionsHelper: TeamPermissionsHelper
  let canBuilder: CanBuilder

  beforeEach(() => {
    postPermissionsHelper = {} as PostPermissionsHelper
    orgPermissionsHelper = {} as OrgPermissionsHelper
    teamPermissionsHelper = {} as TeamPermissionsHelper
    canBuilder = new CanBuilder(
      postPermissionsHelper,
      orgPermissionsHelper,
      teamPermissionsHelper
    )
  })

  test('post permission', () => {
    const post = { id: '1234' }

    postPermissionsHelper.can = jest.fn().mockReturnValue(true)

    expect(canBuilder.getCan(permissionsList)(PostPermission.VIEW, post)).toBe(
      true
    )

    expect(postPermissionsHelper.can).toHaveBeenCalledWith(
      permissionsList,
      PostPermission.VIEW,
      post
    )
  })

  test('org permission', () => {
    orgPermissionsHelper.can = jest.fn().mockReturnValue(true)

    expect(
      canBuilder.getCan(permissionsList)(OrgPermission.VIEW_INFO, 'org123')
    ).toBe(true)

    expect(orgPermissionsHelper.can).toHaveBeenCalledWith(
      permissionsList,
      OrgPermission.VIEW_INFO,
      'org123'
    )
  })

  test('team permission', () => {
    teamPermissionsHelper.can = jest.fn().mockReturnValue(true)

    expect(
      canBuilder.getCan(permissionsList)(TeamPermission.VIEW_INFO, 'team123')
    ).toBe(true)

    expect(teamPermissionsHelper.can).toHaveBeenCalledWith(
      permissionsList,
      TeamPermission.VIEW_INFO,
      'team123'
    )
  })
})
