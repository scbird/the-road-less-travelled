import { injectable } from 'tsyringe'
import { DatabaseFilters, PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { PostPermissionsHelper } from './PostPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

@injectable()
export class FiltersBuilder {
  constructor(
    private readonly postPermissionsHelper: PostPermissionsHelper,
    private readonly orgPermissionsHelper: OrgPermissionsHelper,
    private readonly teamPermissionsHelper: TeamPermissionsHelper
  ) {}

  getFilters(permissions: PermissionsList): DatabaseFilters {
    return {
      post: this.postPermissionsHelper.getFilter(permissions),
      org: this.orgPermissionsHelper.getFilter(permissions),
      team: this.teamPermissionsHelper.getFilter(permissions)
    }
  }
}
