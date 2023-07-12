import { Service } from 'typedi'
import { DatabaseFilters, PermissionsList } from '../types'
import { OrgPermissionsHelper } from './OrgPermissionsHelper'
import { TeamPermissionsHelper } from './TeamPermissionsHelper'

@Service()
export class FiltersBuilder {
  constructor(
    private readonly orgPermissionsHelper: OrgPermissionsHelper,
    private readonly teamPermissionsHelper: TeamPermissionsHelper
  ) {}

  getFilters(permissions: PermissionsList): DatabaseFilters {
    return {
      org: this.orgPermissionsHelper.getFilter(permissions),
      team: this.teamPermissionsHelper.getFilter(permissions)
    }
  }
}
