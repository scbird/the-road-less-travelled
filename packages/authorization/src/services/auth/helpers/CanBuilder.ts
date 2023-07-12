import { Organization, Post, Team } from '@prisma/client'
import { Service } from 'typedi'
import { OrgPermission, PostPermission, TeamPermission } from '../permissions'
import { CanFunction, PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { PostPermissionsHelper } from './PostPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

@Service()
export class CanBuilder {
  constructor(
    private readonly postPermissionsHelper: PostPermissionsHelper,
    private readonly orgPermissionsHelper: OrgPermissionsHelper,
    private readonly teamPermissionsHelper: TeamPermissionsHelper
  ) {}

  getCan(permissions: PermissionsList): CanFunction {
    return (permission, objectOrId) => {
      if (Object.values<string>(OrgPermission).includes(permission)) {
        return this.orgPermissionsHelper.can(
          permissions,
          permission as OrgPermission,
          objectOrId as string | Organization
        )
      } else if (Object.values<string>(TeamPermission).includes(permission)) {
        return this.teamPermissionsHelper.can(
          permissions,
          permission as TeamPermission,
          objectOrId as string | Team
        )
      } else if (Object.values<string>(PostPermission).includes(permission)) {
        if (typeof objectOrId === 'string') {
          throw new Error('Posts cannot be passed by ID')
        }

        return this.postPermissionsHelper.can(
          permissions,
          permission as PostPermission,
          objectOrId as Post
        )
      } else {
        throw new Error(`Unknown permission: ${permission}`)
      }
    }
  }
}
