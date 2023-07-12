import { Prisma } from '@prisma/client'
import { OrgPermission, TeamPermission } from './permissions'

export interface PermissionsList {
  userId: string
  organizations: Record<string, OrgPermission[]>
  teams: Record<string, TeamPermission[]>
}

export type CanFunction<Permission = string, ObjectType = unknown> = (
  permission: Permission,
  objectOrId: ObjectType
) => boolean

export interface DatabaseFilters {
  org: Prisma.OrganizationWhereInput
  team: Prisma.TeamWhereInput
  post: Prisma.PostWhereInput
}
