import { CanFunction, DatabaseFilters, PermissionsList } from '../../auth/types'

export interface RequestContext {
  permissions: PermissionsList
  filters: DatabaseFilters
  can: CanFunction
}
